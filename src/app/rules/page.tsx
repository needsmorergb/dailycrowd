export default function RulesPage() {
    return (
        <div className="container">
            <div className="rules-content">
                <div className="page-header" style={{ textAlign: 'center' }}>
                    <h1 className="page-title">Official Rules</h1>
                    <p className="page-subtitle">How CROWD works</p>
                </div>

                <div className="rules-section">
                    <h2>1. Overview</h2>
                    <p>
                        CROWD is a daily prediction contest where participants guess what
                        number the crowd will choose. The goal is to pick the number closest to
                        the median of all entries.
                    </p>
                </div>

                <div className="rules-section">
                    <h2>2. Eligibility</h2>
                    <ul>
                        <li>You must be 18 years or older to participate</li>
                        <li>You must have an active Whop membership or daily entry pass</li>
                        <li>One entry per person per contest</li>
                        <li>Multiple accounts are not permitted</li>
                    </ul>
                </div>

                <div className="rules-section">
                    <h2>3. How to Enter</h2>
                    <ul>
                        <li>Sign in to your account</li>
                        <li>Navigate to "Today's Contest"</li>
                        <li>Enter a whole number between 1 and 100 (inclusive)</li>
                        <li>Submit before the lock time</li>
                    </ul>
                    <p style={{ marginTop: '12px' }}>
                        <strong>Important:</strong> Entries cannot be changed or withdrawn once submitted.
                    </p>
                </div>

                <div className="rules-section">
                    <h2>4. Lock Time</h2>
                    <p>
                        Each contest has a posted lock time, typically 7:00 PM Pacific Time.
                        No entries are accepted after this time. The countdown timer shows
                        exactly how much time remains.
                    </p>
                </div>

                <div className="rules-section">
                    <h2>5. Determining the Winner</h2>
                    <p style={{ marginBottom: '12px' }}>
                        After entries lock, we calculate the median of all valid entries:
                    </p>
                    <ul>
                        <li>All entries are sorted from lowest to highest</li>
                        <li>The middle value is the median</li>
                        <li>If there's an even number of entries, the median is the average of the two middle values (can be a decimal like 50.5)</li>
                    </ul>
                    <p style={{ marginTop: '12px' }}>
                        The entry closest to the median wins.
                    </p>
                </div>

                <div className="rules-section">
                    <h2>6. Tie-Breakers</h2>
                    <p style={{ marginBottom: '12px' }}>
                        If multiple entries are equally close to the median:
                    </p>
                    <ol style={{ paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>Tie-breaker #1:</strong> Preference to entries that did not exceed
                            the median. ("Under" beats "over" when equally distant.)
                        </li>
                        <li>
                            <strong>Tie-breaker #2:</strong> If still tied, the earliest submitted
                            entry wins. Timestamps are recorded when you click submit.
                        </li>
                    </ol>
                </div>

                <div className="rules-section">
                    <h2>7. Results & Transparency</h2>
                    <p>
                        After settlement, the following information is published:
                    </p>
                    <ul>
                        <li>The winning number</li>
                        <li>The calculated median, mean, mode, minimum, and maximum</li>
                        <li>Total number of entries</li>
                        <li>A histogram showing the distribution of all entries</li>
                    </ul>
                    <p style={{ marginTop: '12px' }}>
                        All statistics are computed from valid submissions recorded by the platform.
                    </p>
                </div>

                <div className="rules-section">
                    <h2>8. Prizes</h2>
                    <p>
                        Prize structures vary by contest and are announced before each contest
                        opens. Check the contest details for specific prize information.
                    </p>
                </div>

                <div className="rules-section">
                    <h2>9. Disqualification</h2>
                    <p>
                        We reserve the right to disqualify entries that:
                    </p>
                    <ul>
                        <li>Violate the one-entry-per-person rule</li>
                        <li>Are submitted from multiple accounts by the same person</li>
                        <li>Involve any form of cheating or manipulation</li>
                        <li>Violate our Terms of Service</li>
                    </ul>
                </div>

                <div className="rules-section">
                    <h2>10. Contact</h2>
                    <p>
                        For questions about these rules or disputes about contest results,
                        please contact us through our Whop page.
                    </p>
                </div>

                <div style={{
                    marginTop: '48px',
                    padding: '24px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--border-radius)',
                    textAlign: 'center'
                }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Last updated: January 2026
                    </p>
                </div>
            </div>
        </div>
    )
}
