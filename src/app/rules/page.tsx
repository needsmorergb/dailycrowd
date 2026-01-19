export default function RulesPage() {
    return (
        <div className="container max-w-4xl py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black mb-2 text-white">Official Rules</h1>
                <p className="text-muted-foreground">How CROWD works — full transparency</p>
            </div>

            <div className="space-y-8">
                <section className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 text-primary">1. Overview</h2>
                    <p className="text-muted-foreground">
                        CROWD is a daily prediction contest where participants guess what
                        number the crowd will choose. The goal is to pick the number closest to
                        the <strong className="text-white">median</strong> of all entries.
                    </p>
                </section>

                <section className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 text-primary">2. Eligibility</h2>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• You must be 18 years or older to participate</li>
                        <li>• You must have an active Whop membership or daily entry pass</li>
                        <li>• One entry per person per contest</li>
                        <li>• Multiple accounts are not permitted</li>
                    </ul>
                </section>

                <section className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 text-primary">3. How to Enter</h2>
                    <ul className="space-y-2 text-muted-foreground mb-4">
                        <li>• Sign in to your account</li>
                        <li>• Navigate to "Today's Contest"</li>
                        <li>• Enter a whole number between 1 and 100 (inclusive)</li>
                        <li>• Submit before the lock time</li>
                    </ul>
                    <p className="text-sm bg-warning/10 text-warning p-3 rounded-lg">
                        <strong>Important:</strong> Entries cannot be changed or withdrawn once submitted.
                    </p>
                </section>

                <section className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 text-primary">4. Lock Time</h2>
                    <p className="text-muted-foreground">
                        Each contest has a posted lock time, typically <strong className="text-white">7:00 PM Pacific Time</strong>.
                        No entries are accepted after this time. The countdown timer shows
                        exactly how much time remains.
                    </p>
                </section>

                <section className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 text-primary">5. Determining the Winner</h2>
                    <p className="text-muted-foreground mb-4">
                        After entries lock, we calculate the median of all valid entries:
                    </p>
                    <ul className="space-y-2 text-muted-foreground mb-4">
                        <li>• All entries are sorted from lowest to highest</li>
                        <li>• The middle value is the median</li>
                        <li>• If there's an even number of entries, the median is the average of the two middle values</li>
                    </ul>
                    <p className="text-white font-semibold">
                        The entry closest to the median wins!
                    </p>
                </section>

                <section className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 text-primary">6. Tie-Breakers</h2>
                    <p className="text-muted-foreground mb-4">
                        If multiple entries are equally close to the median:
                    </p>
                    <ol className="space-y-3 text-muted-foreground list-decimal pl-5">
                        <li>
                            <strong className="text-white">Tie-breaker #1:</strong> Preference to entries that did not exceed
                            the median. ("Under" beats "over" when equally distant.)
                        </li>
                        <li>
                            <strong className="text-white">Tie-breaker #2:</strong> If still tied, the earliest submitted
                            entry wins. Timestamps are recorded when you click submit.
                        </li>
                    </ol>
                </section>

                {/* PRIZE & FEE BREAKDOWN - TRANSPARENCY */}
                <section className="glass-card p-8 rounded-2xl border-2 border-secondary/30 bg-secondary/5">
                    <h2 className="text-xl font-bold mb-4 text-secondary">💰 7. Prize Pool & Platform Fee</h2>
                    <p className="text-muted-foreground mb-6">
                        We believe in <strong className="text-white">full transparency</strong>. Here's exactly how the money works:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-background/50 p-6 rounded-xl border border-white/10">
                            <h3 className="font-bold text-white mb-3">Daily Entry ($1)</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">To Prize Pool:</span>
                                    <span className="text-success font-bold">90¢ (90%)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Platform Fee:</span>
                                    <span className="text-primary font-bold">10¢ (10%)</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-background/50 p-6 rounded-xl border border-white/10">
                            <h3 className="font-bold text-white mb-3">Monthly Pass ($19/mo)</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Includes:</span>
                                    <span className="text-white">Daily entries</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Platform Revenue:</span>
                                    <span className="text-primary font-bold">100%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">
                            <strong className="text-white">Example:</strong> 100 daily entries = $100 gross →
                            <span className="text-success"> $90 to winner</span>,
                            <span className="text-primary"> $10 platform fee</span>
                        </p>
                    </div>
                </section>

                <section className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 text-primary">8. Results & Transparency</h2>
                    <p className="text-muted-foreground mb-4">
                        After settlement, the following information is published:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• The winning number</li>
                        <li>• The calculated median, mean, mode, minimum, and maximum</li>
                        <li>• Total number of entries</li>
                        <li>• Total prize pool and winner payout</li>
                        <li>• A histogram showing the distribution of all entries</li>
                    </ul>
                </section>

                <section className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 text-primary">9. Disqualification</h2>
                    <p className="text-muted-foreground mb-4">
                        We reserve the right to disqualify entries that:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• Violate the one-entry-per-person rule</li>
                        <li>• Are submitted from multiple accounts by the same person</li>
                        <li>• Involve any form of cheating or manipulation</li>
                        <li>• Violate our Terms of Service</li>
                    </ul>
                </section>

                <section className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4 text-primary">10. Contact</h2>
                    <p className="text-muted-foreground">
                        For questions about these rules or disputes about contest results,
                        please contact us through our Whop page.
                    </p>
                </section>
            </div>

            <div className="mt-12 p-6 bg-white/5 rounded-xl text-center border border-white/5">
                <p className="text-xs text-muted-foreground">
                    Last updated: January 2026 • Rules subject to change with notice
                </p>
            </div>
        </div>
    )
}
