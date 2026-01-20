'use client';

import { NextPage } from "next";
import React, { useState, useEffect } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { format, toZonedTime } from 'date-fns-tz';
import { differenceInSeconds, addMinutes, startOfHour, setHours, setMinutes, setSeconds, isBefore } from 'date-fns';

const ANCHOR_HOUR = 17; // 5 PM
const TIMEZONE = 'America/Los_Angeles';

export default function OracleTerminal() {
    const { connected } = useWallet();
    const [prediction, setPrediction] = useState<number>(15.0);
    const [stakeAmount, setStakeAmount] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<{ hours: string, minutes: string, seconds: string }>({ hours: '00', minutes: '00', seconds: '00' });
    const [nextRoundTime, setNextRoundTime] = useState<Date | null>(null);

    // Economic Simulation State
    const [potSol, setPotSol] = useState<number>(10.51);
    const [pumpInjection, setPumpInjection] = useState<number>(0.5);
    const [burnedTokens, setBurnedTokens] = useState<number>(1250);

    // Simulate Pot Growth
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.9) {
                setPotSol(prev => prev + 0.024);
                setBurnedTokens(prev => prev + 15);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const zonedNow = toZonedTime(now, TIMEZONE);

            // Set Anchor Time: Today at 5:00 PM PST
            let anchorTime = setSeconds(setMinutes(setHours(toZonedTime(new Date(), TIMEZONE), ANCHOR_HOUR), 0), 0);

            // If we are BEFORE 5 PM, count down to 5 PM
            if (isBefore(zonedNow, anchorTime)) {
                // anchorTime is correct
            } else {
                // If we are AFTER 5 PM, round up to the next 30-minute interval
                // e.g. 5:12 -> 5:30. 5:45 -> 6:00.
                const minutes = zonedNow.getMinutes();
                const nextInterval = minutes < 30 ? 30 : 60;
                anchorTime = setSeconds(setMinutes(startOfHour(zonedNow), nextInterval), 0);
            }

            setNextRoundTime(anchorTime);

            const diff = differenceInSeconds(anchorTime, zonedNow);

            if (diff <= 0) {
                setPotSol(1.0);
                setPumpInjection(0);
                return { hours: '00', minutes: '00', seconds: '00' };
            }

            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = Math.floor(diff % 60);

            return {
                hours: h.toString().padStart(2, '0'),
                minutes: m.toString().padStart(2, '0'),
                seconds: s.toString().padStart(2, '0')
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-background-light text-primary min-h-screen font-display selection:bg-neon-green selection:text-primary">


            <div className="relative min-h-screen w-full flex flex-col grid-bg bg-opacity-5 pb-20">

                {/* Navbar */}
                <header className="flex items-center justify-between px-10 py-6 border-b-2 border-primary bg-white/90 backdrop-blur-sm sticky top-0 z-50">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-4 w-[240px]">
                        <div className="size-10 bg-primary text-neon-green flex items-center justify-center rounded-lg shadow-[4px_4px_0px_0px_rgba(204,255,0,1)]">
                            <span className="material-symbols-outlined text-3xl">query_stats</span>
                        </div>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                            CROWD<br /><span className="text-sm tracking-widest text-primary/60 not-italic font-bold">ORACLE</span>
                        </h1>
                    </div>

                    {/* Center: Nav Links */}
                    <div className="flex-1 flex justify-center">
                        <nav className="flex items-center gap-8 bg-white border-2 border-primary px-6 py-3 rounded-full shadow-[4px_4px_0px_0px_#141414]">
                            <a href="#" className="font-bold text-sm uppercase tracking-wider hover:text-neon-purple transition-colors">Terminal</a>
                            <a href="#" className="font-bold text-sm uppercase tracking-wider text-primary/40 hover:text-primary transition-colors">Leaderboard</a>
                            <a href="#" className="font-bold text-sm uppercase tracking-wider text-primary/40 hover:text-primary transition-colors">Docs</a>
                        </nav>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4 w-[240px] justify-end">
                        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg border-2 border-primary">
                            <span className="material-symbols-outlined text-neon-green text-sm translate-y-[1px]">token</span>
                            <span className="text-xs font-mono font-bold">$SOL: $142.65</span>
                        </div>

                        <div className="relative">
                            <div className="flex items-center gap-2 px-6 py-2 bg-neon-green text-primary border-2 border-primary rounded-lg font-black uppercase italic tracking-wider hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all shadow-[4px_4px_0px_0px_#141414] cursor-pointer">
                                <span className="material-symbols-outlined">wallet</span>
                                <span className="text-sm">Connect</span>
                            </div>
                            {/* Invisible Wallet Adapter Button Overlay */}
                            <div className="absolute inset-0 opacity-0 cursor-pointer">
                                <WalletMultiButton />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 max-w-[1440px] mx-auto w-full px-10 pt-12">

                    {/* Countdown Section */}
                    <div className="flex flex-col items-center mb-16">
                        <div className="flex items-end gap-2 mb-4">
                            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">timer</span>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Round Ends In</h2>
                        </div>

                        <div className="flex gap-6">
                            {/* Hours */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-28 h-32 bg-primary rounded-xl flex items-center justify-center border-4 border-primary shadow-[8px_8px_0px_0px_#b026ff] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/5 skew-y-12 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    <span className="text-7xl font-mono font-bold text-white tracking-tighter">{timeLeft.hours}</span>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-primary/60">Hours</span>
                            </div>

                            <span className="text-6xl font-black self-center pb-8 animate-pulse">:</span>

                            {/* Minutes */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-28 h-32 bg-primary rounded-xl flex items-center justify-center border-4 border-primary shadow-[8px_8px_0px_0px_#b026ff] relative overflow-hidden">
                                    <span className="text-7xl font-mono font-bold text-white tracking-tighter">{timeLeft.minutes}</span>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-primary/60">Minutes</span>
                            </div>

                            <span className="text-6xl font-black self-center pb-8 animate-pulse">:</span>

                            {/* Seconds */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-28 h-32 bg-primary rounded-xl flex items-center justify-center border-4 border-primary shadow-[8px_8px_0px_0px_#b026ff] relative overflow-hidden">
                                    <span className="text-7xl font-mono font-bold text-white tracking-tighter">{timeLeft.seconds}</span>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-primary/60">Seconds</span>
                            </div>
                        </div>
                    </div>

                    {/* 3-Column Layout */}
                    <div className="grid grid-cols-12 gap-8 items-start">

                        {/* Left Column (3 Spans) */}
                        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                            {/* Live Asset Card */}
                            <div className="bg-white border-4 border-primary rounded-2xl p-6 shadow-[8px_8px_0px_0px_#141414]">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="size-16 rounded-xl border-4 border-primary overflow-hidden bg-neon-green/20">
                                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXseSWT3F3PRp40BzMmD6YSbYJBR-crmVEEUw32I1EWRMr8yiRdImQJuDUbRXUrQn8T0X0I7GZgTovmF3KREDYdtZNe7YrFgJ83yplnzFMkA0LGTazEmH9hPcZ4Tt-HVBSBzd245mMomPOVcbBhqOZ2-denwRanQm_omUBsmw8aTWbXS0pQCcahUf_uel7v3Ujcq6mxy09VO_UOcETlQ16j6wxa4eLclMo7wXaF7goFQm2NAA0I3gjHQ0bVOcWv6tyGxhKOrRY5Cc" alt="Token" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="px-3 py-1 bg-neon-green border-2 border-primary rounded-full text-xs font-black uppercase italic animate-pulse">Live</span>
                                </div>

                                <h3 className="text-3xl font-black italic uppercase leading-none mb-1">$PEPE3</h3>
                                <p className="text-sm font-mono text-primary/60 mb-6 truncate">0xPepe...3vSol</p>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                            <span>Bonding</span>
                                            <span>88%</span>
                                        </div>
                                        <div className="h-4 w-full bg-primary/10 rounded-full border-2 border-primary overflow-hidden">
                                            <div className="h-full bg-neon-purple w-[88%] relative">
                                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-t-2 border-dashed border-primary/20">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-primary/40">Market Cap</p>
                                            <p className="font-mono font-bold">$1.24M</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-primary/40">Liquidity</p>
                                            <p className="font-mono font-bold">$240K</p>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 border-2 border-primary bg-primary text-white font-black uppercase italic tracking-widest hover:bg-neon-green hover:text-primary transition-colors">
                                        View Chart
                                    </button>
                                </div>
                            </div>

                            {/* Oracle Feed */}
                            <div className="bg-primary border-4 border-primary rounded-2xl p-6 text-white shadow-[8px_8px_0px_0px_#ccff00]">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-neon-green">rss_feed</span>
                                    <h4 className="font-black italic uppercase tracking-wider text-sm">Oracle Feed</h4>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { user: 'G8Xp...m2K', roi: '12.5x', color: 'text-neon-green' },
                                        { user: 'Ar4z...L9q', roi: '2.1x', color: 'text-neon-purple' },
                                        { user: '2Wnn...o0X', roi: '28.0x', color: 'text-neon-green' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between font-mono text-xs border-b border-white/10 pb-2">
                                            <span className="text-white/60">{item.user}</span>
                                            <span className={`font-bold ${item.color}`}>{item.roi}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Center Column (6 Spans) - Prediction Zone */}
                        <div className="col-span-12 lg:col-span-6">
                            <div className="bg-white border-4 border-primary rounded-3xl p-8 shadow-[12px_12px_0px_0px_#141414] relative overflow-hidden">
                                {/* Background Decor */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="px-6 py-2 border-2 border-primary rounded-full bg-white mb-6">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Prediction Zone</span>
                                    </div>

                                    <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
                                        Forecast<br />The Peak
                                    </h2>
                                    <p className="text-primary/60 font-medium max-w-md mx-auto mb-12">
                                        Estimate the highest ROI multiplier $PEPE3 will hit within the first hour of trading.
                                    </p>

                                    {/* Slider Area */}
                                    <div className="w-full max-w-lg mb-12">
                                        <div className="flex justify-between items-end mb-8 relative">
                                            <div className="text-center group cursor-pointer hover:-translate-y-1 transition-transform">
                                                <p className="text-[10px] font-black uppercase text-primary/40 mb-1">Floor</p>
                                                <p className="text-2xl font-black italic text-primary/40 group-hover:text-primary transition-colors">0x</p>
                                            </div>

                                            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-center">
                                                <div className="text-7xl font-black font-mono tracking-tighter italic tabular-nums relative">
                                                    {prediction.toFixed(1)}
                                                    <span className="text-3xl text-neon-purple absolute top-0 -right-8">x</span>
                                                </div>
                                                <div className="text-xs font-bold uppercase tracking-widest bg-neon-green px-3 py-1 rounded inline-block -rotate-2 mt-2 border border-primary">Your Pick</div>
                                            </div>

                                            <div className="text-center group cursor-pointer hover:-translate-y-1 transition-transform">
                                                <p className="text-[10px] font-black uppercase text-primary/40 mb-1">Cap</p>
                                                <p className="text-2xl font-black italic text-primary/40 group-hover:text-primary transition-colors">30x</p>
                                            </div>
                                        </div>

                                        <div className="relative h-12 flex items-center">
                                            <div className="absolute w-full h-4 bg-primary/5 rounded-full border-2 border-primary/10 overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-neon-purple to-neon-green opacity-50"></div>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="30"
                                                step="0.1"
                                                value={prediction}
                                                onChange={(e) => setPrediction(parseFloat(e.target.value))}
                                                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                            />
                                            {/* Custom Thumb Representation for Visuals if needed, though CSS handles it */}
                                            <div
                                                className="absolute h-8 w-8 bg-primary rounded-full border-4 border-neon-green shadow-[0_0_20px_#ccff00] z-10 pointer-events-none transition-all"
                                                style={{ left: `calc(${prediction / 30 * 100}% - 16px)` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div className="bg-primary text-white p-5 rounded-xl border-2 border-primary flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Win Probability</span>
                                            <span className="text-3xl font-mono font-bold group-hover:text-neon-green transition-colors">14.2%</span>
                                        </div>
                                        <div className="bg-white p-5 rounded-xl border-2 border-primary flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Est. Payout</span>
                                            <span className="text-3xl font-mono font-bold group-hover:text-neon-purple transition-colors">$4,850</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column (3 Spans) */}
                        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                            {/* Pot Card */}
                            <div className="bg-white border-4 border-primary rounded-2xl p-6 shadow-[8px_8px_0px_0px_#141414]">
                                <div className="text-center mb-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Current Pot</p>
                                    <h3 className="text-5xl font-black italic glitch-text">${(potSol * 145).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                                    <p className="font-mono text-xs font-bold text-neon-purple mt-1 flex items-center justify-center gap-1">
                                        {potSol.toFixed(2)} SOL
                                        <span className="bg-neon-green text-primary px-1 rounded text-[10px] ml-1 animate-pulse">+{pumpInjection} SOL (Pump)</span>
                                    </p>
                                </div>

                                {/* Input Area */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex p-1 bg-primary/5 rounded-lg border-2 border-primary/10">
                                        <button className="flex-1 py-2 text-[10px] font-black uppercase rounded bg-primary text-white shadow-sm">SOL</button>
                                        <button className="flex-1 py-2 text-[10px] font-black uppercase rounded text-primary/60 hover:text-primary transition-colors">$CROWD</button>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full h-12 bg-white border-2 border-primary rounded-lg pl-4 pr-12 font-mono font-bold text-lg focus:outline-none focus:ring-4 focus:ring-neon-green/20"
                                            value={stakeAmount}
                                            onChange={(e) => setStakeAmount(e.target.value)}
                                        />
                                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-neon-purple hover:underline">Max</button>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {['0.1', '0.5', '1.0', '5.0'].map(val => (
                                            <button key={val} className="py-2 border-2 border-primary/10 rounded-lg text-[10px] font-black hover:border-primary hover:bg-neon-green hover:text-primary transition-all">
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button className="w-full py-4 bg-primary text-white text-lg font-black uppercase italic tracking-widest rounded-xl border-4 border-primary hover:bg-neon-green hover:text-primary hover:border-primary hover:shadow-[4px_4px_0px_0px_#141414] transition-all group relative overflow-hidden">
                                    <span className="relative z-10 group-hover:mr-2 transition-all">Lock It In</span>
                                    <span className="material-symbols-outlined align-middle text-sm absolute right-12 opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all">lock</span>
                                </button>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-dashed border-primary/20">
                                    <p className="text-[10px] font-bold text-primary/40">
                                        Fee: 10% • RevShare: 5%
                                    </p>
                                    <p className="text-[10px] font-bold text-orange-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[10px]">local_fire_department</span>
                                        {burnedTokens.toLocaleString()} CROWD Burned
                                    </p>
                                </div>
                            </div>

                            {/* Degen Status */}
                            <div className="border-4 border-dashed border-primary/20 rounded-2xl p-6 bg-white flex items-center gap-4 hover:bg-primary/5 cursor-pointer transition-colors group">
                                <div className="size-12 bg-primary rounded-full flex items-center justify-center text-neon-green group-hover:rotate-12 transition-transform">
                                    <span className="material-symbols-outlined">military_tech</span>
                                </div>
                                <div>
                                    <h4 className="font-black italic uppercase text-sm">Degen Rank</h4>
                                    <p className="text-xs text-primary/60 font-medium">Unranked. Stake to reveal.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </main>

                {/* Footer Ticker */}
                <div className="fixed bottom-0 left-0 right-0 bg-primary text-white py-3 border-t-4 border-neon-green overflow-hidden flex items-center z-40">
                    <div className="px-4 border-r border-white/20 mr-4 z-50 bg-primary">
                        <span className="text-[10px] font-black uppercase text-neon-green tracking-widest">Recent Activity</span>
                    </div>
                    <div className="flex gap-12 animate-scroll whitespace-nowrap font-mono text-xs font-bold uppercase tracking-wider opacity-80 w-max">
                        {/* Original Set */}
                        <div className="flex gap-12">
                            <span>User 892x won <span className="text-neon-green">12.0x ROI</span> (+$4,200)</span>
                            <span>•</span>
                            <span>Oracle_King won <span className="text-neon-purple">5.5x ROI</span> (+$890)</span>
                            <span>•</span>
                            <span>DegenMaster won <span className="text-neon-green">25.0x ROI</span> (+$12,400)</span>
                            <span>•</span>
                            <span>Satoshi_Nakamoto won <span className="text-neon-green">100.0x ROI</span> (+$50,000)</span>
                            <span>•</span>
                            <span>Vitalik_B won <span className="text-neon-purple">2.0x ROI</span> (+$100)</span>
                            <span>•</span>
                        </div>
                        {/* Duplicate Set for Loop */}
                        <div className="flex gap-12">
                            <span>User 892x won <span className="text-neon-green">12.0x ROI</span> (+$4,200)</span>
                            <span>•</span>
                            <span>Oracle_King won <span className="text-neon-purple">5.5x ROI</span> (+$890)</span>
                            <span>•</span>
                            <span>DegenMaster won <span className="text-neon-green">25.0x ROI</span> (+$12,400)</span>
                            <span>•</span>
                            <span>Satoshi_Nakamoto won <span className="text-neon-green">100.0x ROI</span> (+$50,000)</span>
                            <span>•</span>
                            <span>Vitalik_B won <span className="text-neon-purple">2.0x ROI</span> (+$100)</span>
                            <span>•</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
