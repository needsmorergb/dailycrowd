'use client';

import { useState } from 'react';
import SliderEntry from '@/components/SliderEntry';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function OracleTerminal() {
    const { connected } = useWallet();
    const [value, setValue] = useState(2);

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* TERMINAL CONTAINER */}
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-[#0F0F1A] shadow-2xl relative">
                {/* GLOW EFFECTS */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                <div className="absolute -left-20 top-20 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

                {/* 1. HEADER BAR */}
                <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Round (Asia)</span>
                        </div>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest hidden md:inline-block">Ends in <span className="text-white font-mono">01:55:17</span></span>
                    </div>
                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                        <div className="text-right">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Current Pot</div>
                            <div className="text-lg font-black text-white font-mono">$450.00</div>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-right">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Weekly Jackpot</div>
                            <div className="text-lg font-black text-yellow-400 font-mono text-shadow-glow">$52,400</div>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">

                    {/* LEFT: TARGET INFO (4 Cols) */}
                    <div className="lg:col-span-4 p-8 border-b lg:border-b-0 lg:border-r border-white/5 bg-gradient-to-b from-transparent to-black/20">
                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Target Asset</div>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-black rounded-3xl border border-white/10 shadow-xl flex items-center justify-center text-6xl mb-6 relative group">
                                🐸
                                <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 transition-all rounded-3xl"></div>
                            </div>

                            <h2 className="text-4xl font-black text-white leading-none mb-1">PEPE 3.0</h2>
                            <span className="text-sm font-mono text-primary mb-6">$PEPE3</span>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] text-muted-foreground uppercase">Bonding Curve</div>
                                    <div className="text-white font-mono text-sm">32%</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                    <div className="text-[10px] text-muted-foreground uppercase">Dev Wallet</div>
                                    <div className="text-green-400 font-mono text-sm">Active</div>
                                </div>
                                <div className="col-span-2 bg-white/5 p-3 rounded-lg border border-white/5 flex justify-between items-center px-4 cursor-pointer hover:bg-white/10 transition-colors">
                                    <span className="text-[10px] text-muted-foreground uppercase">CA:</span>
                                    <span className="text-xs font-mono text-muted-foreground">8xP...9jL</span>
                                    <span>📋</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER: PREDICTION SLIDER (5 Cols) */}
                    <div className="lg:col-span-5 p-8 flex flex-col justify-center relative">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-white mb-2">Predict Peak ROI</h3>
                            <p className="text-xs text-muted-foreground">Adjust slider to predict the 1H High</p>
                        </div>

                        {/* SLIDER COMPONENT LOGIC INLINE FOR TIGHTER INTEGRATION */}
                        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 mb-8">
                            <div className="flex justify-between items-center mb-10">
                                <span className="text-5xl font-black text-white font-mono">{value}x</span>
                                <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${value > 15 ? 'bg-green-500/20 text-green-500' : value === 0 ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'}`}>
                                    {value === 0 ? 'RUG PULL' : value >= 15 ? 'MOON MISSION' : 'VOLATILE'}
                                </span>
                            </div>

                            <div className="relative py-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    step="0.1"
                                    value={value}
                                    onChange={(e) => setValue(parseFloat(e.target.value))}
                                    className="slider w-full cursor-pointer h-2 bg-gray-800 rounded-lg appearance-none"
                                    style={{
                                        background: `linear-gradient(to right, #ef4444 0%, #a3e635 ${Math.min((value / 30) * 100, 100)}%, #374151 ${Math.min((value / 30) * 100, 100)}%, #1f2937 100%)`
                                    }}
                                />
                            </div>
                            <div className="flex justify-between mt-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                <span>0x</span>
                                <span>15x</span>
                                <span>30x</span>
                            </div>
                        </div>

                        {connected ? (
                            <button className="w-full py-4 text-center rounded-xl bg-primary text-black font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                                Start Oracle Session
                            </button>
                        ) : (
                            <div className="w-full">
                                <WalletMultiButton className="!w-full !justify-center !bg-white/10 !border !border-white/10 !h-14 !rounded-xl !font-bold hover:!bg-white/20" />
                            </div>
                        )}
                    </div>

                    {/* RIGHT: LEADERBOARD / STATS (3 Cols) */}
                    <div className="lg:col-span-3 border-l border-white/5 bg-black/20 p-6 flex flex-col">
                        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Live Oracle Feed</div>

                        <div className="flex-grow space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                            {[1, 2, 3, 4, 5, 6].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px]">
                                        👽
                                    </div>
                                    <div className="flex-grow">
                                        <div className="text-xs font-bold text-white">Whale_{8392 + i}</div>
                                        <div className="text-[10px] text-muted-foreground">Staked 5,000 $CROWD</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-primary">12.5x</div>
                                        <div className="text-[10px] text-muted-foreground">Prediction</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 text-center">
                            <p className="text-[10px] text-muted-foreground">Global Consensus: <span className="text-white font-bold">8.4x</span></p>
                        </div>
                    </div>

                </div>
            </div>

            {/* FOOTER STATS */}
            <div className="grid grid-cols-3 gap-6 mt-8 opacity-60">
                <div className="text-center">
                    <div className="text-2xl font-black text-white">4,203</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Active Oracles</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-black text-white">$1.2M</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Volume (24h)</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-black text-white">2.5%</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Supply Burned</div>
                </div>
            </div>
        </div>
    );
}
