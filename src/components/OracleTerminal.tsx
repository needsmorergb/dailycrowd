'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function OracleTerminal() {
    const { connected } = useWallet();
    const [prediction, setPrediction] = useState(15.0);
    const [stakeAmount, setStakeAmount] = useState('');

    return (
        <div className="w-full">
            {/* Global Timer & Header Section */}
            <div className="flex flex-col items-center mb-10">
                <p className="text-primary/60 text-xs font-bold uppercase tracking-[0.3em] mb-4">Oracle Window Closing In</p>
                <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-primary border-b-4 border-accent-purple">
                            <p className="text-white text-4xl font-mono font-bold leading-tight glitch-text">00</p>
                        </div>
                        <p className="text-primary text-xs font-black uppercase italic">Hours</p>
                    </div>
                    <div className="text-4xl font-mono font-bold self-center pb-6">:</div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-primary border-b-4 border-accent-purple">
                            <p className="text-white text-4xl font-mono font-bold leading-tight glitch-text">14</p>
                        </div>
                        <p className="text-primary text-xs font-black uppercase italic">Minutes</p>
                    </div>
                    <div className="text-4xl font-mono font-bold self-center pb-6">:</div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-primary border-b-4 border-accent-purple">
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
                            <span className="px-2 py-1 bg-accent text-primary text-[10px] font-black uppercase tracking-tighter italic">Live Asset</span>
                            <span className="cursor-pointer hover:text-primary material-symbols-outlined text-primary/40">info</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-14 rounded-full bg-primary flex items-center justify-center p-1 border-2 border-primary">
                                <div className="w-full h-full rounded-full bg-cover bg-center flex items-center justify-center text-3xl">
                                    🐸
                                </div>
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
                                    <span className="text-accent-purple">88%</span>
                                </div>
                                <div className="h-4 w-full bg-primary/10 rounded-full overflow-hidden p-1 border border-primary/20">
                                    <div className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent shadow-[0_0_10px_rgba(176,38,255,0.5)]" style={{ width: '88%' }}></div>
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
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-accent">Live Oracle Feed</h4>
                        <div className="space-y-3 font-mono text-[11px]">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-white/60">G8Xp...m2K</span>
                                <span className="text-accent">12.5x ROI</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-white/60">Ar4z...L9q</span>
                                <span className="text-accent-purple">2.1x ROI</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-white/60">2Wnn...o0X</span>
                                <span className="text-accent">28.0x ROI</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">FkPq...3mS</span>
                                <span className="text-accent-purple">5.5x ROI</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Column: Prediction Zone */}
                <div className="col-span-12 lg:col-span-6 space-y-8">
                    <div className="p-8 rounded-2xl border-4 border-primary bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-purple/10 -ml-16 -mb-16 rounded-full blur-3xl"></div>

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
                                    <p className="text-xs font-black uppercase tracking-widest text-primary bg-accent px-4 py-1 rounded-full border-2 border-primary italic scale-125 inline-block">Your Prediction</p>
                                    <p className="text-6xl font-black italic mt-4 font-mono leading-none">{prediction.toFixed(1)}<span className="text-2xl">X</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-primary/40">Maximum</p>
                                    <p className="text-2xl font-black italic">30X</p>
                                </div>
                            </div>

                            <div className="relative w-full h-6 flex items-center group">
                                <div className="absolute w-full h-3 bg-primary/10 rounded-full border border-primary/20 overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${(prediction / 30) * 100}%` }}></div>
                                </div>
                                <input
                                    className="absolute w-full h-full bg-transparent appearance-none cursor-pointer z-10 opacity-0"
                                    max="30"
                                    min="0"
                                    step="0.1"
                                    type="range"
                                    value={prediction}
                                    onChange={(e) => setPrediction(parseFloat(e.target.value))}
                                />
                                {/* Custom Thumb Position hack since regular styling is hard in pure React */}
                                <div
                                    className="absolute h-6 w-6 bg-primary border-4 border-accent rounded-full shadow-[0_0_15px_#ccff00] pointer-events-none transition-all"
                                    style={{ left: `calc(${(prediction / 30) * 100}% - 12px)` }}
                                ></div>
                            </div>

                            <div className="flex justify-between mt-6 px-2">
                                {[...Array(9)].map((_, i) => (
                                    <span key={i} className={`w-1 h-3 bg-primary/20 rounded-full ${i === 4 ? 'scale-y-150 bg-primary/40' : ''}`}></span>
                                ))}
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
                        <span className="material-symbols-outlined text-accent">lightbulb</span>
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
                                <input
                                    className="w-full h-14 bg-white border-2 border-primary rounded-xl px-4 text-xl font-bold font-mono focus:ring-0 focus:border-accent-purple outline-none"
                                    placeholder="0.00"
                                    type="number"
                                    value={stakeAmount}
                                    onChange={(e) => setStakeAmount(e.target.value)}
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-accent-purple hover:underline italic">Max</button>
                            </div>

                            <div className="grid grid-cols-4 gap-2 mb-6">
                                {['0.1', '0.5', '1.0', '5.0'].map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setStakeAmount(amt)}
                                        className="py-2 text-[10px] font-black border border-primary/20 rounded hover:bg-primary hover:text-white transition-colors"
                                    >
                                        {amt}
                                    </button>
                                ))}
                            </div>

                            {connected ? (
                                <button className="w-full py-4 bg-accent text-primary border-4 border-primary rounded-xl text-lg font-black uppercase italic tracking-widest hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all group active:scale-95">
                                    Lock Prediction
                                    <span className="align-middle ml-2 group-hover:translate-x-1 transition-transform inline-block">🚀</span>
                                </button>
                            ) : (
                                <div className="w-full">
                                    <WalletMultiButton className="!w-full !justify-center !bg-primary !text-white !h-14 !rounded-xl !font-black !uppercase !italic !tracking-widest hover:!bg-primary/90" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-primary/60">Oracle Fee (2%)</span>
                                <span className="font-mono font-bold">0.002 SOL</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-primary/60">Platform Boost</span>
                                <span className="text-accent-purple font-mono font-bold">+0.5x Bonus</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Ticker */}
            <div className="mt-16 border-t-2 border-primary pt-8 pb-8">
                <div className="flex items-center gap-6 overflow-hidden whitespace-nowrap">
                    <p className="text-[10px] font-black uppercase italic bg-primary text-accent px-3 py-1">Recent Hits</p>
                    <div className="flex gap-12 font-mono text-[11px] font-bold uppercase tracking-widest animate-pulse">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> User 892x hit 12.0x ROI (+$4,200)</span>
                        <span className="flex items-center gap-2 text-primary/40">●</span>
                        <span className="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-green-500"></span> Oracle_King hit 5.5x ROI (+$890)</span>
                        <span className="flex items-center gap-2 text-primary/40">●</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> DegenMaster hit 25.0x ROI (+$12,400)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
