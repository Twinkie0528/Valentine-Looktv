import { useState, useEffect, useCallback } from 'react';
import { supabase, Participant, Match } from '@/lib/supabase';
import { QUESTIONS, calculateSimilarity, determineCategory, MATCH_CATEGORIES } from '@/lib/questions';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Stats
  const total = participants.length;
  const males = participants.filter(p => p.gender === 'male').length;
  const females = participants.filter(p => p.gender === 'female').length;
  const completed = participants.filter(p => p.completed).length;

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [participantsRes, matchesRes] = await Promise.all([
        supabase.from('participants').select('*').order('created_at', { ascending: false }),
        supabase.from('matches').select('*').order('created_at', { ascending: true })
      ]);

      if (participantsRes.data) setParticipants(participantsRes.data);
      if (matchesRes.data) setMatches(matchesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!authenticated) return;

    fetchData();

    // Subscribe to participants changes
    const participantsChannel = supabase
      .channel('participants-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => fetchData()
      )
      .subscribe();

    // Subscribe to matches changes
    const matchesChannel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(matchesChannel);
    };
  }, [authenticated, fetchData]);

  // Generate matches
  const generateMatches = async () => {
    setGenerating(true);

    try {
      const completedParticipants = participants.filter(p => p.completed);
      const maleParticipants = completedParticipants.filter(p => p.gender === 'male');
      const femaleParticipants = completedParticipants.filter(p => p.gender === 'female');

      if (maleParticipants.length === 0 || femaleParticipants.length === 0) {
        alert('Need at least one completed male and female participant.');
        setGenerating(false);
        return;
      }

      // Calculate all compatibility scores
      const scores: { male: Participant; female: Participant; score: number }[] = [];
      
      for (const male of maleParticipants) {
        for (const female of femaleParticipants) {
          const score = calculateSimilarity(male.answers, female.answers);
          scores.push({ male, female, score });
        }
      }

      // Sort by score descending
      scores.sort((a, b) => b.score - a.score);

      // Greedy matching
      const usedMales = new Set<string>();
      const usedFemales = new Set<string>();
      const newMatches: { male_id: string; female_id: string; similarity_score: number; category: string }[] = [];

      for (const { male, female, score } of scores) {
        if (!usedMales.has(male.id) && !usedFemales.has(female.id)) {
          const category = determineCategory(male.answers);
          newMatches.push({
            male_id: male.id,
            female_id: female.id,
            similarity_score: score,
            category,
          });
          usedMales.add(male.id);
          usedFemales.add(female.id);
        }
      }

      // Clear existing matches and insert new ones
      await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (newMatches.length > 0) {
        await supabase.from('matches').insert(newMatches);
      }

      alert(`Generated ${newMatches.length} matches!`);
    } catch (error) {
      console.error('Error generating matches:', error);
      alert('Error generating matches. Check console.');
    } finally {
      setGenerating(false);
    }
  };

  // Reset event
  const resetEvent = async () => {
    if (!confirm('Are you sure you want to reset all data? This cannot be undone.')) return;

    try {
      await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      fetchData();
      alert('Event reset successfully!');
    } catch (error) {
      console.error('Error resetting event:', error);
      alert('Error resetting event.');
    }
  };

  // Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'matchnight2024';
    if (password === correctPassword) {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <main className="relative z-10 min-h-screen min-h-[100dvh] flex items-center justify-center p-6">
        <div className="w-full max-w-[320px] text-center">
          <h1 className="font-serif text-3xl font-light mb-2">Control Room</h1>
          <p className="text-sm text-text-dim mb-10">Enter admin password</p>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full py-4 px-5 bg-white/[0.03] border border-white/10 rounded-xl text-center text-text-primary placeholder:text-text-dim outline-none focus:border-accent-warm transition-colors mb-4"
            />
            <button
              type="submit"
              className="w-full py-4 btn-gradient rounded-xl text-sm font-normal tracking-wider uppercase text-bg-deep"
            >
              Enter
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 min-h-screen p-6 md:p-8">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="mb-12 animate-fade-up">
          <p className="text-[10px] font-normal tracking-[4px] uppercase text-text-dim mb-3">Control Room</p>
          <h1 className="font-serif text-[32px] font-light">Event Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { value: total, label: 'Joined' },
            { value: males, label: 'Male' },
            { value: females, label: 'Female' },
            { value: completed, label: 'Done' },
          ].map((stat, i) => (
            <div 
              key={stat.label}
              className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-center opacity-0"
              style={{ animation: `fadeUp 0.6s ease ${0.1 + i * 0.05}s forwards` }}
            >
              <div className="font-serif text-4xl font-light text-accent-warm leading-none mb-2">
                {stat.value}
              </div>
              <div className="text-[9px] font-normal tracking-[2px] uppercase text-text-dim">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div 
          className="flex flex-col gap-3 mb-10 opacity-0"
          style={{ animation: 'fadeUp 0.6s ease 0.3s forwards' }}
        >
          <button
            onClick={generateMatches}
            disabled={generating}
            className="py-[18px] px-8 btn-gradient rounded-xl text-[13px] font-normal tracking-[2px] uppercase text-bg-deep disabled:opacity-50"
          >
            {generating ? 'Generating...' : '✦ Compute Matches'}
          </button>
          
          <a
            href="/screen"
            target="_blank"
            rel="noopener noreferrer"
            className="py-[18px] px-8 bg-white/[0.03] border border-white/10 rounded-xl text-[13px] font-normal tracking-[2px] uppercase text-text-secondary text-center hover:bg-white/[0.06] hover:text-text-primary transition-all"
          >
            Open Big Screen
          </a>
          
          <button
            onClick={resetEvent}
            className="py-[18px] px-8 bg-white/[0.03] border border-white/10 rounded-xl text-[13px] font-normal tracking-[2px] uppercase text-text-secondary hover:bg-white/[0.06] hover:text-text-primary transition-all"
          >
            Reset Event
          </button>
        </div>

        {/* Matches */}
        {matches.length > 0 && (
          <div 
            className="mb-10 opacity-0"
            style={{ animation: 'fadeUp 0.6s ease 0.4s forwards' }}
          >
            <h3 className="font-serif text-xl font-light mb-5">
              Generated Matches ({matches.length})
            </h3>
            <div className="flex flex-col gap-2">
              {matches.map((match) => {
                const male = participants.find(p => p.id === match.male_id);
                const female = participants.find(p => p.id === match.female_id);
                const cat = MATCH_CATEGORIES[match.category] || { title: 'Matched', emoji: '💫' };
                
                return (
                  <div 
                    key={match.id}
                    className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-accent-warm">♂</span>
                      <span className="font-medium">{male?.nickname || 'Unknown'}</span>
                      <span className="text-text-dim">×</span>
                      <span className="text-accent-rose">♀</span>
                      <span className="font-medium">{female?.nickname || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-dim">{cat.emoji} {cat.title}</span>
                      <span className="px-2.5 py-1 bg-accent-gold/10 text-accent-gold text-xs rounded-full">
                        {match.similarity_score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Participants */}
        <div 
          className="opacity-0"
          style={{ animation: 'fadeUp 0.6s ease 0.5s forwards' }}
        >
          <h3 className="font-serif text-xl font-light mb-5">Participants</h3>
          
          {loading ? (
            <div className="text-center py-10 text-text-dim">Loading...</div>
          ) : participants.length === 0 ? (
            <div className="p-5 bg-white/[0.02] rounded-xl text-text-dim text-center">
              No participants yet
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              {participants.map((p) => (
                <div 
                  key={p.id}
                  className="p-4 bg-white/[0.02] rounded-xl flex items-center gap-3.5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
                    p.gender === 'male' ? 'bg-accent-warm/15' : 'bg-accent-rose/15'
                  }`}>
                    {p.gender === 'male' ? '♂' : '♀'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.nickname}</div>
                    <div className="text-[11px] text-text-dim">
                      {Object.keys(p.answers).length}/{QUESTIONS.length} answered
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wider uppercase ${
                    p.completed 
                      ? 'bg-green-500/15 text-green-400' 
                      : 'bg-accent-gold/15 text-accent-gold'
                  }`}>
                    {p.completed ? 'Done' : 'Active'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
