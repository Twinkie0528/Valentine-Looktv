import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { QUESTIONS } from '@/lib/questions';

// ============ ENTRY SCREEN ============
function EntryScreen({ onStart }: { onStart: () => void }) {
  const { nickname, gender, setNickname, setGender, createParticipant } = useAppStore();
  const [loading, setLoading] = useState(false);

  const canStart = nickname.trim().length > 0 && gender !== null;

  const handleStart = async () => {
    if (!canStart) return;
    setLoading(true);
    const id = await createParticipant();
    if (id) {
      onStart();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] text-center">
        {/* Brand */}
        <p 
          className="text-[10px] font-normal tracking-[5px] uppercase text-text-dim mb-16 opacity-0"
          style={{ animation: 'fadeUp 1s ease 0.2s forwards' }}
        >
          LOOKTV Presents
        </p>

        {/* Title */}
        <h1 
          className="font-serif text-[clamp(52px,14vw,72px)] font-light leading-[0.95] tracking-tight mb-5 opacity-0"
          style={{ animation: 'fadeUp 1s ease 0.4s forwards' }}
        >
          Match<br />
          <em className="text-accent-warm">Night</em>
        </h1>

        {/* Tagline */}
        <p 
          className="font-serif text-lg font-light italic text-text-secondary mb-16 opacity-0"
          style={{ animation: 'fadeUp 1s ease 0.6s forwards' }}
        >
          "Tonight, choices become connections."
        </p>

        {/* Form */}
        <div 
          className="opacity-0"
          style={{ animation: 'fadeUp 1s ease 0.8s forwards' }}
        >
          {/* Nickname */}
          <div className="mb-8 text-left">
            <label className="block text-[10px] font-normal tracking-[3px] uppercase text-text-dim mb-3 ml-1">
              Your Name
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="What should we call you?"
              maxLength={20}
              className="w-full py-5 px-0 bg-transparent border-0 border-b border-white/10 font-serif text-2xl font-normal text-text-primary placeholder:text-text-dim placeholder:italic outline-none transition-colors focus:border-accent-warm"
            />
          </div>

          {/* Gender */}
          <div className="mb-8 text-left">
            <label className="block text-[10px] font-normal tracking-[3px] uppercase text-text-dim mb-3 ml-1">
              I Am
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex-1 py-5 px-4 rounded-full border transition-all duration-300 flex items-center justify-center gap-2.5 ${
                  gender === 'male'
                    ? 'bg-accent-warm/15 border-accent-warm'
                    : 'bg-transparent border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                }`}
              >
                <span className={`text-lg transition-opacity ${gender === 'male' ? 'opacity-100' : 'opacity-60'}`}>♂</span>
                <span className={`text-sm font-normal transition-colors ${gender === 'male' ? 'text-text-primary' : 'text-text-secondary'}`}>Male</span>
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex-1 py-5 px-4 rounded-full border transition-all duration-300 flex items-center justify-center gap-2.5 ${
                  gender === 'female'
                    ? 'bg-accent-rose/15 border-accent-rose'
                    : 'bg-transparent border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                }`}
              >
                <span className={`text-lg transition-opacity ${gender === 'female' ? 'opacity-100' : 'opacity-60'}`}>♀</span>
                <span className={`text-sm font-normal transition-colors ${gender === 'female' ? 'text-text-primary' : 'text-text-secondary'}`}>Female</span>
              </button>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!canStart || loading}
            className="w-full mt-12 py-[22px] px-10 btn-gradient rounded-full text-[13px] font-normal tracking-[3px] uppercase text-bg-deep transition-all duration-500 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Joining...' : 'Start My Movie Night'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ QUIZ SCREEN ============
function QuizScreen({ onComplete }: { onComplete: () => void }) {
  const { answers, currentQuestion, setAnswer, nextQuestion, markCompleted } = useAppStore();
  const [transitioning, setTransitioning] = useState(false);
  
  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;

  const handleSelect = async (optionId: string) => {
    setAnswer(question.id, optionId);
    
    setTransitioning(true);
    
    setTimeout(async () => {
      if (isLastQuestion) {
        await markCompleted();
        onComplete();
      } else {
        nextQuestion();
      }
      setTransitioning(false);
    }, 500);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col relative">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/[0.08] z-50">
        <div 
          className="h-full bg-gradient-to-r from-accent-warm to-accent-rose transition-all duration-700 ease-out progress-glow relative"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Counter */}
      <div className="fixed top-6 right-6 z-50">
        <span className="font-serif text-sm font-normal text-text-dim">
          <span className="text-text-secondary">{currentQuestion + 1}</span> / {QUESTIONS.length}
        </span>
      </div>

      {/* Question content */}
      <div className="flex-1 flex flex-col justify-center px-8 py-20">
        <div 
          className={`max-w-[500px] mx-auto w-full transition-all duration-300 ${
            transitioning ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Category */}
          <p 
            className="text-[11px] font-normal tracking-[4px] uppercase text-accent-warm mb-6 opacity-0"
            style={{ animation: 'fadeUp 0.7s ease forwards' }}
          >
            {question.category}
          </p>

          {/* Question */}
          <h2 
            className="font-serif text-[clamp(28px,7vw,38px)] font-light leading-[1.3] text-text-primary mb-12 opacity-0"
            style={{ animation: 'fadeUp 0.7s ease 0.1s forwards' }}
          >
            {question.text}
          </h2>

          {/* Options */}
          <div className="flex flex-col gap-3.5">
            {question.options.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={transitioning}
                className={`p-6 rounded-2xl border text-left transition-all duration-300 opacity-0 relative overflow-hidden group ${
                  answers[question.id] === opt.id
                    ? 'bg-accent-rose/15 border-accent-rose'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] hover:-translate-y-0.5'
                }`}
                style={{ animation: `optionReveal 0.5s ease ${0.2 + i * 0.1}s forwards` }}
              >
                {/* Gradient overlay on selected */}
                <div className={`absolute inset-0 bg-gradient-to-br from-accent-warm to-accent-rose transition-opacity duration-300 ${
                  answers[question.id] === opt.id ? 'opacity-[0.08]' : 'opacity-0'
                }`} />
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-serif text-[15px] font-medium flex-shrink-0 transition-all duration-300 ${
                    answers[question.id] === opt.id
                      ? 'bg-accent-rose text-bg-deep'
                      : 'bg-white/[0.05] text-text-dim'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className={`text-[15px] font-light leading-relaxed transition-colors duration-300 ${
                    answers[question.id] === opt.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                  }`}>
                    {opt.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ WAITING SCREEN ============
function WaitingScreen() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-6 text-center">
      <div className="max-w-[400px]">
        {/* Icon */}
        <div 
          className="w-[100px] h-[100px] mx-auto mb-12 relative opacity-0"
          style={{ animation: 'fadeUp 1s ease 0.3s forwards' }}
        >
          <div className="absolute inset-0 border border-accent-warm/30 rounded-full animate-ring-pulse" />
          <div className="absolute inset-0 border border-accent-warm/30 rounded-full animate-ring-pulse" style={{ animationDelay: '1s' }} />
          <svg 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 fill-accent-warm animate-heart-glow"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>

        {/* Headline */}
        <h2 
          className="font-serif text-[clamp(32px,9vw,44px)] font-light leading-[1.2] mb-5 opacity-0"
          style={{ animation: 'fadeUp 1s ease 0.5s forwards' }}
        >
          Your story is <em className="text-accent-warm">written</em>
        </h2>

        {/* Subtext */}
        <p 
          className="font-serif text-[17px] font-light italic text-text-secondary mb-16 opacity-0"
          style={{ animation: 'fadeUp 1s ease 0.7s forwards' }}
        >
          Your choices are part of tonight's story.<br />Waiting for the matches…
        </p>

        {/* Status indicator */}
        <div 
          className="inline-flex items-center gap-3.5 py-3.5 px-7 bg-white/[0.03] border border-white/[0.08] rounded-full opacity-0"
          style={{ animation: 'fadeUp 1s ease 0.9s forwards' }}
        >
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 bg-accent-warm rounded-full animate-dot-fade" />
            <span className="w-1.5 h-1.5 bg-accent-warm rounded-full animate-dot-fade" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 bg-accent-warm rounded-full animate-dot-fade" style={{ animationDelay: '0.4s' }} />
          </div>
          <span className="text-xs font-normal tracking-[2px] uppercase text-text-dim">
            Finding your match
          </span>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function Home() {
  const { participantId, completed, reset } = useAppStore();
  const [screen, setScreen] = useState<'entry' | 'quiz' | 'waiting'>('entry');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Restore state from localStorage
    if (participantId) {
      if (completed) {
        setScreen('waiting');
      } else {
        setScreen('quiz');
      }
    }
  }, [participantId, completed]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent-warm/30 border-t-accent-warm rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative z-10">
      {screen === 'entry' && (
        <EntryScreen onStart={() => setScreen('quiz')} />
      )}
      
      {screen === 'quiz' && (
        <QuizScreen onComplete={() => setScreen('waiting')} />
      )}
      
      {screen === 'waiting' && (
        <WaitingScreen />
      )}

      {/* Dev reset button - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => {
            reset();
            setScreen('entry');
          }}
          className="fixed bottom-4 left-4 px-3 py-1.5 text-xs bg-white/10 rounded-full text-text-dim hover:bg-white/20 z-50"
        >
          Reset
        </button>
      )}
    </main>
  );
}
