import Link from 'next/link'
import { headers } from 'next/headers'

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 pb-20">

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-48 text-center overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="container relative z-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            JOIN THE <span className="text-gradient">CROWD</span>.<br />
            WIN THE <span className="text-secondary drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">POT</span>.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            The daily game where you predict the median. Not the highest. Not the lowest.
            <span className="text-foreground font-semibold"> Just the crowd.</span>
          </p>

          {/* LIVE POT DISPLAY */}
          <div className="mb-12 inline-block">
            <div className="glass-card neon-border px-12 py-8 rounded-2xl animate-pulse-glow">
              <div className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-2">Live Pot Estimate</div>
              <div className="text-6xl md:text-8xl font-black text-white glow-text font-mono">
                $1,250
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/account" className="btn btn-primary text-lg px-10 py-4 h-auto rounded-xl">
              ENTER NOW &rarr;
            </Link>
            <Link href="/rules" className="btn btn-secondary text-lg px-8 py-4 h-auto rounded-xl bg-transparent border-white/10 hover:bg-white/5">
              How it Works
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container max-w-5xl">
        <h2 className="section-title">INTELLIGENCE PAYS OFF</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Join the Crowd', desc: 'Connect your Whop account to get your daily entry ticket.' },
            { step: '02', title: 'Enter a Number', desc: 'Pick any integer between 1 and 100. Submit before the timer locks.' },
            { step: '03', title: 'Find the Median', desc: 'If your number is strictly in the middle of all submissions, you split the pot.' }
          ].map((item) => (
            <div key={item.step} className="glass-card p-8 rounded-2xl text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-primary transition-transform group-hover:scale-110 duration-500">
                {item.step}
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
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
        <div className="glass-card p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent">
          <div className="bg-background/80 backdrop-blur-xl rounded-[22px] p-8 md:p-16 text-center border border-white/5">
            <h2 className="text-3xl font-bold mb-2">Access the Crowd</h2>
            <p className="text-muted-foreground mb-10">One simple pass. Unlimited potential.</p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* Daily Pass */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 w-full md:w-64">
                <div className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Daily Ticket</div>
                <div className="text-4xl font-bold mb-6">$1</div>
                <ul className="text-left space-y-3 mb-8 text-sm text-muted-foreground">
                  <li className="flex gap-2">✓ 1 Entry</li>
                  <li className="flex gap-2">✓ Standard Stats</li>
                </ul>
                <Link href="/account" className="btn btn-secondary w-full">Buy Pass</Link>
              </div>

              {/* Monthly Sub */}
              <div className="relative p-8 rounded-2xl border border-primary bg-primary/10 w-full md:w-80 shadow-[0_0_50px_rgba(124,58,237,0.2)] transform md:-translate-y-4">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
                <div className="text-sm uppercase tracking-wider text-primary mb-4">Monthly Access</div>
                <div className="text-5xl font-black mb-1">$19</div>
                <div className="text-xs text-muted-foreground mb-6">/ month</div>
                <ul className="text-left space-y-3 mb-8 text-sm">
                  <li className="flex gap-2 text-white">✓ <span className="text-white">Daily Entries included</span></li>
                  <li className="flex gap-2 text-white">✓ <span className="text-white">Advanced Analytics</span></li>
                  <li className="flex gap-2 text-white">✓ <span className="text-white">"Voted" Badge</span></li>
                </ul>
                <Link href="/account" className="btn btn-primary w-full shadow-lg shadow-primary/25">Subscribe</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="text-center py-20">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
          <span className="text-xl">🔒</span>
          <span className="font-mono text-sm">SECURED BY WHOP & TURSO DOZER</span>
        </div>
      </section>

    </div>
  )
}
