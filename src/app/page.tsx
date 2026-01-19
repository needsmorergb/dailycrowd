import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's contest
    const contest = await prisma.contest.findFirst({
      where: {
        contestDate: { gte: today, lt: tomorrow }
      },
      include: {
        _count: { select: { entries: true } }
      }
    })

    // Get total stats
    const totalEntries = await prisma.entry.count()
    const settledContests = await prisma.contest.count({
      where: { status: 'settled' }
    })

    // Get recent winners (mock for now - would need winner tracking)
    const recentWinners = [
      { name: 'Alex_Player', amount: 1250 },
      { name: 'Jordan_Consensus', amount: 840 },
      { name: 'CaseStudy', amount: 2100 },
      { name: 'CrowdWhiz', amount: 950 },
    ]

    return {
      todayEntries: contest?._count.entries || 0,
      totalDistributed: settledContests * 1000, // $1000 per day
      historicalMedian: 48,
      activePlayers: totalEntries,
      recentWinners
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      todayEntries: 0,
      totalDistributed: 0,
      historicalMedian: 50,
      activePlayers: 0,
      recentWinners: []
    }
  }
}

export default async function LandingPage() {
  const stats = await getStats()

  return (
    <div className="py-8">
      <div className="container max-w-6xl">

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">

          {/* Left Column - Hero */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-8 h-full">
              {/* Round Active Badge */}
              <div className="mb-6">
                <span className="badge">
                  <span className="badge-dot"></span>
                  ROUND ACTIVE
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                MASTER THE <span className="text-primary italic">MEDIAN.</span>
              </h1>

              <p className="text-muted-foreground mb-8 max-w-md">
                Predict where the crowd lands. No algorithms, no luck
                —just pure social intelligence. The closest entries
                share the pool.
              </p>

              {/* Slider Input */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Slide to select guess</span>
                  <span className="text-4xl font-black text-primary font-mono">42</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  defaultValue="42"
                  className="slider w-full"
                  disabled
                />
              </div>

              {/* CTA Button */}
              <Link href="/account" className="btn btn-primary text-lg px-8">
                SUBMIT ENTRY →
              </Link>
            </div>
          </div>

          {/* Right Column - Pot & Countdown */}
          <div className="space-y-4">
            {/* Pot Display */}
            <div className="pot-display">
              <div className="pot-label">Member Rewards Pool</div>
              <div className="pot-value">$1,000</div>
              <div className="pot-usd">
                <span>💵</span>
                <span>USD Payout</span>
              </div>
            </div>

            {/* Countdown */}
            <div className="countdown-box">
              <div className="countdown-label">Round Ends In</div>
              <div className="countdown-timer">
                <div className="countdown-unit">
                  <div className="countdown-value">06</div>
                  <div className="countdown-unit-label">Hours</div>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-unit">
                  <div className="countdown-value">14</div>
                  <div className="countdown-unit-label">Mins</div>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-unit">
                  <div className="countdown-value">52</div>
                  <div className="countdown-unit-label">Secs</div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="benefits-list">
              <div className="benefits-title">
                <span>✧</span>
                CROWD Benefits
              </div>
              <div className="benefits-item">One entry per account per day</div>
              <div className="benefits-item">Live global leaderboards</div>
              <div className="benefits-item">Direct payouts to winners</div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.activePlayers.toLocaleString()}</div>
            <div className="stat-label">Active Players</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">${stats.totalDistributed.toLocaleString()}</div>
            <div className="stat-label">Total Distributed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{stats.historicalMedian}</div>
            <div className="stat-label">Historical Median</div>
          </div>
        </div>

        {/* Recent Winners */}
        <div className="mb-12">
          <div className="section-title">Latest Reward Winners</div>
          <div className="grid md:grid-cols-2 gap-4">
            {stats.recentWinners.map((winner, i) => (
              <div key={i} className="winner-row">
                <div className="winner-avatar">👤</div>
                <div className="winner-name">{winner.name}</div>
                <div className="winner-amount">${winner.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-12">
          <div className="section-title">Access the Game</div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Daily Pass */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Daily Entry</div>
              <div className="text-5xl font-black mb-2">$5</div>
              <div className="text-xs text-muted-foreground mb-6">per entry</div>
              <ul className="text-left space-y-3 mb-6 text-sm text-muted-foreground">
                <li>✓ 1 Entry today</li>
                <li>✓ Chance to win $1,000</li>
                <li>✓ See live stats</li>
              </ul>
              <Link href="/account" className="btn btn-secondary w-full">Buy Entry</Link>
            </div>

            {/* Monthly Sub */}
            <div className="glass-card neon-border rounded-2xl p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase">Best Value</span>
              </div>
              <div className="text-xs uppercase tracking-widest text-primary mb-4">Monthly Pass</div>
              <div className="text-5xl font-black mb-2">$49</div>
              <div className="text-xs text-muted-foreground mb-6">/ month</div>
              <ul className="text-left space-y-3 mb-6 text-sm">
                <li className="text-white">✓ Daily entries included</li>
                <li className="text-white">✓ Save $100+/month</li>
                <li className="text-white">✓ Advanced analytics</li>
                <li className="text-white">✓ Priority support</li>
              </ul>
              <Link href="/account" className="btn btn-primary w-full">Subscribe</Link>
            </div>
          </div>
        </div>

        {/* Transparency */}
        <div className="glass-card rounded-2xl p-8 mb-12">
          <div className="section-title">💰 Prize Pool Transparency</div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-primary mb-2">$1,000</div>
              <div className="text-sm text-muted-foreground">Fixed Daily Prize</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-2">$5</div>
              <div className="text-sm text-muted-foreground">Entry Fee</div>
            </div>
            <div>
              <div className="text-3xl font-black text-secondary mb-2">Winner</div>
              <div className="text-sm text-muted-foreground">Takes All</div>
            </div>
          </div>
          <div className="border-t border-muted mt-6 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              <Link href="/rules" className="text-primary hover:underline">Read full rules & fee breakdown →</Link>
            </p>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-muted-foreground text-sm">
            <span>🔒</span>
            <span className="font-mono">SECURED BY WHOP</span>
          </div>
        </div>

      </div>
    </div>
  )
}
