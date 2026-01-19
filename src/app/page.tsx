import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">CROWD</h1>
          <p className="hero-subtitle">
            Predict the crowd. Not the number.
          </p>
          <div className="hero-cta">
            <Link href="/today" className="btn btn-primary">
              Play Today's Contest
            </Link>
            <Link href="/account" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works container">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-title">Enter a Number</h3>
            <p className="step-desc">
              Pick any number from 1 to 100. Just one number per day.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-title">Entries Lock Daily</h3>
            <p className="step-desc">
              All entries lock at the posted time. No changes after that.
            </p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-title">Closest to Median Wins</h3>
            <p className="step-desc">
              The entry closest to the crowd's median takes the prize.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing">
        <div className="container">
          <h2 className="section-title">Choose Your Access</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-label">One-Time</div>
              <h3 className="pricing-name">Daily Entry</h3>
              <div className="pricing-price">$1<span>/day</span></div>
              <ul className="pricing-features">
                <li>One contest entry</li>
                <li>Full results access</li>
                <li>No commitment</li>
              </ul>
              <a
                href="https://whop.com"
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy Single Entry
              </a>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-label">Best Value</div>
              <h3 className="pricing-name">Monthly Pass</h3>
              <div className="pricing-price">$19<span>/month</span></div>
              <ul className="pricing-features">
                <li>Unlimited daily entries</li>
                <li>Full results access</li>
                <li>Priority support</li>
                <li>Member-only stats</li>
              </ul>
              <a
                href="https://whop.com"
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join on Whop
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust container">
        <p className="trust-text">
          Transparent stats posted daily. Every result is verifiable.
        </p>
      </section>

      {/* FAQ */}
      <section className="faq container">
        <h2 className="section-title">Frequently Asked Questions</h2>

        <div className="faq-item">
          <h3 className="faq-question">How is the median calculated?</h3>
          <p className="faq-answer">
            We sort all entries and find the middle value. If there's an even number of
            entries, we average the two middle numbers. This could result in a decimal
            like 50.5.
          </p>
        </div>

        <div className="faq-item">
          <h3 className="faq-question">What happens if there's a tie?</h3>
          <p className="faq-answer">
            If multiple entries are equally close to the median, we first prefer entries
            that didn't go over the median. If still tied, the earliest submission wins.
          </p>
        </div>

        <div className="faq-item">
          <h3 className="faq-question">When do results post?</h3>
          <p className="faq-answer">
            Results are typically posted within 1 hour after entries lock. You'll be
            able to see the full distribution, winner, and all statistics.
          </p>
        </div>

        <div className="faq-item">
          <h3 className="faq-question">Do I need to play every day?</h3>
          <p className="faq-answer">
            No! With a monthly pass, you can play whenever you want. Each day is a
            fresh contest with new entries.
          </p>
        </div>
      </section>
    </>
  )
}
