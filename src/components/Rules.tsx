import React from 'react';

const Rules = () => {
    return (
        <section id="rules" className="py-20 px-10 border-t-4 border-primary bg-[#fafafa] relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">
                        Oracle<br /><span className="text-neon-purple">Rules</span>
                    </h2>
                    <p className="text-primary/40 font-bold uppercase tracking-[0.3em] text-[10px]">Official Protocol Documentation v2.2</p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="bg-white border-4 border-primary p-8 rounded-3xl shadow-[10px_10px_0px_0px_#141414] hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-[14px_14px_0px_0px_#141414] transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-10 bg-primary/5 border-2 border-primary/10 rounded-xl flex items-center justify-center font-black text-primary">01</div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight">The Protocol</h2>
                        </div>
                        <p className="text-sm font-bold text-primary/70 leading-relaxed">
                            CROWD is a decentralized social oracle. Participants predict the <strong className="text-primary underline">Consensus Peak</strong> of new tokens launching on the market. By aggregating predictions, we generate the &quot;True Market Consensus.&quot;
                        </p>
                    </section>

                    <section className="bg-primary text-white border-4 border-primary p-8 rounded-3xl shadow-[10px_10px_0px_0px_#ccff00] hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-[14px_14px_0px_0px_#ccff00] transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-10 bg-white/10 border-2 border-white/20 rounded-xl flex items-center justify-center font-black text-neon-green">02</div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight">Token Utility</h2>
                        </div>
                        <ul className="space-y-3 text-xs font-bold uppercase tracking-wider">
                            <li className="flex items-center gap-3"><span className="size-1.5 bg-neon-green rounded-full"></span> 5% of every pot is burned forever</li>
                            <li className="flex items-center gap-3"><span className="size-1.5 bg-neon-green rounded-full"></span> 95% of the pot goes to winners</li>
                            <li className="flex items-center gap-3"><span className="size-1.5 bg-neon-green rounded-full"></span> Top predictors earn voting weight</li>
                        </ul>
                    </section>

                    <section className="bg-white border-4 border-primary p-8 rounded-3xl shadow-[10px_10px_0px_0px_#141414]">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-10 bg-primary/5 border-2 border-primary/10 rounded-xl flex items-center justify-center font-black text-primary">03</div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight text-primary">The Prediction</h2>
                        </div>
                        <div className="bg-primary/5 p-4 rounded-xl mb-4 border-2 border-dashed border-primary/20">
                            <p className="text-xs font-black text-primary uppercase mb-1">Metric: 30s VWAP Peak</p>
                            <p className="text-[10px] font-bold text-primary/60 uppercase">
                                We track the highest volume-weighted average price point a token reaches within the round.
                            </p>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase italic tracking-widest px-2">
                            <span className="text-primary/40">Scale:</span>
                            <span className="text-primary">1x (Rug)</span>
                            <span className="text-neon-purple">10x (Pump)</span>
                            <span className="text-neon-green">100x+ (Moon)</span>
                        </div>
                    </section>

                    <section className="bg-neon-green border-4 border-primary p-8 rounded-3xl shadow-[10px_10px_0px_0px_#141414]">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-10 bg-primary/10 border-2 border-primary/20 rounded-xl flex items-center justify-center font-black text-primary">04</div>
                            <h2 className="text-xl font-black uppercase italic tracking-tight text-primary">Consensus</h2>
                        </div>
                        <p className="text-sm font-bold text-primary leading-relaxed mb-4">
                            The user closest to the actual market outcome wins the pot. Use your &quot;Alpha Pass&quot; NFT to make unlimited predictions.
                        </p>
                        <div className="p-3 bg-white border-2 border-primary rounded-xl font-black text-[10px] uppercase tracking-widest text-center shadow-[4px_4px_0px_0px_#141414]">
                            ⚠️ Accuracy is the only factor
                        </div>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t-2 border-dashed border-primary/20 text-center">
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em]">
                        Oracle Protocol v2.2 (Solana Mainnet) | $CROWD Protocol Layer
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Rules;
