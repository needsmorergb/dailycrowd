'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function OracleTerminal() {
    const { connected } = useWallet();
    const [prediction, setPrediction] = useState(15.0);

    return (
        <div className="flex-1 grid grid-cols-12 gap-6 p-6 w-full">
            {/* Left Column: Token Data */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
                <div className="glass-card p-5 border-l-4 border-l-acid-green">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full border-2 border-acid-green p-0.5">
                                <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXseSWT3F3PRp40BzMmD6YSbYJBR-crmVEEUw32I1EWRMr8yiRdImQJuDUbRXUrQn8T0X0I7GZgTovmF3KREDYdtZNe7YrFgJ83yplnzFMkA0LGTazEmH9hPcZ4Tt-HVBSBzd245mMomPOVcbBhqOZ2-denwRanQm_omUBsmw8aTWbXS0pQCcahUf_uel7v3Ujcq6mxy09VO_UOcETlQ16j6wxa4eLclMo7wXaF7goFQm2NAA0I3gjHQ0bVOcWv6tyGxhKOrRY5Cc')" }}></div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic text-white">$PEPE3</h3>
                                <p className="text-[10px] text-white/40">SOLANA MAINNET</p>
                            </div>
                        </div>
                        <span className="text-acid-green material-symbols-outlined text-sm">verified</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-white/60">
                            <span>Bonding Progress</span>
                            <span className="text-acid-green">88.4%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 overflow-hidden border border-white/10">
                            <div className="h-full bg-gradient-to-r from-neon-purple to-acid-green" style={{ width: '88.4%' }}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5">
                            <div>
                                <div className="text-[9px] text-white/40 uppercase">Market Cap</div>
                                <div className="text-sm font-bold text-white">$1.24M</div>
                            </div>
                            <div>
                                <div className="text-[9px] text-white/40 uppercase">24h Vol</div>
                                <div className="text-sm font-bold text-white">$420K</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card flex flex-col h-[400px]">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-neon-purple tracking-widest">Oracle Feed</span>
                        <span className="w-2 h-2 rounded-full bg-acid-green animate-pulse"></span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[11px]">
                        <div className="flex justify-between items-center text-white/40">
                            <span>7x3A...m8L</span>
                            <span className="text-acid-green">+12.5x</span>
                        </div>
                        <div className="flex justify-between items-center text-white/40">
                            <span>B9vK...k2W</span>
                            <span className="text-neon-purple">+4.2x</span>
                        </div>
                        <div className="flex justify-between items-center text-white/40">
                            <span>0xDE...GEN</span>
                            <span className="text-acid-green">+28.0x</span>
                        </div>
                        <div className="flex justify-between items-center text-white/40">
                            <span>SOL1...WHAL</span>
                            <span className="text-neon-purple">+1.5x</span>
                        </div>
                        <div className="flex justify-between items-center text-white/40">
                            <span>kL99...Px2</span>
                            <span className="text-acid-green">+9.8x</span>
                        </div>
                        <div className="flex justify-between items-center text-white/20">
                            <span>...</span>
                            <span>...</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Center Column: Prediction Zone */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
                <div className="glass-card p-8 relative overflow-hidden h-full flex flex-col justify-center border-t-2 border-t-acid-green">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--acid-green)_0%,_transparent_70%)] pointer-events-none"></div>

                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-black italic uppercase mb-2 tracking-tighter glitch-text text-white">ROI Projection</h2>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Predict the future. Claim the pot.</p>
                    </div>

                    <div className="relative py-12">
                        <div className="flex justify-between items-end mb-12">
                            <div className="text-left">
                                <div className="text-[10px] text-white/30 uppercase font-black">Floor</div>
                                <div className="text-2xl font-black italic text-white">1.0X</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-acid-green font-black uppercase tracking-widest mb-4">Current Prediction</div>
                                <div className="text-8xl font-black italic leading-none text-white tracking-tighter">
                                    {prediction.toFixed(1)}<span className="text-3xl text-neon-purple">X</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-white/30 uppercase font-black">Ceiling</div>
                                <div className="text-2xl font-black italic text-white">30.0X</div>
                            </div>
                        </div>

                        <div className="relative px-2 group">
                            <input
                                className="w-full relative z-10 opacity-0 cursor-pointer h-6"
                                max="30"
                                min="1"
                                step="0.1"
                                type="range"
                                value={prediction}
                                onChange={(e) => setPrediction(parseFloat(e.target.value))}
                            />
                            {/* Custom Slider Visuals */}
                            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between mt-1 pointer-events-none">
                                <div className="h-4 w-full bg-white/10 absolute top-1/2 -translate-y-1/2"></div>
                                {/* Thumb simulation */}
                                <div
                                    className="absolute w-2 h-5 bg-acid-green top-1/2 -translate-y-1/2 shadow-[0_0_10px_#ccff00]"
                                    style={{ left: `calc(${((prediction - 1) / 29) * 100}% - 4px)` }}
                                ></div>
                            </div>

                            <div className="flex justify-between mt-4 pointer-events-none px-0.5">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className={`w-0.5 ${i === 4 ? 'h-6 bg-acid-green' : 'h-3 bg-white/20'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-12">
                        <div className="p-4 border border-white/10 bg-white/5">
                            <div className="text-[9px] text-white/40 uppercase mb-1">Success Probability</div>
                            <div className="text-xl font-bold text-white">14.2%</div>
                        </div>
                        <div className="p-4 border border-white/10 bg-white/5">
                            <div className="text-[9px] text-white/40 uppercase mb-1">Implied MC</div>
                            <div className="text-xl font-bold text-white">$18.6M</div>
                        </div>
                        <div className="p-4 border border-white/10 bg-white/5">
                            <div className="text-[9px] text-white/40 uppercase mb-1">Oracles Logged</div>
                            <div className="text-xl font-bold text-white">2,482</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Pot & Action */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
                <div className="glass-card p-6 border-b-4 border-b-neon-purple">
                    <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2">Total Pot Size</div>
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-5xl font-black italic text-white glitch-text">$1,500</span>
                        <span className="text-xs text-neon-purple font-bold">12.4 SOL</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex border border-white/10 p-1 bg-black/40">
                            <button className="flex-1 py-2 text-[10px] font-black uppercase italic bg-neon-purple text-white">SOL</button>
                            <button className="flex-1 py-2 text-[10px] font-black uppercase italic text-white hover:bg-white/5 transition-colors">$CROWD</button>
                        </div>

                        <div className="relative">
                            <input
                                className="w-full bg-white/5 border border-white/10 h-14 px-4 font-black text-xl text-white focus:border-acid-green focus:ring-0 outline-none placeholder:text-white/20"
                                placeholder="0.00"
                                type="text"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-acid-green hover:underline">MAX</button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {['0.1', '0.5', '1.0', '5.0'].map((amt) => (
                                <button key={amt} className="py-1.5 border border-white/10 text-white text-[9px] font-bold hover:border-acid-green transition-all">
                                    {amt}
                                </button>
                            ))}
                        </div>

                        <button className="w-full py-4 bg-neon-purple text-white font-black uppercase italic tracking-widest text-sm neon-border-purple hover:translate-y-[-2px] active:translate-y-[1px] transition-all">
                            Submit Prediction
                        </button>
                    </div>
                </div>

                <div className="glass-card p-4 border border-white/10 group cursor-pointer hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-white/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-acid-green">skull</span>
                        </div>
                        <div className="flex-1">
                            <div className="text-[10px] text-white/40 uppercase font-black">Oracle Reputation</div>
                            <div className="text-xs font-bold uppercase italic text-white">Rank: Uncalibrated</div>
                        </div>
                        <span className="material-symbols-outlined text-white/20 group-hover:text-white transition-colors">chevron_right</span>
                    </div>
                </div>

                <div className="p-4 bg-acid-green/5 border border-acid-green/20 text-[10px] leading-relaxed text-white/60">
                    <span className="text-acid-green font-bold">INFO:</span> Predictions are locked until the bonding curve hits 100%. Early predictors receive a 1.2x multiplier on pot share.
                </div>
            </div>

            {/* Ticker Footer (Embedded in grid or separate, using separate wrapper here to match layout) */}
            <div className="col-span-12 mt-6">
                <footer className="h-10 bg-black border-t border-white/10 flex items-center overflow-hidden w-full">
                    <div className="ticker-scroll whitespace-nowrap flex items-center gap-12 text-[10px] font-bold uppercase tracking-widest w-full animate-ticker">
                        <span className="text-acid-green"><span className="bg-acid-green text-black px-2 py-0.5 mr-2">LIVE HIT</span> USER_892X COLLECTED $4,200 (12.0x ROI)</span>
                        <span className="text-white/40">//</span>
                        <span className="text-neon-purple"><span className="bg-neon-purple text-white px-2 py-0.5 mr-2">WHALE ALERT</span> SOLANA_KING LOGGED 25.0x PREDICTION</span>
                        <span className="text-white/40">//</span>
                        <span className="text-acid-green"><span className="bg-acid-green text-black px-2 py-0.5 mr-2">LIVE HIT</span> DEGEN_MASTER COLLECTED $890 (5.5x ROI)</span>
                        <span className="text-white/40">//</span>
                        <span className="text-white"><span className="bg-white text-black px-2 py-0.5 mr-2">NEW POOL</span> $PEPE3 POT INCREASED BY 2.4 SOL</span>
                        <span className="text-white/40">//</span>
                        <span className="text-acid-green"><span className="bg-acid-green text-black px-2 py-0.5 mr-2">LIVE HIT</span> USER_892X COLLECTED $4,200 (12.0x ROI)</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
