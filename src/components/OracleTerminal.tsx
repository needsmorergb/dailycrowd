'use client';

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Leaderboard from './Leaderboard';
import Docs from './Docs';
import Whitepaper from './Whitepaper';
import Tokenomics from './Tokenomics';
import { format, toZonedTime } from 'date-fns-tz';
import { differenceInSeconds, addMinutes, startOfHour, setHours, setMinutes, setSeconds, isBefore } from 'date-fns';
import { useVwapPeak } from '../hooks/useVwapPeak';
import { usePayoutSimulation } from '../hooks/usePayoutSimulation';
import { useHouseBonuses } from '../hooks/useHouseBonuses';
import { TokenSelector, TokenCandidate } from '../utils/tokenSelection';
import { TOKEN_SELECTION_CONFIG } from '../utils/tokenSelectionConfig';

interface RoundHistoryItem {
    roundTime: Date;
    peakRoi: number;
    potSol: number;
}

import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { fetchLatestPumpTokens } from '../utils/pumpData';

const ANCHOR_HOUR = 17; // 5 PM
const TIMEZONE = 'America/Los_Angeles';

const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || 'TreasuryAddressGoesHere';

const MIN_FEES = {
    RAPID: 0.03,
    FEATURED: 0.05,
    ANCHOR: 0.06
};

export default function OracleTerminal() {
    const { connected } = useWallet();
    const [prediction, setPrediction] = useState<number>(15.0);
    const [stakeAmount, setStakeAmount] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<{ hours: string, minutes: string, seconds: string }>({ hours: '00', minutes: '00', seconds: '00' });
    const [nextRoundTime, setNextRoundTime] = useState<Date | null>(null);

    // Economic Simulation State
    const [potSol, setPotSol] = useState<number>(10.51);
    const [burnedTokens, setBurnedTokens] = useState<number>(1250);

    // Round Logic State
    const [roundStartTime] = useState<number>(() => Date.now());
    const [launchPrice] = useState<number>(0.00001); // Simulated launch price

    // VWAP Tracking
    const { peakVwap, peakRoi, addTrade } = useVwapPeak(launchPrice, roundStartTime);

    // Token Selection State
    const [candidates, setCandidates] = useState<TokenCandidate[]>([]);
    const [selectedToken, setSelectedToken] = useState<TokenCandidate | null>(null);
    const [isTokenLocked, setIsTokenLocked] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [isLoadingTokens, setIsLoadingTokens] = useState(false);

    // Holder Status (Mocked for now, but ready for token check)
    const [isTokenHolder] = useState(true);
    const [showHoldersView, setShowHoldersView] = useState(false);

    const selector = React.useMemo(() => new TokenSelector(), []);

    // Payout Simulation
    const { lastPayouts, isProcessing, simulatePayout } = usePayoutSimulation();

    // Transaction States
    const [txStatus, setTxStatus] = useState<'idle' | 'signing' | 'confirming' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);

    // House Bonuses
    const { activeBonus, updateBonus } = useHouseBonuses();

    // Verification & History
    const [roundHistory] = useState<RoundHistoryItem[]>([]);

    // Fetch Real Candidates
    useEffect(() => {
        const loadTokens = async () => {
            setIsLoadingTokens(true);
            const liveTokens = await fetchLatestPumpTokens();
            if (liveTokens.length > 0) {
                setCandidates(liveTokens);
                // Auto-select first candidate if none selected
                if (!selectedToken) {
                    const { chosen } = await selector.selectTargetToken('initial', Date.now(), liveTokens);
                    setSelectedToken(chosen);
                }
            }
            setIsLoadingTokens(false);
        };
        loadTokens();
    }, [selectedToken, selector]);

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const handleLockIn = async () => {
        if (!publicKey || !stakeAmount || parseFloat(stakeAmount) <= 0) return;

        try {
            setTxStatus('signing');
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(TREASURY_ADDRESS),
                    lamports: parseFloat(stakeAmount) * LAMPORTS_PER_SOL,
                })
            );

            const signature = await sendTransaction(transaction, connection);
            setTxHash(signature);
            setTxStatus('confirming');

            await connection.confirmTransaction(signature, 'processed');
            setTxStatus('success');

            // Re-simulate payout with real context eventually
            // For now, just mark as entered
        } catch (error) {
            console.error('Transaction failed:', error);
            setTxStatus('error');
        }
    };

    // Simulate Trades & Pot Growth
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate Pot/Burn
            if (Math.random() > 0.9) {
                setPotSol(prev => prev + 0.024);
                setBurnedTokens(prev => prev + 15);
            }

            // Simulate Trades (Market Reality Layer)
            if (Math.random() > 0.7) {
                const volatility = 1 + (Math.random() * 0.4 - 0.2); // +/- 20%
                const lastPrice = peakVwap || launchPrice;
                const newPrice = lastPrice * volatility;
                const volume = Math.random() * 1000 + 100;
                addTrade(newPrice, volume);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [peakVwap, launchPrice, addTrade]);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const zonedNow = toZonedTime(now, TIMEZONE);

            // Set Start Anchor: Today at 5:00 PM PST
            const startAnchor = setSeconds(setMinutes(setHours(toZonedTime(new Date(), TIMEZONE), ANCHOR_HOUR), 0), 0);

            // If we are before the 5 PM anchor, the FIRST round ends at 5:00 PM
            let targetTime: Date;
            if (isBefore(zonedNow, startAnchor)) {
                targetTime = startAnchor;
            } else {
                // If we are after 5 PM, round up to the next 30-minute interval
                const minutes = zonedNow.getMinutes();
                const nextInterval = minutes < 30 ? 30 : 60;
                targetTime = setSeconds(setMinutes(startOfHour(zonedNow), nextInterval), 0);
            }

            setNextRoundTime(targetTime);

            const diff = differenceInSeconds(targetTime, zonedNow);

            // Token Selection Timing (T_snapshot = start_time - 120s)
            if (diff <= TOKEN_SELECTION_CONFIG.SNAPSHOT_BEFORE_START_SEC && !isTokenLocked && candidates.length > 0) {
                selector.selectTargetToken('round-123', Date.now(), candidates).then(result => {
                    setSelectedToken(result.chosen);
                    setIsTokenLocked(true);
                });
            }

            if (diff <= 0) {
                // Round Reset Simulation
                if (!isProcessing && lastPayouts.length === 0) {
                    const mockPredictions = [
                        { userAddress: 'G8Xp...m2K', predictedRoi: peakRoi * 0.95, stakeAmount: 0.03, isHolder: true },
                        { userAddress: 'Ar4z...L9q', predictedRoi: peakRoi * 1.1, stakeAmount: 0.03, isHolder: false },
                        { userAddress: '2Wnn...o0X', predictedRoi: peakRoi * 0.98, stakeAmount: 0.03, isHolder: true },
                    ];
                    simulatePayout(potSol, peakRoi, mockPredictions);
                }

                // Determine Round Type for injection logic
                const roundType = nextRoundTime?.getHours() === 17 && nextRoundTime?.getMinutes() === 0 ? 'ANCHOR' : 'RAPID';
                updateBonus(roundType);

                setPotSol(1.0);
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
    }, [nextRoundTime, isTokenLocked, isProcessing, lastPayouts, peakRoi, potSol, simulatePayout, updateBonus]);

    const currentRoundType = nextRoundTime?.getHours() === ANCHOR_HOUR && nextRoundTime?.getMinutes() === 0
        ? 'ANCHOR'
        : (nextRoundTime?.getHours() && nextRoundTime.getHours() % 4 === 0 ? 'FEATURED' : 'RAPID');

    const minFee = MIN_FEES[currentRoundType];

    return (
        <div className="bg-background-light text-primary min-h-screen font-display selection:bg-neon-green selection:text-primary">


            <div className="relative min-h-screen w-full flex flex-col grid-bg bg-opacity-5 pb-10">

                {/* Daily Anchor Banner (ANCHOR ONLY) */}
                {currentRoundType === 'ANCHOR' && (
                    <div className="w-full bg-primary py-3 text-center border-b-4 border-neon-purple">
                        <span className="text-sm font-black italic text-white tracking-[0.5em] uppercase">
                            DAILY ANCHOR ROUND · 5:00 PM PST
                        </span>
                    </div>
                )}

                {/* Navbar */}
                <header className="flex items-center justify-between px-10 py-3 border-b-2 border-primary bg-white/90 backdrop-blur-sm sticky top-0 z-50">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-3 w-[240px]">
                        <div className="size-8 bg-primary text-neon-green flex items-center justify-center rounded-lg shadow-[2px_2px_0px_0px_rgba(204,255,0,1)]">
                            <span className="material-symbols-outlined text-xl">query_stats</span>
                        </div>
                        <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
                            CROWD<br /><span className="text-[10px] tracking-widest text-primary/60 not-italic font-bold">ORACLE</span>
                        </h1>
                    </div>

                    {/* Center: Nav Links */}
                    <div className="flex-1 flex justify-center overflow-x-auto no-scrollbar">
                        <nav className="flex items-center gap-6 bg-white border-2 border-primary px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_#141414] whitespace-nowrap">
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="font-bold text-xs uppercase tracking-wider hover:text-neon-purple transition-colors"
                            >
                                Terminal
                            </button>
                            <button
                                onClick={() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                                className="font-bold text-xs uppercase tracking-wider text-primary/40 hover:text-primary transition-colors"
                            >
                                Leaderboard
                            </button>
                            <button
                                onClick={() => document.getElementById('tokenomics')?.scrollIntoView({ behavior: 'smooth' })}
                                className="font-bold text-xs uppercase tracking-wider text-primary/40 hover:text-primary transition-colors"
                            >
                                Tokenomics
                            </button>
                            <button
                                onClick={() => document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' })}
                                className="font-bold text-xs uppercase tracking-wider text-primary/40 hover:text-primary transition-colors"
                            >
                                Docs
                            </button>
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
                <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-10 pt-2 pb-20">

                    {/* Countdown Section */}
                    <div className="flex flex-col items-center mb-8">
                        {/* Round Type Header Area */}
                        <div className="mb-4 flex flex-col items-center gap-2">
                            {/* Round Badge/Label */}
                            <div className={`px-5 py-2 border-2 border-primary rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_#141414] transition-all
                                ${currentRoundType === 'RAPID' ? 'bg-white text-primary' :
                                    currentRoundType === 'FEATURED' ? 'bg-primary text-neon-green border-neon-green underline decoration-2 underline-offset-4' :
                                        'bg-primary text-white border-white scale-110 shadow-[6px_6px_0px_0px_#b026ff]'}`}
                            >
                                {currentRoundType === 'ANCHOR' ? 'DAILY ANCHOR' : currentRoundType === 'FEATURED' ? 'FEATURED ROUND' : 'RAPID ROUND · 30 MIN'}
                            </div>

                            {/* Global Disclaimer for non-rapid */}
                            {currentRoundType !== 'RAPID' && (
                                <div className="text-[10px] font-bold uppercase tracking-widest text-neon-purple">
                                    Same rules · Accuracy still decides winners
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isTokenLocked ? 'text-neon-purple' : 'text-primary/40'}`}>
                                    {isTokenLocked ? 'Token Locked' : 'Token locks 2m before round'}
                                </span>
                                <button
                                    onClick={() => setShowExplainer(true)}
                                    className="text-[9px] font-bold text-primary/40 hover:text-primary underline uppercase tracking-tighter"
                                >
                                    How chosen?
                                </button>
                            </div>
                        </div>

                        <div className={`flex items-end gap-2 mb-2 ${currentRoundType === 'ANCHOR' ? 'scale-110' : ''}`}>
                            <span className="material-symbols-outlined text-2xl text-primary">timer</span>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Round Ends In</h2>
                        </div>

                        <div className="flex gap-4 mb-2">
                            {/* Hours */}
                            <div className="flex flex-col items-center gap-1">
                                <div className={`${currentRoundType === 'ANCHOR' ? 'w-24 h-28' : 'w-20 h-24'} bg-primary rounded-lg flex items-center justify-center border-[3px] border-primary shadow-[4px_4px_0px_0px_#b026ff] relative overflow-hidden group`}>
                                    <span className={`${currentRoundType === 'ANCHOR' ? 'text-6xl' : 'text-5xl'} font-mono font-bold text-white tracking-tighter`}>{timeLeft.hours}</span>
                                </div>
                            </div>

                            <span className={`${currentRoundType === 'ANCHOR' ? 'text-5xl' : 'text-4xl'} font-black self-center pb-4`}>:</span>

                            {/* Minutes */}
                            <div className="flex flex-col items-center gap-1">
                                <div className={`${currentRoundType === 'ANCHOR' ? 'w-24 h-28' : 'w-20 h-24'} bg-primary rounded-lg flex items-center justify-center border-[3px] border-primary shadow-[4px_4px_0px_0px_#b026ff] relative overflow-hidden`}>
                                    <span className={`${currentRoundType === 'ANCHOR' ? 'text-6xl' : 'text-5xl'} font-mono font-bold text-white tracking-tighter`}>{timeLeft.minutes}</span>
                                </div>
                            </div>

                            <span className={`${currentRoundType === 'ANCHOR' ? 'text-5xl' : 'text-4xl'} font-black self-center pb-4`}>:</span>

                            {/* Seconds */}
                            <div className="flex flex-col items-center gap-1">
                                <div className={`${currentRoundType === 'ANCHOR' ? 'w-24 h-28' : 'w-20 h-24'} bg-primary rounded-lg flex items-center justify-center border-[3px] border-primary shadow-[4px_4px_0px_0px_#b026ff] relative overflow-hidden`}>
                                    <span className={`${currentRoundType === 'ANCHOR' ? 'text-6xl' : 'text-5xl'} font-mono font-bold text-white tracking-tighter`}>{timeLeft.seconds}</span>
                                </div>
                            </div>
                        </div>

                        {/* Round Timeline Indicator */}
                        <div className="w-full max-w-xl px-10 mt-4 mb-2">
                            <div className="flex justify-between items-center relative">
                                {/* Connector Line */}
                                <div className="absolute left-0 right-0 h-1 bg-primary/10 top-1/2 -translate-y-1/2 z-0"></div>
                                <div className="absolute left-0 w-1/3 h-1 bg-neon-green top-1/2 -translate-y-1/2 z-0"></div>

                                {[
                                    { label: 'Entry Open', status: isTokenLocked ? 'completed' : 'active' },
                                    { label: 'Locked', status: isTokenLocked ? 'active' : 'pending' },
                                    { label: 'Live', status: 'pending' },
                                    { label: 'Resolved', status: 'pending' }
                                ].map((step, i) => (
                                    <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={`size-4 rounded-full border-[3px] border-primary ${step.status === 'active' || step.status === 'completed' ? 'bg-neon-green' : 'bg-white'}`}></div>
                                        <span className={`text-[12px] font-black uppercase tracking-widest ${step.status === 'active' || step.status === 'completed' ? 'text-primary' : 'text-primary/40'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-4">
                                <p className="text-[12px] font-black text-primary/60 uppercase tracking-widest">
                                    Next round starts in <span className="text-primary font-mono text-lg ml-1">{timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3-Column Layout - Stacked on Mobile */}
                    <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">

                        {/* Left Column (3 Spans) - Market Reality Layer (COLD) */}
                        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 lg:order-1 order-2">
                            <div className="flex flex-col gap-3 ml-2">
                                <div className="text-[10px] font-black uppercase text-primary/30 tracking-[0.3em]">Market Reality Layer</div>
                                <div className="h-[2px] w-12 bg-primary/10"></div>
                            </div>
                            {/* Live Asset Card - COLD STYLING */}
                            <div className="bg-[#f0f0f0] border-2 border-primary/40 rounded-lg p-6 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                                {/* Early Reveal Wrapper (Holders see 60s earlier) */}
                                {(!isTokenLocked && timeLeft.minutes === '01' && parseInt(timeLeft.seconds) > 30 && !isTokenHolder) ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center transition-all">
                                        <span className="material-symbols-outlined text-primary/10 text-5xl mb-4">visibility_off</span>
                                        <p className="text-xs font-black uppercase tracking-widest text-primary/40 leading-tight">
                                            {currentRoundType === 'FEATURED' ? 'Featured round' : 'Next token'}<br />
                                            {currentRoundType === 'FEATURED' ? 'starting soon' : 'revealed soon'}
                                        </p>
                                        <div className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                                            <span className="material-symbols-outlined text-[10px] text-neon-purple">token</span>
                                            <span className="text-[9px] font-black text-primary/60 uppercase tracking-tighter">$CROWD Holders see 60s earlier</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="size-16 rounded-sm border border-primary/10 overflow-hidden bg-white relative">
                                                <Image
                                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXseSWT3F3PRp40BzMmD6YSbYJBR-crmVEEUw32I1EWRMr8yiRdImQJuDUbRXUrQn8T0X0I7GZgTovmF3KREDYdtZNe7YrFgJ83yplnzFMkA0LGTazEmH9hPcZ4Tt-HVBSBzd245mMomPOVcbBhqOZ2-denwRanQm_omUBsmw8aTWbXS0pQCcahUf_uel7v3Ujcq6mxy09VO_UOcETlQ16j6wxa4eLclMo7wXaF7goFQm2NAA0I3gjHQ0bVOcWv6tyGxhKOrRY5Cc"
                                                    alt="Token"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <span className="px-3 py-1 bg-neon-green border-2 border-primary rounded-full text-xs font-black uppercase italic">Live</span>
                                        </div>

                                        <h3 className="text-3xl font-black italic uppercase leading-none mb-1">$PEPE3</h3>
                                        <p className="text-sm font-mono text-primary/60 mb-6 truncate">0xPepe...3vSol</p>
                                    </>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                            <span>Bonding</span>
                                            <span>88%</span>
                                        </div>
                                        <div className="h-4 w-full bg-primary/10 rounded-full border-2 border-primary overflow-hidden">
                                            <div className="h-full bg-neon-purple w-[88%] relative">
                                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-t-2 border-dashed border-primary/20">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-primary/40">Market Cap</p>
                                            <p className="font-mono font-bold">$1.24M</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-primary/40">Current ROI</p>
                                            <p className="font-mono font-bold text-neon-purple">{(peakVwap / launchPrice).toFixed(1)}x</p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-primary/5 rounded-lg border-2 border-primary/10 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-primary/40">VWAP Peak (30s)</span>
                                            <span className="font-mono font-bold text-xs">{peakRoi.toFixed(2)}x</span>
                                        </div>
                                        <div className="mt-1 h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-neon-green" style={{ width: `${Math.min(100, (peakRoi / 30) * 100)}%` }}></div>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 border-2 border-primary bg-primary text-white font-black uppercase italic tracking-widest hover:bg-neon-green hover:text-primary transition-colors">
                                        View Chart
                                    </button>
                                </div>
                            </div>

                            {/* Community Predictions */}
                            <div className="bg-primary border-4 border-primary rounded-2xl p-6 text-white shadow-[8px_8px_0px_0px_#ccff00]">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-neon-green">groups</span>
                                    <h4 className="font-black italic uppercase tracking-wider text-sm">Community Picks</h4>
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
                        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 lg:order-2 order-1">
                            <div className="flex flex-col gap-3 items-center">
                                <div className="text-[10px] font-black uppercase text-primary/30 tracking-[0.3em]">Oracle Prediction Protocol</div>
                                <div className="h-[2px] w-24 bg-primary/10"></div>
                            </div>
                            <div className="bg-white border-4 border-primary rounded-3xl p-5 shadow-[8px_8px_0px_0px_#141414] relative overflow-hidden">
                                {/* Background Decor */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="px-6 py-2 border-2 border-primary rounded-full bg-white">
                                            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Prediction Zone</span>
                                        </div>

                                        {/* Holders View Toggle */}
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                                            <div className="relative group">
                                                <button
                                                    onClick={() => isTokenHolder && setShowHoldersView(!showHoldersView)}
                                                    disabled={!isTokenHolder}
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${!isTokenHolder ? 'opacity-40 cursor-not-allowed' :
                                                        showHoldersView ? 'bg-primary text-neon-green shadow-inner' : 'bg-white hover:bg-neutral-50'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {!isTokenHolder ? 'lock' : showHoldersView ? 'visibility' : 'visibility_off'}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Holders View</span>
                                                </button>
                                                {!isTokenHolder && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-primary text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed text-center">
                                                        Hold $CROWD to unlock advanced crowd distribution insights.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
                                        Forecast<br />The Peak
                                    </h2>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                                            <div className={`w-2 h-2 rounded-full ${isLoadingTokens ? 'bg-primary/20 animate-pulse' : 'bg-neon-green'}`}></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                {isLoadingTokens ? 'Scanning Pump.fun...' : 'Live Protocol Feed'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">
                                        New rounds start every 30m &bull; Featured rounds every few hours &bull; Daily anchor at 5 PM PST
                                    </p>
                                    <div className="relative group mb-8">
                                        <p className="text-primary/60 font-medium max-w-md mx-auto cursor-help border-b border-dashed border-primary/20">
                                            Predict the highest 30s VWAP multiplier during this round.
                                        </p>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 bg-primary text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                            <p className="font-bold mb-2">How we measure peak:</p>
                                            <p className="opacity-80">We use Volume-Weighted Average Price (VWAP) in 30-second buckets to ensure the peak is real volume and not a single-price glitch or wash trade.</p>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-primary"></div>
                                        </div>
                                    </div>

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

                                    {/* Accuracy Metrics */}
                                    <div className="grid grid-cols-2 gap-4 w-full mb-8 font-mono text-[10px] font-bold uppercase tracking-wider">
                                        <div className="flex flex-col gap-1 border-l-2 border-primary/10 pl-4 py-1">
                                            <span className="text-primary/40">Distance From Peak</span>
                                            <span className={Math.abs(prediction - peakRoi) < 1 ? 'text-neon-green' : 'text-primary'}>
                                                {Math.abs(prediction - peakRoi).toFixed(2)}x
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1 border-l-2 border-primary/10 pl-4 py-1">
                                            <span className="text-primary/40">Crowd Percentile</span>
                                            <span className="text-neon-purple">Top 12%</span>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 gap-4 w-full">
                                        <div className="bg-white p-6 rounded-xl border-2 border-primary flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform">
                                            {connected && prediction !== null && stakeAmount !== '' && parseFloat(stakeAmount) > 0 ? (
                                                <>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 italic">MAX SKILL-BASED SHARE (IF CORRECT)</span>
                                                        <div className="relative group/tooltip">
                                                            <span className="material-symbols-outlined text-sm text-primary/30 cursor-help">info</span>
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-primary text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed text-center">
                                                                This preview assumes you qualify as a winner based on accuracy. The prize pool is shared among qualifying winners. Entry size does not affect win probability.
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-3xl font-mono font-bold group-hover:text-neon-purple transition-colors text-primary/80">
                                                        ${(parseFloat(stakeAmount || "0") * prediction * 145 * 0.8).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        <span className="text-xs ml-2 opacity-40">EST</span>
                                                    </span>
                                                    <div className="mt-4 space-y-1 text-center">
                                                        <p className="text-[9px] font-black uppercase text-primary/60 tracking-tighter">
                                                            Shown only if your prediction finishes among the closest winners.
                                                        </p>
                                                        <p className="text-[9px] font-black uppercase text-neon-purple/60 tracking-tighter">
                                                            Final payout depends on the number of equally-close winners.
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="py-4 text-center">
                                                    <span className="text-xs font-black uppercase tracking-widest text-primary/30 italic">
                                                        Set a prediction + entry to preview your max share.
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column (3 Spans) */}
                        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 lg:order-3 order-3">
                            <div className="flex flex-col gap-3 ml-2">
                                <div className="text-[10px] font-black uppercase text-primary/30 tracking-[0.3em]">Economic Consensus Layer</div>
                                <div className="h-[2px] w-12 bg-primary/10"></div>
                            </div>
                            {/* Pot Card */}
                            <div className={`bg-white rounded-2xl p-4 shadow-[6px_6px_0px_0px_#141414] transition-all 
                                ${currentRoundType === 'RAPID' ? 'border-4 border-primary' :
                                    currentRoundType === 'FEATURED' ? 'border-[6px] border-neon-purple' :
                                        'border-[8px] border-primary shadow-[10px_10px_0px_0px_#141414]'}`}>
                                <div className="text-center mb-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Current Pot</p>
                                    <h3 className={`${currentRoundType === 'ANCHOR' ? 'text-6xl' : 'text-5xl'} font-black italic`}>${((potSol + (activeBonus?.bonus || 0)) * 145).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                                    <div className="flex flex-col items-center gap-1 mt-2">
                                        <p className="text-[12px] font-mono font-bold text-neon-purple">
                                            {(potSol + (activeBonus?.bonus || 0)).toFixed(2)} SOL
                                            {activeBonus?.bonus && activeBonus.bonus > 0 && (
                                                <span className="text-[10px] ml-1 text-neon-green">+{activeBonus.bonus.toFixed(2)} (Reward)</span>
                                            )}
                                        </p>
                                        <p className={`text-[10px] font-black uppercase tracking-tighter ${activeBonus?.isActive ? 'text-neon-green' : 'text-primary/30'}`}>
                                            {activeBonus?.label || 'This round has no bonus pot'}
                                        </p>
                                    </div>
                                </div>

                                {/* Anchor Stats escalation */}
                                {currentRoundType === 'ANCHOR' && (
                                    <div className="mb-6 p-4 bg-primary/5 rounded-xl border-2 border-dashed border-primary/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold uppercase text-primary/40">Today&apos;s Median</span>
                                            <span className="text-xs font-black uppercase tracking-widest text-primary">14.2x ROI</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold uppercase text-primary/40">Volatility Trend</span>
                                            <span className="text-xs font-black uppercase tracking-widest text-neon-purple">STABLE</span>
                                        </div>
                                    </div>
                                )}

                                {/* Input Area */}
                                <div className="space-y-3 mb-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Confidence Entry</span>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined text-xs text-primary/20 cursor-help">info</span>
                                                <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-primary text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
                                                    Entry size does not improve accuracy or win probability. It only increases your share of the pot if you are correct.
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-neon-purple uppercase italic">Scale Rewards</span>
                                    </div>

                                    <div className="flex p-1 bg-primary/5 rounded-lg border-2 border-primary/10">
                                        <button className="flex-1 py-1.5 text-[9px] font-black uppercase rounded bg-primary text-white shadow-sm">SOL Entry</button>
                                        <button className="flex-1 py-1.5 text-[9px] font-black uppercase rounded text-primary/60 hover:text-primary transition-colors">$CROWD</button>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder={minFee.toFixed(2)}
                                            className="w-full h-12 bg-white border-2 border-primary rounded-lg pl-4 pr-12 font-mono font-bold text-lg focus:outline-none focus:ring-4 focus:ring-neon-green/20"
                                            value={stakeAmount}
                                            onChange={(e) => setStakeAmount(e.target.value)}
                                        />
                                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-neon-purple hover:underline">Max</button>
                                    </div>

                                    {stakeAmount && parseFloat(stakeAmount) < minFee && (
                                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                                            Minimum entry for this round is {minFee} SOL
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[minFee.toString(), (minFee * 2).toFixed(2), (minFee * 5).toFixed(2), (minFee * 10).toFixed(2)].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setStakeAmount(val)}
                                                className="py-2 border-2 border-primary/10 rounded-lg text-[10px] font-black hover:border-primary hover:bg-neon-green hover:text-primary transition-all"
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Mandatory Clarifiers */}
                                    <div className="pt-2">
                                        <p className="text-[9px] font-bold text-primary leading-tight mb-1">
                                            Entry size scales reward only after accuracy decides winners.
                                        </p>
                                        <p className="text-[8px] font-medium text-primary/40 leading-tight uppercase tracking-widest">
                                            Accuracy determines winners. Entry size only scales rewards.
                                        </p>
                                    </div>
                                </div>

                                {txStatus === 'success' && txHash && (
                                    <div className="mb-4 p-3 bg-neon-green/10 border-2 border-neon-green/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                        <span className="material-symbols-outlined text-neon-green">check_circle</span>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase text-neon-green">Prediction Locked</p>
                                            <a
                                                href={`https://solscan.io/tx/${txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[9px] font-mono text-primary/60 hover:underline"
                                            >
                                                {txHash.slice(0, 8)}...{txHash.slice(-8)}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {txStatus === 'error' && (
                                    <div className="mb-4 p-3 bg-red-500/10 border-2 border-red-500/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                        <span className="material-symbols-outlined text-red-500">error</span>
                                        <p className="text-[10px] font-black uppercase text-red-500">Transaction Failed</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleLockIn}
                                    disabled={!connected || txStatus === 'signing' || txStatus === 'confirming' || !stakeAmount || parseFloat(stakeAmount) < minFee}
                                    className={`w-full py-4 text-white text-lg font-black uppercase italic tracking-widest rounded-xl border-4 border-primary transition-all group relative overflow-hidden
                                        ${(!connected || txStatus === 'signing' || txStatus === 'confirming' || !stakeAmount || parseFloat(stakeAmount) < minFee)
                                            ? 'bg-primary/40 cursor-not-allowed border-primary/10'
                                            : 'bg-primary hover:bg-neon-green hover:text-primary hover:border-primary hover:shadow-[4px_4px_0px_0px_#141414]'}`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {(txStatus === 'signing' || txStatus === 'confirming') ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin">sync</span>
                                                {txStatus === 'signing' ? 'Signing...' : 'Confirming...'}
                                            </>
                                        ) : (
                                            <>
                                                <span className="group-hover:mr-2 transition-all">Lock It In</span>
                                                <span className="material-symbols-outlined align-middle text-sm absolute right-12 opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all">lock</span>
                                            </>
                                        )}
                                    </span>
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

                            {/* Round History (Transparency) */}
                            <div className="bg-primary border-4 border-primary rounded-2xl p-6 text-white shadow-[8px_8px_0px_0px_#141414]">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-neon-green">history</span>
                                    <h4 className="font-black italic uppercase tracking-wider text-sm">Round History</h4>
                                </div>
                                <div className="space-y-2">
                                    {roundHistory.length > 0 ? roundHistory.map((round, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/10 font-mono text-[10px]">
                                            <span className="text-white/40">{format(round.roundTime, 'HH:mm')}</span>
                                            <span className="text-neon-green font-bold">{round.peakRoi.toFixed(1)}x Peak</span>
                                            <span className="bg-white/10 px-1 rounded">{round.potSol.toFixed(1)} SOL</span>
                                        </div>
                                    )) : (
                                        <div className="text-center py-4 border-2 border-dashed border-white/10 rounded-lg">
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Awaiting First Result</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                </main>

                {/* Additional Sections */}
                <Leaderboard />
                <Tokenomics />
                <Whitepaper />
                <Docs />

                {/* Footer Ticker */}
                <div className="fixed bottom-0 left-0 right-0 bg-primary text-white py-1.5 border-t-2 border-neon-green overflow-hidden flex items-center z-40">
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

            {/* Explainer Modal */}
            {showExplainer && (
                <div className="fixed inset-0 bg-primary/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="bg-white border-4 border-primary rounded-3xl p-10 max-w-xl w-full shadow-[20px_20px_0px_0px_#141414] animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                                How THE target<br />token is chosen
                            </h3>
                            <button onClick={() => setShowExplainer(false)} className="size-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-neon-purple transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-6 items-start">
                                <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black shrink-0 border-2 border-primary/10">01</div>
                                <p className="text-sm font-bold text-primary/80 leading-relaxed pt-1">
                                    We pull top trending tokens from Pump.fun and filter for real activity data including volume, trades, and unique traders.
                                </p>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black shrink-0 border-2 border-primary/10">02</div>
                                <p className="text-sm font-bold text-primary/80 leading-relaxed pt-1">
                                    We exclude recently used tokens and apply age filters (5m to 6h) to ensure we target high-velocity &quot;fresh&quot; hype.
                                </p>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black shrink-0 border-2 border-primary/10">03</div>
                                <p className="text-sm font-bold text-primary/80 leading-relaxed pt-1">
                                    We score the remaining pool based on volume acceleration and pick one using weighted cryptographically-secure randomness.
                                </p>
                            </div>
                            <div className="flex gap-6 items-start">
                                <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black shrink-0 border-2 border-primary/10">04</div>
                                <p className="text-sm font-bold text-primary/80 leading-relaxed pt-1">
                                    The token is locked 120 seconds before entry closes and cannot be swapped, ensuring a fair, verifiable target for everyone.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowExplainer(false)}
                            className="w-full mt-10 py-4 bg-primary text-white font-black uppercase italic tracking-widest rounded-xl hover:bg-neon-green hover:text-primary transition-all"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
