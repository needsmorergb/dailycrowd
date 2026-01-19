export default function RulesPage() {
    return (
        <div className="container max-w-4xl py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black mb-2">Official Rules</h1>
                <p className="text-muted-foreground">How CROWD works — full transparency</p>
            </div>

            <div className="space-y-6">
                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">1. Overview</h2>
                    <p className="text-muted-foreground text-sm">
                        CROWD is a daily prediction contest where participants guess what
                        number the crowd will choose. The goal is to pick the number closest to
                        the <strong className="text-white">median</strong> of all entries and win the <strong className="text-primary">$1,000 daily prize</strong>.
                    </p>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">2. Eligibility</h2>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                        <li>• You must be 18 years or older to participate</li>
                        <li>• You must have an active Whop membership or daily entry pass</li>
                        <li>• One entry per person per contest</li>
                        <li>• Multiple accounts are not permitted</li>
                    </ul>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">3. How to Enter</h2>
                    <ul className="space-y-2 text-muted-foreground text-sm mb-4">
                        <li>• Sign in to your account</li>
                        <li>• Navigate to "Today's Contest"</li>
                        <li>• Use the slider to select a number between 1 and 100</li>
                        <li>• Submit before the lock time (7:00 PM PT)</li>
                    </ul>
                    <p className="text-xs bg-warning/10 text-warning p-3 rounded-lg">
                        <strong>Important:</strong> Entries cannot be changed once submitted.
                    </p>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">4. Determining the Winner</h2>
                    <p className="text-muted-foreground text-sm mb-3">
                        After entries lock, we calculate the median of all entries:
                    </p>
                    <ul className="space-y-2 text-muted-foreground text-sm mb-3">
                        <li>• All entries are sorted from lowest to highest</li>
                        <li>• The middle value is the median</li>
                        <li>• The entry <strong className="text-white">closest to the median</strong> wins</li>
                    </ul>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">5. Tie-Breakers</h2>
                    <ol className="space-y-2 text-muted-foreground text-sm list-decimal pl-5">
                        <li><strong className="text-white">Under beats over</strong> — if equally distant, entry below median wins</li>
                        <li><strong className="text-white">Earlier wins</strong> — if still tied, earliest submission wins</li>
                    </ol>
                </section>

                {/* PRIZE & FEE BREAKDOWN */}
                <section className="glass-card neon-border p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-4 text-primary">💰 6. Prize Pool & Fees</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        Full transparency on how the money works:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-muted p-4 rounded-xl">
                            <h3 className="font-bold text-white text-sm mb-3">Daily Entry — $5</h3>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Your entry:</span>
                                    <span className="text-white font-bold">$5</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Daily prize:</span>
                                    <span className="text-primary font-bold">$1,000</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted p-4 rounded-xl">
                            <h3 className="font-bold text-white text-sm mb-3">Monthly Pass — $49/mo</h3>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Daily entries:</span>
                                    <span className="text-white">Included</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Savings vs daily:</span>
                                    <span className="text-success font-bold">$100+/mo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/10 p-4 rounded-lg text-center border border-primary/20">
                        <p className="text-sm text-muted-foreground">
                            <strong className="text-white">$1,000 prize</strong> paid daily to the winner via Whop
                        </p>
                    </div>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">7. Results & Transparency</h2>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                        <li>• Winning number published immediately</li>
                        <li>• Full statistics: median, mean, mode, min, max</li>
                        <li>• Entry distribution histogram</li>
                        <li>• Total prize payout</li>
                    </ul>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">8. Disqualification</h2>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                        <li>• Multiple accounts = disqualified</li>
                        <li>• Any form of cheating = disqualified</li>
                        <li>• Terms of Service violations = disqualified</li>
                    </ul>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">9. Contact</h2>
                    <p className="text-muted-foreground text-sm">
                        Questions? Contact us through our Whop page.
                    </p>
                </section>
            </div>

            <div className="mt-8 p-4 bg-muted rounded-xl text-center">
                <p className="text-xs text-muted-foreground">
                    Last updated: January 2026
                </p>
            </div>
        </div>
    )
}
