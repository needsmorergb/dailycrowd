export default function RulesPage() {
    return (
        <div className="container max-w-4xl py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black mb-2">Oracle Protocol Rules</h1>
                <p className="text-muted-foreground text-sm tracking-widest uppercase">The Social Intelligence Layer for Solana</p>
            </div>

            <div className="space-y-6">
                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">1. The Protocol</h2>
                    <p className="text-muted-foreground text-sm">
                        CROWD is a decentralized social oracle. participants use their "market intuition" to predict the
                        <strong className="text-white"> 1-hour ROI </strong> of new tokens launching on
                        <strong className="text-primary"> pump.fun</strong>. By aggregating individual predictions, we find the
                        true market consensus.
                    </p>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">2. Staking & Entries</h2>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                        <li>• connect your <strong className="text-white">Solana Wallet</strong> (Phantom, Solflare, etc.)</li>
                        <li>• each prediction requires a <strong className="text-white">stake of $5 (in SOL)</strong></li>
                        <li>• holders of our <strong className="text-primary">Alpha Pass</strong> get unlimited predictions</li>
                        <li>• one prediction per token launch per wallet</li>
                    </ul>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">3. The Prediction</h2>
                    <ul className="space-y-2 text-muted-foreground text-sm mb-4">
                        <li>• select a value between <strong className="text-white">1x and 100x</strong></li>
                        <li>• your prediction represents the peak ROI within the first 60 minutes of bonding</li>
                        <li>• once a prediction is signed on-chain, it cannot be modified</li>
                    </ul>
                    <p className="text-xs bg-primary/10 text-primary p-3 rounded-lg border border-primary/20">
                        <strong>Oracle Power:</strong> Individual predictions are hidden until the 1-hour mark to prevent consensus manipulation.
                    </p>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">4. Winning & Payouts</h2>
                    <p className="text-muted-foreground text-sm mb-3">
                        The oracle settles based on the <strong className="text-white">Median</strong> of all participant entries:
                    </p>
                    <ul className="space-y-2 text-muted-foreground text-sm mb-3">
                        <li>• we identify the participant closest to the actual market outcome</li>
                        <li>• if multiple participants are tied, the one closest to the aggregate <strong className="text-white">median</strong> wins</li>
                        <li>• payouts are sent <strong className="text-success">instantly in SOL</strong> to the winner's wallet</li>
                    </ul>
                </section>

                {/* PRIZE & FEE BREAKDOWN */}
                <section className="glass-card neon-border p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-4 text-primary">💎 5. Payout Structure</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        Everything is settled on the Solana blockchain for 100% transparency.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-muted p-4 rounded-xl">
                            <h3 className="font-bold text-white text-sm mb-3">Single Stake — $5 SOL</h3>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Protocol Fee:</span>
                                    <span className="text-white font-bold">5%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">To Daily Pot:</span>
                                    <span className="text-primary font-bold">95%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted p-4 rounded-xl">
                            <h3 className="font-bold text-white text-sm mb-3">Alpha Pass — $49/mo</h3>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className="text-success font-bold">Oracle Elite</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Prediction Fee:</span>
                                    <span className="text-white font-bold">$0</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/10 p-4 rounded-lg text-center border border-primary/20">
                        <p className="text-sm text-muted-foreground">
                            The protocol maintains a <strong className="text-white">Fixed $1,000 Payout</strong> backed by the stake treasury.
                        </p>
                    </div>
                </section>

                <section className="glass-card p-6 rounded-2xl">
                    <h2 className="text-lg font-bold mb-3 text-primary">6. Transparency</h2>
                    <p className="text-muted-foreground text-sm">
                        All market data is pulled directly from the <strong className="text-white">Solana RPC</strong>.
                        Bonding curve events and price feeds are verified by the CROWD indexer against pump.fun's public program.
                    </p>
                </section>
            </div>

            <div className="mt-8 p-4 bg-muted rounded-xl text-center">
                <p className="text-xs text-muted-foreground">
                    Oracle Protocol v2.1 (Solana Mainnet) | Last updated: January 2026
                </p>
            </div>
        </div>
    )
}
