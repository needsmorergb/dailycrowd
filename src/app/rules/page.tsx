export default function RulesPage() {
    return (
        <div className="container max-w-4xl py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black mb-2">Oracle Protocol Rules</h1>
                <p className="text-muted-foreground text-sm tracking-widest uppercase">Powered by $CROWD • The Social Intelligence Layer</p>
            </div>

            <div className="space-y-6">
                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">1. The Protocol</h2>
                    <p className="text-muted-foreground text-sm">
                        CROWD is a decentralized social oracle. Participants use the <strong className="text-white">$CROWD</strong> token
                        to predict the <strong className="text-white">1-Hour Peak ROI</strong> of new tokens launching on
                        <strong className="text-primary"> pump.fun</strong>. By aggregating predictions, we generate the "True Market Consensus."
                    </p>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">2. Token Utility ($CROWD)</h2>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                        <li>• <strong className="text-white">Entry:</strong> Each prediction requires staking $5 worth of $CROWD (or SOL equivalent).</li>
                        <li>• <strong className="text-danger">Deflation:</strong> 5% of every pot is legally burned forever.</li>
                        <li>• <strong className="text-success">Rewards:</strong> 95% of the pot goes to the winner(s).</li>
                        <li>• <strong className="text-primary">Governance:</strong> Top predictors ("Oracles") earn voting weight.</li>
                    </ul>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">3. The Prediction (ROI)</h2>
                    <div className="bg-muted p-4 rounded-xl mb-4">
                        <p className="text-sm font-bold text-white mb-2">Metric: "1-Hour Peak ROI"</p>
                        <p className="text-xs text-muted-foreground">
                            We track the highest price point a token reaches within exactly 60 minutes of its bonding curve creation.
                        </p>
                    </div>
                    <ul className="space-y-2 text-muted-foreground text-sm mb-4">
                        <li>• <strong className="text-white">0x - 1x:</strong> The token rugged or failed to bond.</li>
                        <li>• <strong className="text-white">2x - 10x:</strong> Standard bonding curve pump.</li>
                        <li>• <strong className="text-white">100x+:</strong> Moon mission.</li>
                    </ul>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">4. Consesnsus & Payouts</h2>
                    <p className="text-muted-foreground text-sm mb-3">
                        The protocol calculates the <strong className="text-white">Median</strong> of all user predictions.
                    </p>
                    <ul className="space-y-2 text-muted-foreground text-sm mb-3">
                        <li>• The user closest to the actual market outcome wins the pot.</li>
                        <li>• Use your "Alpha Pass" NFT to make unlimited predictions without staking fees.</li>
                        <li>• Payouts are automated via smart contract.</li>
                    </ul>
                </section>

                <section className="glass-card p-6 rounded-2xl border border-primary/20">
                    <h2 className="text-lg font-bold mb-3 text-primary">5. Transparency</h2>
                    <p className="text-muted-foreground text-sm">
                        CROWD operates as a public utility. All predictions are signed on Solana.
                        Data is verified against the official pump.fun program ID.
                    </p>
                </section>
            </div>

            <div className="mt-8 p-4 bg-muted rounded-xl text-center">
                <p className="text-xs text-muted-foreground">
                    Oracle Protocol v2.2 (Solana Mainnet) | $CROWD Token Address: (Coming Soon)
                </p>
            </div>
        </div>
    )
}
