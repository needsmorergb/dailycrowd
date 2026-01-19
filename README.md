# CROWD 👁️

A daily crowd intelligence game where users submit a number 1-100, and the closest to the median wins. Monetized via Whop for membership access.

## Features

- **Daily Contests**: Submit one number per day (1-100)
- **Real-time Countdown**: See exactly when entries lock
- **Transparent Results**: Full statistics and distribution charts
- **Whop Integration**: Monthly membership or daily entry passes
- **Admin Dashboard**: Create contests, settle results, export data

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Auth**: NextAuth.js
- **Payments**: Whop SDK
- **Charts**: Chart.js

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd median-hunt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your values:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - Whop credentials from [Whop Developer Dashboard](https://whop.com/developers)
   - Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com) (optional)

4. **Initialize the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

## Whop Setup

### Creating Products

1. Go to [Whop](https://whop.com) and create a new company
2. Create two products:
   - **Monthly Membership**: Recurring subscription ($19/month suggested)
   - **Daily Entry**: One-time purchase ($1 suggested)
3. Note the Product IDs and add them to your `.env`

### OAuth Configuration

1. In Whop Developer Dashboard, create an OAuth app
2. Set the redirect URI to `https://yourdomain.com/api/auth/callback/whop`
3. Add the Client ID and Secret to your `.env`

### Webhook Setup

1. In Whop Developer Dashboard, set up webhooks
2. Point to `https://yourdomain.com/api/whop`
3. Add the Webhook Secret to your `.env`

## Admin Access

1. Sign in with any account
2. Navigate to `/admin`
3. In production, restrict access by checking `user.role === 'admin'`

To make a user an admin, update the database directly:
```bash
npx prisma db push
# Then in your database, set role = 'admin' for your user
```

## Daily Operations

### Automatic Contest Creation

Set up a cron job to hit the `/api/cron` endpoint daily at midnight:

**Vercel Cron (recommended)**:
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 0 * * *"
  }]
}
```

**External Cron Service**:
```bash
curl -X POST https://yourdomain.com/api/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Settling Contests

1. Wait until entries are locked
2. Go to Admin Dashboard
3. Click "Settle" on locked contests

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── account/page.tsx      # Sign in / profile
│   ├── today/page.tsx        # Today's contest
│   ├── results/page.tsx      # Past results list
│   ├── results/[date]/page.tsx  # Contest detail
│   ├── rules/page.tsx        # Official rules
│   ├── admin/page.tsx        # Admin dashboard
│   └── api/                   # API routes
├── components/               # React components
├── lib/                      # Utilities
│   ├── prisma.ts            # Database client
│   ├── auth.ts              # NextAuth config
│   ├── game.ts              # Game logic
│   ├── whop.ts              # Whop integration
│   └── utils.ts             # Helpers
└── types/                   # TypeScript types
```

## Game Logic

### Median Calculation

```typescript
// Sort all entries and find the middle value
// If even count, average the two middle numbers
const median = calculateMedian(entries) // Can be .5
```

### Winner Selection

1. **Primary**: Smallest absolute distance to median
2. **Tie-breaker #1**: Didn't exceed the median
3. **Tie-breaker #2**: Earliest timestamp

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the production bundle:
```bash
npm run build
npm start
```

## License

MIT

---

Built with ❤️ using Next.js and Whop
