# LOOKTV Match Night

A cinematic Valentine's matching experience for live events. Participants answer personality questions on their phones, and the system generates compatibility matches revealed on a big screen.

## Features

- 📱 **Mobile-first quiz experience** - Participants join via QR code
- 🎬 **Cinematic design** - Film grain, spotlights, warm color palette
- ⚡ **Real-time updates** - Live participant counts and auto-updating big screen
- 💕 **Smart matching** - Compatibility algorithm based on answer similarity
- 🎯 **Category grouping** - Matches organized by personality types

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Participant quiz experience |
| `/admin` | Admin dashboard (password protected) |
| `/screen` | Big screen reveal mode |

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand with localStorage persistence
- **Database**: Supabase (PostgreSQL + Realtime)

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Settings > API** and copy your project URL and anon key

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

```bash
npm run build
npm start
```

## Event Flow

### Before Event
1. Set up Supabase database
2. Deploy the app
3. Generate QR code pointing to your domain
4. Test with a few participants

### During Event
1. Display QR code for participants to scan
2. Monitor `/admin` for participant counts
3. When ready, click "Compute Matches"
4. Open `/screen` on the big display
5. Matches appear with cinematic animations

### After Event
1. Use "Reset Event" in admin to clear all data

## Database Schema

### participants
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| nickname | text | Display name |
| gender | text | 'male' or 'female' |
| answers | jsonb | Question answers |
| completed | boolean | Quiz finished |
| created_at | timestamp | Join time |

### matches
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| male_id | uuid | Male participant |
| female_id | uuid | Female participant |
| similarity_score | integer | Match percentage |
| category | text | Personality category |
| revealed | boolean | Shown on screen |

## Matching Algorithm

1. Filter completed participants by gender
2. Calculate similarity score for each male-female pair
3. Sort pairs by score (highest first)
4. Greedy matching: assign each person to their best available match
5. Determine category based on dominant answer pattern

### Similarity Score
```
score = (matching_answers / total_questions) * 100
```

### Categories
- **Adventure Seekers** - Dominant 'a' answers
- **Deep Minds** - Dominant 'b' answers  
- **Rom-com Hearts** - Dominant 'c' answers
- **Late-night Souls** - Dominant 'd' answers

## Customization

### Adding Questions

Edit `src/lib/questions.ts`:

```typescript
{
  id: 13,
  category: "New Category",
  text: "Your question here?",
  options: [
    { id: "a", text: "Option A" },
    { id: "b", text: "Option B" },
    { id: "c", text: "Option C" },
    { id: "d", text: "Option D" }
  ]
}
```

### Changing Colors

Edit `tailwind.config.js` or `src/styles/globals.css`:

```css
:root {
  --accent-warm: #c9a87c;  /* Gold accent */
  --accent-rose: #d4707a;  /* Rose accent */
  --bg-deep: #0d0b0e;      /* Background */
}
```

## Scaling

The system is designed for 100+ concurrent users:

- Supabase handles database scaling automatically
- Realtime subscriptions are efficient
- Client-side state prevents unnecessary API calls
- localStorage backup ensures data isn't lost

For very large events (500+), consider:
- Upgrading Supabase plan
- Adding loading states for match generation
- Batching database writes

## Troubleshooting

### "Unable to connect to database"
- Check Supabase project is active
- Verify environment variables
- Check Supabase dashboard for errors

### "Matches not appearing"
- Ensure participants have completed the quiz
- Check browser console for errors
- Verify realtime is enabled in Supabase

### "Slow performance"
- Check network connection
- Verify Supabase region is close to users
- Consider upgrading Supabase plan

## License

MIT - Feel free to customize for your events!

---

Built with ❤️ for romantic connections
