import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SliderEntry from '@/components/SliderEntry'
import LiveCountdown from '@/components/LiveCountdown'
import TargetTokenCard from '@/components/TargetTokenCard'
import { getHistoricalMedianROI } from '@/lib/pump_api'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    // Get total entries from DB (still using Prisma for the recorded ledger)
    const totalEntries = await prisma.entry.count()

    // Get settled contests
    const settledContests = await prisma.contest.count({
      where: { status: 'settled' }
    })

    const historicalMedian = await getHistoricalMedianROI()

    return {
      totalDistributed: settledContests * 1000,
      activePlayers: totalEntries,
      historicalMedian: historicalMedian,
      hasWinners: settledContests > 0,
      recentWinners: [] as Array<{ name: string; amount: number; number: number }>
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      totalDistributed: 0,
      activePlayers: 0,
      historicalMedian: 4.8,
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

        {/* Target Token Focus */}
        <div className="mb-8">
          <TargetTokenCard />
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start mb-16">
          <SliderEntry />

          <div className="space-y-4">
            <LiveCountdown lockTime="19:00" />

            <div className="glass-card p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground uppercase tracking-widest">Current Round Pot</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">LIVE</span>
              </div>
              <div className="text-4xl font-black text-white">$450</div>
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <span>🏆 Winner takes 95%</span>
                <span>🔥 2.5% Burned</span>
                <span>💰 2.5% Yield</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar - Only show meaningful stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="stat-card">
            <div className="stat-icon">🔮</div>
            <div className="stat-value">$5</div>
            <div className="stat-label">Oracle Stake</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">$1,000</div>
            <div className="stat-label">Daily SOL Pot</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🧬</div>
            <div className="stat-value">1-100x</div>
            <div className="stat-label">ROI Range</div>
          </div>
        </div>

        {/* How It Works - Fill the space */}
        <div className="glass-card rounded-2xl p-8 mb-12">
          <div className="section-title">The Social Oracle</div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">🔮</div>
              <h3 className="font-bold mb-2">Social Consensus</h3>
              <p className="text-sm text-muted-foreground">We aggregate thousands of predictions to find the "true" market value of upcoming launches.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">⚡</div>
              <h3 className="font-bold mb-2">Pump.fun Integration</h3>
              <p className="text-sm text-muted-foreground">Directly linked to the pump.fun bonding curves. No lag, no fake data, just real-time alpha.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">💎</div>
              <h3 className="font-bold mb-2">SOL Payouts</h3>
              <p className="text-sm text-muted-foreground">Winners are settled instantly in SOL. Smart contracts ensure the house never keeps the pot.</p>
            </div>
          </div>
        </div>

        {/* Recent Winners - Only show if there are winners */}
        {stats.hasWinners ? (
          /* ... */
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

        {/* Staking & Alpha Section */}
        <div className="mb-12">
          <div className="section-title">Stake Your Alpha</div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Daily Pass */}
            <div className="glass-card rounded-2xl p-6 text-center flex flex-col h-full">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Single Entry</div>
              <div className="text-4xl font-black mb-2 text-white">100 $CROWD</div>
              <div className="text-xs text-muted-foreground mb-6">approx $5 USD</div>
              <ul className="text-left space-y-3 mb-8 text-sm text-muted-foreground flex-grow">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span> <span>1 Prediction for today's draw</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span> <span>5% Burn (Deflationary)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span> <span>Win the POT in instant SOL</span>
                </li>
              </ul>
              <button className="btn btn-secondary w-full mt-auto">Burn to Enter</button>
            </div>

            {/* Alpha Staker */}
            <div className="glass-card neon-border rounded-2xl p-6 text-center relative flex flex-col h-full">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase">Become the House</span>
              </div>
              <div className="text-xs uppercase tracking-widest text-primary mb-4">Alpha Staker</div>
              <div className="text-4xl font-black mb-2 text-white">5,000 $CROWD</div>
              <div className="text-xs text-muted-foreground mb-6">Locked Staking</div>
              <ul className="text-left space-y-3 mb-8 text-sm flex-grow">
                <li className="flex items-start gap-2 text-white">
                  <span className="text-primary">★</span> <span><strong className="text-primary">0 Fees</strong> on all daily predictions</span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <span className="text-primary">★</span> <span>Earn <strong className="text-primary">Yield</strong> from global entry fees</span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <span className="text-primary">★</span> <span>See Oracle Sentiment Data 1h early</span>
                </li>
              </ul>
              <button className="btn btn-primary w-full mt-auto">Stake for Alpha</button>
            </div>
          </div>
        </div>

        {/* Tokenomics Footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-muted/50 text-sm border border-white/5">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
              <span className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <span className="text-muted-foreground">Burn Rate: <span className="text-white font-mono">2.5%</span></span>
              </span>
              <div className="hidden md:block w-px h-4 bg-white/10"></div>
              <span className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span className="text-muted-foreground">Staking Yield: <span className="text-primary font-mono">2.5%</span></span>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
