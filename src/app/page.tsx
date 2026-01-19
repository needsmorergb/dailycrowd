import Link from 'next/link'
import { prisma } from '@/lib/prisma'

// Make this a dynamic page that fetches real data
export const dynamic = 'force-dynamic'

async function getTodaysPot() {
  try {
    // Find today's contest
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const contest = await prisma.contest.findFirst({
      where: {
        contestDate: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        _count: {
          select: { entries: true }
        }
      }
    })

    if (!contest) return { entries: 0, pot: 0, gross: 0 }

    // $1 per daily entry, 90% goes to pot (10% platform fee)
    const gross = contest._count.entries * 1
    const pot = Math.floor(gross * 0.9) // 90% to winner

    return {
      entries: contest._count.entries,
      pot: pot,
      gross: gross
    }
  } catch (error) {
    console.error('Error fetching pot:', error)
    return { entries: 0, pot: 0, gross: 0 }
  }
}

export default async function LandingPage() {
  const { entries, pot, gross } = await getTodaysPot()

  // Show the actual pot (90% of entries)
  const displayPot = pot > 0 ? `$${pot.toLocaleString()}` : '$0'
  const potLabel = entries > 0 ? `${entries} entries • 90% to winner` : 'Be the first to enter!'

  return (
    <div className="flex flex-col gap-16 pb-20">

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-48 text-center overflow-hidden">
        {/* Background Glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'rgba(124, 58, 237, 0.2)',
          filter: 'blur(120px)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div className="container relative z-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            JOIN THE <span className="text-gradient">CROWD</span>.<br />
            WIN THE <span className="text-secondary" style={{ textShadow: '0 0 15px rgba(6,182,212,0.5)' }}>POT</span>.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            The daily game where you predict the median. Not the highest. Not the lowest.
            <span className="text-white font-semibold"> Just the crowd.</span>
          </p>

          {/* LIVE POT DISPLAY */}
          <div className="mb-12 inline-block">
            <div className="glass-card neon-border px-12 py-8 rounded-2xl animate-pulse-glow">
              <div className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-2">Today's Pot</div>
              <div className="text-6xl md:text-8xl font-black text-white glow-text font-mono">
                {displayPot}
              </div>
              <div className="text-xs text-muted-foreground mt-2">{potLabel}</div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/account" className="btn btn-primary text-lg px-10 py-4 rounded-xl">
              ENTER NOW &rarr;
            </Link>
            <Link href="/rules" className="btn btn-secondary text-lg px-8 py-4 rounded-xl">
              How it Works
            </Link>
          </div>
        </div>
      </section>

      {/* HOW THE POT WORKS */}
      <section className="container max-w-4xl">
        <h2 className="section-title">💰 HOW THE POT WORKS</h2>
        <div className="glass-card p-8 rounded-2xl">
          <div className="grid md:grid-cols-3 gap-8 text-center mb-8">
            <div>
              <div className="text-4xl font-black text-secondary mb-2">$1</div>
              <div className="text-sm text-muted-foreground">Per Daily Entry</div>
              <div className="text-xs text-muted-foreground mt-1">Goes straight to pot</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">×</div>
              <div className="text-sm text-muted-foreground">Number of</div>
              <div className="text-xs text-muted-foreground mt-1">Players Today</div>
            </div>
            <div>
              <div className="text-4xl font-black text-primary mb-2">= POT</div>
              <div className="text-sm text-muted-foreground">Winner Takes All</div>
              <div className="text-xs text-muted-foreground mt-1">Paid daily via Whop</div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-muted-foreground text-sm">
              <strong className="text-white">Example:</strong> 100 players = <strong className="text-secondary">$100 pot</strong> • 1,000 players = <strong className="text-secondary">$1,000 pot</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              The more players join, the bigger the pot. Grows until the daily deadline!
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container max-w-5xl">
        <h2 className="section-title">🎯 INTELLIGENCE PAYS OFF</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Join the Crowd', desc: 'Connect your Whop account to get your daily entry ticket.' },
            { step: '02', title: 'Enter a Number', desc: 'Pick any integer between 1 and 100. Submit before the timer locks.' },
            { step: '03', title: 'Find the Median', desc: 'If your number is closest to the median of all submissions, you win the pot!' }
          ].map((item) => (
            <div key={item.step} className="glass-card p-8 rounded-2xl text-center relative overflow-hidden group">
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                padding: '1rem',
                opacity: 0.1,
                fontWeight: 900,
                fontSize: '3.75rem',
                color: 'var(--primary)'
              }}>
                {item.step}
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold mx-auto mb-6">
                {item.step}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="container max-w-4xl pt-10">
        <div className="glass-card p-1 rounded-3xl" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)' }}>
          <div className="rounded-2xl p-8 md:p-16 text-center border border-white/5" style={{ background: 'rgba(8,8,12,0.8)', backdropFilter: 'blur(24px)' }}>
            <h2 className="text-3xl font-bold mb-2">Access the Crowd</h2>
            <p className="text-muted-foreground mb-10">One simple pass. Unlimited potential.</p>

            <div className="flex flex-col md:flex-row items-stretch justify-center gap-8">
              {/* Daily Pass */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 w-full md:w-64 flex flex-col">
                <div className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Daily Ticket</div>
                <div className="text-4xl font-bold mb-6">$1</div>
                <ul className="text-left space-y-3 mb-8 text-sm text-muted-foreground flex-1">
                  <li>✓ 1 Entry today</li>
                  <li>✓ Your $1 goes to pot</li>
                  <li>✓ Win the full pot</li>
                </ul>
                <Link href="/account" className="btn btn-secondary w-full">Buy Pass</Link>
              </div>

              {/* Monthly Sub */}
              <div className="p-8 rounded-2xl border-2 border-primary bg-primary/10 w-full md:w-80 flex flex-col" style={{ boxShadow: '0 0 50px rgba(124, 58, 237, 0.2)' }}>
                <div style={{
                  display: 'inline-block',
                  background: 'var(--primary)',
                  color: 'white',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1rem',
                  width: 'fit-content',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  Best Value
                </div>
                <div className="text-sm uppercase tracking-wider text-primary mb-4">Monthly Access</div>
                <div className="text-5xl font-black mb-1">$19</div>
                <div className="text-xs text-muted-foreground mb-6">/ month (~$0.63/day)</div>
                <ul className="text-left space-y-3 mb-8 text-sm text-white flex-1">
                  <li>✓ Daily Entries included</li>
                  <li>✓ Never miss a day</li>
                  <li>✓ Advanced Analytics</li>
                  <li>✓ "Voted" Badge</li>
                </ul>
                <Link href="/account" className="btn btn-primary w-full" style={{ boxShadow: '0 10px 15px rgba(124,58,237,0.25)' }}>Subscribe</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="text-center py-20">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
          <span className="text-xl">🔒</span>
          <span className="font-mono text-sm">SECURED BY WHOP & TURSO</span>
        </div>
      </section>

    </div>
  )
}
