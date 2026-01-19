import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SliderEntry from '@/components/SliderEntry'
import LiveCountdown from '@/components/LiveCountdown'

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

        {/* Pricing Section */}
        <div className="mb-12">
          <div className="section-title">Stake Your Alpha</div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Daily Pass */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Oracle Stake</div>
              <div className="text-5xl font-black mb-2">$5</div>
              <div className="text-xs text-muted-foreground mb-6">equivalent in SOL per entry</div>
              <ul className="text-left space-y-3 mb-6 text-sm text-muted-foreground">
                <li>✓ 1 Prediction today</li>
                <li>✓ Direct SOL payout if closest</li>
                <li>✓ Immutable on-chain record</li>
              </ul>
              <button className="btn btn-secondary w-full">Stake SOL</button>
            </div>

            {/* Monthly Sub */}
            <div className="glass-card neon-border rounded-2xl p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase">Alpha Pass</span>
              </div>
              <div className="text-xs uppercase tracking-widest text-primary mb-4">Unlimited Access</div>
              <div className="text-5xl font-black mb-2">$49</div>
              <div className="text-xs text-muted-foreground mb-6">/ month</div>
              <ul className="text-left space-y-3 mb-6 text-sm">
                <li className="text-white">✓ Unlimited daily predictions</li>
                <li className="text-white">✓ Early access to alpha data</li>
                <li className="text-white">✓ Exclusive "Oracle" role</li>
              </ul>
              <button className="btn btn-primary w-full">Join Alpha</button>
            </div>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-muted-foreground text-sm">
            <span>🛡️</span>
            <span className="font-mono">SETTLED ON SOLANA</span>
          </div>
        </div>

      </div>
    </div>
  )
}
