import { useState, useEffect, useCallback } from 'react';
import { supabase, Participant, Match } from '@/lib/supabase';
import { MATCH_CATEGORIES } from '@/lib/questions';

interface MatchWithNames extends Match {
  maleName: string;
  femaleName: string;
}

export default function ScreenPage() {
  const [matches, setMatches] = useState<MatchWithNames[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Group matches by category
  const groupedMatches = matches.reduce((acc, match) => {
    const cat = match.category || 'default';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(match);
    return acc;
  }, {} as Record<string, MatchWithNames[]>);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [matchesRes, participantsRes] = await Promise.all([
        supabase.from('matches').select('*').order('created_at', { ascending: true }),
        supabase.from('participants').select('*')
      ]);

      if (participantsRes.data) {
        setParticipants(participantsRes.data);
      }

      if (matchesRes.data && participantsRes.data) {
        const participantsMap = new Map(participantsRes.data.map(p => [p.id, p]));
        
        const matchesWithNames = matchesRes.data.map(m => ({
          ...m,
          maleName: participantsMap.get(m.male_id)?.nickname || 'Unknown',
          femaleName: participantsMap.get(m.female_id)?.nickname || 'Unknown',
        }));
        
        setMatches(matchesWithNames);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup realtime subscriptions
  useEffect(() => {
    fetchData();

    // Subscribe to matches changes
    const matchesChannel = supabase
      .channel('screen-matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => fetchData()
      )
      .subscribe();

    // Subscribe to participants changes (for name updates)
    const participantsChannel = supabase
      .channel('screen-participants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [fetchData]);

  return (
    <main className="relative z-10 min-h-screen">
      {/* Enhanced background for big screen */}
      <div className="fixed inset-0 bg-bg-deep">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 60% at 50% -10%, rgba(201, 168, 124, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 80% 80% at 10% 90%, rgba(212, 112, 122, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 60% 70% at 95% 70%, rgba(232, 200, 139, 0.06) 0%, transparent 40%)
            `
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col p-8 md:p-16">
        {/* Header */}
        <div className="text-center mb-16">
          <p 
            className="text-[10px] md:text-xs font-normal tracking-[6px] uppercase text-text-dim mb-6 opacity-0"
            style={{ animation: 'fadeUp 1s ease 0.2s forwards' }}
          >
            LOOKTV Match Night
          </p>
          <h1 
            className="font-serif text-[clamp(48px,10vw,80px)] font-light leading-none opacity-0"
            style={{ animation: 'fadeUp 1s ease 0.4s forwards' }}
          >
            Tonight's<br />
            <em className="text-accent-warm">Matches</em>
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto pb-16">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-accent-warm/30 border-t-accent-warm rounded-full animate-spin" />
            </div>
          ) : matches.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h2 
                className="font-serif text-[clamp(28px,6vw,40px)] font-light mb-4 opacity-0"
                style={{ animation: 'fadeUp 1s ease 0.6s forwards' }}
              >
                The magic is brewing…
              </h2>
              <p 
                className="font-serif text-lg font-light italic text-text-secondary opacity-0"
                style={{ animation: 'fadeUp 1s ease 0.8s forwards' }}
              >
                Matches will be revealed shortly
              </p>
            </div>
          ) : (
            <div className="w-full max-w-[900px] flex flex-col gap-12">
              {Object.entries(groupedMatches).map(([category, categoryMatches], catIndex) => {
                const catInfo = MATCH_CATEGORIES[category] || { title: 'Matched', emoji: '💫' };
                
                return (
                  <div key={category}>
                    {/* Category title */}
                    <div 
                      className="text-center mb-8 opacity-0"
                      style={{ animation: `fadeUp 0.8s ease ${0.3 + catIndex * 0.2}s forwards` }}
                    >
                      <h2 className="font-serif text-2xl md:text-3xl font-light italic text-accent-warm">
                        {catInfo.emoji} {catInfo.title}
                      </h2>
                    </div>

                    {/* Match pairs */}
                    <div className="flex flex-col items-center gap-8">
                      {categoryMatches.map((match, matchIndex) => (
                        <div
                          key={match.id}
                          className="flex flex-col md:flex-row items-center gap-6 md:gap-10 p-8 md:p-10 bg-white/[0.02] border border-white/[0.06] rounded-3xl w-full max-w-[600px] opacity-0"
                          style={{ 
                            animation: `matchReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.5 + catIndex * 0.2 + matchIndex * 0.15}s forwards` 
                          }}
                        >
                          {/* Male */}
                          <div className="text-center min-w-[140px]">
                            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl md:text-4xl bg-gradient-to-br from-accent-warm/20 to-accent-warm/5 border border-accent-warm/30">
                              ♂
                            </div>
                            <div className="font-serif text-xl md:text-2xl font-normal">
                              {match.maleName}
                            </div>
                          </div>

                          {/* Heart connector */}
                          <div className="flex flex-row md:flex-col items-center gap-3">
                            <div className="relative w-14 h-14 flex items-center justify-center">
                              <div 
                                className="absolute inset-0 rounded-full animate-pulse-glow"
                                style={{ background: 'radial-gradient(circle, rgba(212, 112, 122, 0.3) 0%, transparent 70%)' }}
                              />
                              <svg 
                                className="w-7 h-7 fill-accent-rose relative z-10"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                            </div>
                            <div className="px-4 py-1.5 bg-accent-gold/10 rounded-full">
                              <span className="font-serif text-base text-accent-gold">
                                {match.similarity_score}%
                              </span>
                            </div>
                          </div>

                          {/* Female */}
                          <div className="text-center min-w-[140px]">
                            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl md:text-4xl bg-gradient-to-br from-accent-rose/20 to-accent-rose/5 border border-accent-rose/30">
                              ♀
                            </div>
                            <div className="font-serif text-xl md:text-2xl font-normal">
                              {match.femaleName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="font-serif text-sm italic text-text-dim">
            "Tonight, choices became connections."
          </p>
        </div>
      </div>
    </main>
  );
}
