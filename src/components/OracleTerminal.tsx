'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function OracleTerminal() {
    const { connected } = useWallet();
    const [prediction, setPrediction] = useState(15.0);

    return (
        <div className="flex-1 px-10 py-8 max-w-[1600px] mx-auto w-full">
            {/* Global Timer & Header Section */}
            <div className="flex flex-col items-center mb-10">
                <p className="text-primary/60 text-xs font-bold uppercase tracking-[0.3em] mb-4">Oracle Window Closing In</p>
                <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-primary border-b-4 border-neon-purple">
                            <p className="text-white text-4xl font-mono font-bold leading-tight glitch-text">00</p>
                        </div>
                        <p className="text-primary text-xs font-black uppercase italic">Hours</p>
                    </div>
                    <div className="text-4xl font-mono font-bold self-center pb-6">:</div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-primary border-b-4 border-neon-purple">
                            <p className="text-white text-4xl font-mono font-bold leading-tight glitch-text">14</p>
                        </div>
                        <p className="text-primary text-xs font-black uppercase italic">Minutes</p>
                    </div>
                    <div className="text-4xl font-mono font-bold self-center pb-6">:</div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-primary border-b-4 border-neon-purple">
                            <p className="text-white text-4xl font-mono font-bold leading-tight glitch-text">45</p>
                        </div>
                        <p className="text-primary text-xs font-black uppercase italic">Seconds</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Token Info */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="p-6 rounded-xl border-2 border-primary bg-white shadow-[8px_8px_0px_0px_#141414]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="px-2 py-1 bg-neon-green text-primary text-[10px] font-black uppercase tracking-tighter italic">Live Asset</span>
                            <span className="material-symbols-outlined text-primary/40 cursor-pointer hover:text-primary">info</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-14 rounded-full bg-primary flex items-center justify-center p-1 border-2 border-primary">
                                <div className="w-full h-full rounded-full bg-cover bg-center" data-alt="Cartoon frog token mascot profile" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXseSWT3F3PRp40BzMmD6YSbYJBR-crmVEEUw32I1EWRMr8yiRdImQJuDUbRXUrQn8T0X0I7GZgTovmF3KREDYdtZNe7YrFgJ83yplnzFMkA0LGTazEmH9hPcZ4Tt-HVBSBzd245mMomPOVcbBhqOZ2-denwRanQm_omUBsmw8aTWbXS0pQCcahUf_uel7v3Ujcq6mxy09VO_UOcETlQ16j6wxa4eLclMo7wXaF7goFQm2NAA0I3gjHQ0bVOcWv6tyGxhKOrRY5Cc')" }}></div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic uppercase leading-none">$PEPE3</h3>
                                <p className="text-primary/60 text-xs font-mono">0xPepe...3vSol</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                    <span>Bonding Progress</span>
                                    <span className="text-neon-purple">88%</span>
                                </div>
                                <div className="h-4 w-full bg-primary/10 rounded-full overflow-hidden p-1 border border-primary/20">
                                    <div className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-green shadow-[0_0_10px_rgba(176,38,255,0.5)]" style={{ width: '88%' }}></div>
                                </div>
                                <p className="text-[10px] text-primary/40 text-center italic">Migration to Raydium Imminent</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-primary/10">
                                <div>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase">Market Cap</p>
                                    <p className="text-sm font-mono font-bold">$1.24M</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase">Holders</p>
                                    <p className="text-sm font-mono font-bold">14,209</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase">Price</p>
                                    <p className="text-sm font-mono font-bold text-green-600">+$0.0042</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase">Liquidity</p>
                                    <p className="text-sm font-mono font-bold">$240K</p>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-primary text-white text-xs font-black uppercase italic tracking-widest hover:translate-x-1 hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_0px_#ccff00]">
                                View On Solscan
                            </button>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border-2 border-primary bg-primary text-white">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-neon-green">Live Oracle Feed</h4>
                        <div className="space-y-3 font-mono text-[11px]">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-white/60">G8Xp...m2K</span>
                                <span className="text-neon-green">12.5x ROI</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-white/60">Ar4z...L9q</span>
                                <span className="text-neon-purple">2.1x ROI</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-white/60">2Wnn...o0X</span>
                                <span className="text-neon-green">28.0x ROI</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">FkPq...3mS</span>
                                <span className="text-neon-purple">5.5x ROI</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Center Column: Prediction Zone */}
                <div className="col-span-12 lg:col-span-6 space-y-8">
                    <div className="p-8 rounded-2xl border-4 border-primary bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-purple/10 -ml-16 -mb-16 rounded-full blur-3xl"></div>
                        <div className="flex flex-col gap-2 mb-12">
                            <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-tight">Prediction Zone</h1>
                            <p className="text-primary/60 font-medium">Forecast the end-of-round ROI for $PEPE3. Hit the target, sweep the pot.</p>
                        </div>
                        <div className="relative py-12 px-4">
                            <div className="flex justify-between mb-8">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-primary/40">Minimum</p>
                                    <p className="text-2xl font-black italic">0X</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-black uppercase tracking-widest text-primary bg-neon-green px-4 py-1 rounded-full border-2 border-primary italic scale-125">Your Prediction</p>
                                    <p className="text-6xl font-black italic mt-4 font-mono leading-none">{prediction.toFixed(1)}<span className="text-2xl">X</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-primary/40">Maximum</p>
                                    <p className="text-2xl font-black italic">30X</p>
                                </div>
                            </div>
                            <div className="relative w-full h-6 flex items-center group">
                                <div className="absolute w-full h-3 bg-primary/10 rounded-full border border-primary/20"></div>
                                <div className="absolute h-3 bg-primary rounded-full" style={{ width: '50%' }}></div>
                                <input
                                    className="absolute w-full h-full bg-transparent appearance-none cursor-pointer z-10"
                                    max="30"
                                    min="0"
                                    step="0.1"
                                    type="range"
                                    value={prediction}
                                    onChange={(e) => setPrediction(parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="flex justify-between mt-6 px-2">
                                <span className="w-1 h-3 bg-primary/20 rounded-full"></span>
                                <span className="w-1 h-3 bg-primary/20 rounded-full"></span>
                                <span className="w-1 h-3 bg-primary/20 rounded-full"></span>
                                <span className="w-1 h-3 bg-primary/20 rounded-full"></span>
                                <span className="w-1 h-3 bg-primary/40 rounded-full scale-y-150"></span>
                                <span className="w-1 h-3 bg-primary/20 rounded-full"></span>
                                <span className="w-1 h-3 bg-primary/20 rounded-full"></span>
                                <span className="w-1 h-3 bg-primary/20 rounded-full"></span>
                                <span className="w-1 h-3 bg-primary/20 rounded-full"></span>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <div className="flex-1 p-4 rounded-xl bg-primary text-white border-2 border-primary">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1 italic">Win Probability</p>
                                <p className="text-2xl font-bold font-mono">14.2%</p>
                            </div>
                            <div className="flex-1 p-4 rounded-xl border-2 border-primary">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1 italic">Est. Payout</p>
                                <p className="text-2xl font-bold font-mono text-primary">$4,850</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-primary p-4 rounded-xl text-white">
                        <span className="material-symbols-outlined text-neon-green">lightbulb</span>
                        <p className="text-xs font-medium">Tip: Most Oracles are betting between 8x and 12x for this round based on current bonding velocity.</p>
                    </div>
                </div>
                {/* Right Column: Pot & Stake */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="p-6 rounded-xl border-2 border-primary bg-white shadow-[8px_8px_0px_0px_#141414]">
                        <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-2 italic">Current Pot Size</p>
                        <div className="mb-8">
                            <h2 className="text-6xl font-black italic glitch-text leading-tight">$1,500</h2>
                            <p className="text-primary/60 text-xs font-mono">≈ 10.51 SOL</p>
                        </div>
                        <div className="mb-6">
                            <div className="flex rounded-lg border-2 border-primary p-1 bg-primary/5 mb-4">
                                <button className="flex-1 py-2 text-xs font-black uppercase italic rounded bg-primary text-white">SOL</button>
                                <button className="flex-1 py-2 text-xs font-black uppercase italic rounded text-primary hover:bg-primary/10 transition-colors">$CROWD</button>
                            </div>
                            <div className="relative mb-4">
                                <input className="w-full h-14 bg-white border-2 border-primary rounded-xl px-4 text-xl font-bold font-mono focus:ring-0 focus:border-neon-purple outline-none" placeholder="0.00" type="number" />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-neon-purple hover:underline italic">Max</button>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                <button className="py-2 text-[10px] font-black border border-primary/20 rounded hover:bg-primary hover:text-white transition-colors">0.1</button>
                                <button className="py-2 text-[10px] font-black border border-primary/20 rounded hover:bg-primary hover:text-white transition-colors">0.5</button>
                                <button className="py-2 text-[10px] font-black border border-primary/20 rounded hover:bg-primary hover:text-white transition-colors">1.0</button>
                                <button className="py-2 text-[10px] font-black border border-primary/20 rounded hover:bg-primary hover:text-white transition-colors">5.0</button>
                            </div>
                            <button className="w-full py-4 bg-neon-green text-primary border-4 border-primary rounded-xl text-lg font-black uppercase italic tracking-widest hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all group active:scale-95">
                                Lock Prediction
                                <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">rocket_launch</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-primary/60">Oracle Fee (2%)</span>
                                <span className="font-mono font-bold">0.002 SOL</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-primary/60">Platform Boost</span>
                                <span className="text-neon-purple font-mono font-bold">+0.5x Bonus</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl border-2 border-primary bg-primary/5 border-dashed relative group cursor-pointer hover:bg-primary/10 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-neon-green">
                                <span className="material-symbols-outlined">military_tech</span>
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase italic">Degen Status</h4>
                                <p className="text-[10px] text-primary/60 font-medium">Unranked. Stake to reveal.</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined absolute top-4 right-4 text-primary/20 group-hover:text-primary transition-colors">chevron_right</span>
                    </div>
                </div>
            </div>
            {/* Footer Ticker */}
            <div className="mt-16 border-t-2 border-primary pt-8">
                <div className="flex items-center gap-6 overflow-hidden whitespace-nowrap">
                    <p className="text-[10px] font-black uppercase italic bg-primary text-neon-green px-3 py-1">Recent Hits</p>
                    <div className="flex gap-12 font-mono text-[11px] font-bold uppercase tracking-widest animate-pulse">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> User 892x hit 12.0x ROI (+$4,200)</span>
                        <span className="flex items-center gap-2 text-primary/40">●</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Oracle_King hit 5.5x ROI (+$890)</span>
                        <span className="flex items-center gap-2 text-primary/40">●</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> DegenMaster hit 25.0x ROI (+$12,400)</span>
                        <span className="flex items-center gap-2 text-primary/40">●</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> SolanaWhale hit 2.0x ROI (+$450)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
