export interface Question {
  id: number;
  category: string;
  text: string;
  options: { id: string; text: string }[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Movie Vibes",
    text: "It's Friday night. What's playing?",
    options: [
      { id: "a", text: "A thriller that keeps me guessing" },
      { id: "b", text: "A heartfelt romantic drama" },
      { id: "c", text: "A comedy to forget everything" },
      { id: "d", text: "A documentary about something fascinating" }
    ]
  },
  {
    id: 2,
    category: "First Chapter",
    text: "The perfect first date looks like…",
    options: [
      { id: "a", text: "An adventure — hiking, exploring, something new" },
      { id: "b", text: "Cozy dinner with deep conversation" },
      { id: "c", text: "Something fun — arcade, bowling, mini golf" },
      { id: "d", text: "Coffee and a long walk with no plan" }
    ]
  },
  {
    id: 3,
    category: "Love Language",
    text: "How do you show someone you care?",
    options: [
      { id: "a", text: "Acts of service — I help before you ask" },
      { id: "b", text: "Words — I tell them how I feel" },
      { id: "c", text: "Quality time — I'm fully present" },
      { id: "d", text: "Small surprises and thoughtful gifts" }
    ]
  },
  {
    id: 4,
    category: "Conflict Style",
    text: "When there's tension, you…",
    options: [
      { id: "a", text: "Address it directly — let's talk it out" },
      { id: "b", text: "Need some space first, then talk" },
      { id: "c", text: "Try to lighten the mood" },
      { id: "d", text: "Write it out — I express better that way" }
    ]
  },
  {
    id: 5,
    category: "Weekend Energy",
    text: "Your ideal Sunday looks like…",
    options: [
      { id: "a", text: "Brunch with friends, then spontaneous plans" },
      { id: "b", text: "Lazy morning, book, maybe a nap" },
      { id: "c", text: "Active day — gym, errands, productivity" },
      { id: "d", text: "Exploring somewhere new in the city" }
    ]
  },
  {
    id: 6,
    category: "Social Battery",
    text: "After a long week, you recharge by…",
    options: [
      { id: "a", text: "Going out with friends" },
      { id: "b", text: "Complete alone time" },
      { id: "c", text: "One-on-one time with someone close" },
      { id: "d", text: "A mix — some social, some solo" }
    ]
  },
  {
    id: 7,
    category: "Dream Escape",
    text: "If you could travel anywhere tomorrow…",
    options: [
      { id: "a", text: "Tokyo — neon lights and hidden gems" },
      { id: "b", text: "Paris — art, cafés, romance" },
      { id: "c", text: "Bali — beaches and spiritual vibes" },
      { id: "d", text: "Iceland — nature and northern lights" }
    ]
  },
  {
    id: 8,
    category: "Emotional Connection",
    text: "What makes you feel truly understood?",
    options: [
      { id: "a", text: "When someone remembers the small things" },
      { id: "b", text: "When I can be completely myself" },
      { id: "c", text: "When someone makes me laugh" },
      { id: "d", text: "When we can share comfortable silence" }
    ]
  },
  {
    id: 9,
    category: "Future Vision",
    text: "In 5 years, you see yourself…",
    options: [
      { id: "a", text: "Building a career I'm passionate about" },
      { id: "b", text: "Traveling and collecting experiences" },
      { id: "c", text: "Settled down, creating a cozy home" },
      { id: "d", text: "Who knows? I love the unknown" }
    ]
  },
  {
    id: 10,
    category: "Morning Ritual",
    text: "Your morning alarm goes off. You…",
    options: [
      { id: "a", text: "Jump up ready to conquer the day" },
      { id: "b", text: "Snooze at least twice (or five times)" },
      { id: "c", text: "Slowly wake up with coffee ritual" },
      { id: "d", text: "Depends entirely on what I'm waking up for" }
    ]
  },
  {
    id: 11,
    category: "Movie Scene",
    text: "Pick the scene that resonates most:",
    options: [
      { id: "a", text: "Running through the rain to confess feelings" },
      { id: "b", text: "Quiet moment watching the sunset together" },
      { id: "c", text: "Dancing in the kitchen at midnight" },
      { id: "d", text: "Road trip with the windows down" }
    ]
  },
  {
    id: 12,
    category: "The Spark",
    text: "What first attracts you to someone?",
    options: [
      { id: "a", text: "Their energy and confidence" },
      { id: "b", text: "Their kindness and warmth" },
      { id: "c", text: "Their sense of humor" },
      { id: "d", text: "Their curiosity and depth" }
    ]
  }
];

export const MATCH_CATEGORIES: Record<string, { title: string; emoji: string }> = {
  'adventure': { title: 'Adventure Seekers', emoji: '✨' },
  'deep': { title: 'Deep Minds', emoji: '🌙' },
  'romcom': { title: 'Rom-com Hearts', emoji: '💕' },
  'latenight': { title: 'Late-night Souls', emoji: '🌃' },
};

export function determineCategory(answers: Record<number, string>): string {
  const values = Object.values(answers);
  const counts: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
  
  values.forEach(v => {
    if (counts[v] !== undefined) counts[v]++;
  });
  
  const dominant = Object.entries(counts).sort((x, y) => y[1] - x[1])[0][0];
  
  switch (dominant) {
    case 'a': return 'adventure';
    case 'b': return 'deep';
    case 'c': return 'romcom';
    default: return 'latenight';
  }
}

export function calculateSimilarity(
  answers1: Record<number, string>,
  answers2: Record<number, string>
): number {
  let matches = 0;
  let total = 0;
  
  for (const qId in answers1) {
    if (answers2[qId]) {
      total++;
      if (answers1[qId] === answers2[qId]) matches++;
    }
  }
  
  return total > 0 ? Math.round((matches / total) * 100) : 0;
}
