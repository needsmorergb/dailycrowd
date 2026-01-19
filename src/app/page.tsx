import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SliderEntry from '@/components/SliderEntry'
import LiveCountdown from '@/components/LiveCountdown'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    // Get total entries ever
    const totalEntries = await prisma.entry.count()

    // Get settled contests for total distributed
    const settledContests = await prisma.contest.count({
      where: { status: 'settled' }
    })

    // Get recent winners from settled contests
    const recentResults = await prisma.result.findMany({
      take: 4,
      orderBy: { contest: { contestDate: 'desc' } },
      include: {
        contest: true
      }
    })

    return {
      totalDistributed: settledContests * 1000,
      activePlayers: totalEntries,
      historicalMedian: 48,
      hasWinners: settledContests > 0,
      recentWinners: recentResults.map((r, i) => ({
        name: `Winner_${i + 1}`,
        amount: 1000,
        number: r.winnerEntryNumber
      }))
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalDistributed: 0,
      activePlayers: 0,
      historicalMedian: 50,
      hasWinners: false,
      recentWinners: []
    }
  }
}

export default async function LandingPage() {
  const stats = await getStats()

  return (
    <div className="py-8">
      <div className="container max-w-6xl">

        {/* Main Grid Layout - 2 columns */}
        <div className="grid lg:grid-cols-5 gap-6 mb-12">

          {/* Left Column - Slider Entry (takes more space) */}
          <div className="lg:col-span-3">
            <SliderEntry />
          </div>

          {/* Right Column - Pot, Countdown, Benefits */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pot Display */}
            <div className="pot-display">
              <div className="pot-label">Daily Prize Pool</div>
              <div className="pot-value">$1,000</div>
              <div className="pot-usd">
                <span>💵</span>
                <span>Paid to winner</span>
              </div>
            </div>

            {/* Live Countdown */}
            <LiveCountdown lockTime="19:00" />

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

        {/* Stats Bar - Only show meaningful stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">$5</div>
            <div className="stat-label">Entry Fee</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">$1,000</div>
            <div className="stat-label">Daily Prize</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">1-100</div>
            <div className="stat-label">Number Range</div>
          </div>
        </div>

        {/* How It Works - Fill the space */}
        <div className="glass-card rounded-2xl p-8 mb-12">
          <div className="section-title">How It Works</div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">Pick a Number</h3>
              <p className="text-sm text-muted-foreground">Choose any integer between 1 and 100 using the slider</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">Wait for the Draw</h3>
              <p className="text-sm text-muted-foreground">Entries lock at 7:00 PM PT. Everyone's number is hidden until then.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">Closest Wins</h3>
              <p className="text-sm text-muted-foreground">The entry closest to the median of all submissions wins the $1,000 pot!</p>
            </div>
          </div>
        </div>

        {/* Recent Winners - Only show if there are winners */}
        {stats.hasWinners ? (
          <div className="mb-12">
            <div className="section-title">Latest Winners</div>
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
        ) : (
          <div className="glass-card rounded-2xl p-8 mb-12 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Be the First Winner!</h3>
            <p className="text-muted-foreground">No winners yet. Enter today's contest and claim the $1,000 prize!</p>
          </div>
        )}

        {/* Pricing Section */}
        <div className="mb-12">
          <div className="section-title">Get Started</div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Daily Pass */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Daily Entry</div>
              <div className="text-5xl font-black mb-2">$5</div>
              <div className="text-xs text-muted-foreground mb-6">per entry</div>
              <ul className="text-left space-y-3 mb-6 text-sm text-muted-foreground">
                <li>✓ 1 Entry today</li>
                <li>✓ Chance to win $1,000</li>
                <li>✓ View live stats</li>
              </ul>
              <Link href="/account" className="btn btn-secondary w-full">Buy Entry</Link>
            </div>

            {/* Monthly Sub */}
            <div className="glass-card neon-border rounded-2xl p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase">Save $100+</span>
              </div>
              <div className="text-xs uppercase tracking-widest text-primary mb-4">Monthly Pass</div>
              <div className="text-5xl font-black mb-2">$49</div>
              <div className="text-xs text-muted-foreground mb-6">/ month</div>
              <ul className="text-left space-y-3 mb-6 text-sm">
                <li className="text-white">✓ Daily entries included</li>
                <li className="text-white">✓ ~$1.63/day vs $5/day</li>
                <li className="text-white">✓ Priority support</li>
              </ul>
              <Link href="/account" className="btn btn-primary w-full">Subscribe</Link>
            </div>
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
