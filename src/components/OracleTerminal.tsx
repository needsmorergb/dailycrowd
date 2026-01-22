'use client';

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Leaderboard from './Leaderboard';
import Docs from './Docs';
import Rules from './Rules';
import Whitepaper from './Whitepaper';
import Tokenomics from './Tokenomics';
import { format, toZonedTime } from 'date-fns-tz';
import { differenceInSeconds, addMinutes, startOfHour, setHours, setMinutes, setSeconds, isBefore } from 'date-fns';
import { useVwapPeak } from '../hooks/useVwapPeak';
import { usePayoutSimulation } from '../hooks/usePayoutSimulation';
import { useHouseBonuses } from '../hooks/useHouseBonuses';
import { TokenSelector, TokenCandidate, SelectionAudit } from '../utils/tokenSelection';
import { TOKEN_SELECTION_CONFIG } from '../utils/tokenSelectionConfig';

interface RoundHistoryItem {
    roundTime: Date;
    peakRoi: number;
    potSol: number;
    volatility5m: number;
    bondingProgress?: number;
    price?: number;
    mcUsd?: number;
}

import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { fetchLatestPumpTokens, fetchTokenDetails } from '../utils/pumpData';

const ANCHOR_HOUR = 17; // 5 PM
const TIMEZONE = 'America/Los_Angeles';

const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '8cvZYYnEkNMqZA1gaPWGcd26MBbdS3rR2z2aigmU1foQ';

const MIN_FEES = {
    RAPID: 0.03,
    FEATURED: 0.05,
    ANCHOR: 0.06
};

export default function OracleTerminal() {
    const { connected, publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    // QA / Simulation Gating (Moved to top for logic gating)
    const [isSimulationMode, setIsSimulationMode] = useState(false);
    const [logoClickCount, setLogoClickCount] = useState(0);

    // Detect QA mode from URL parameters (?qa=true or ?sim=true)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const qaMode = params.get('qa') === 'true' || params.get('sim') === 'true';
            if (qaMode) {
                setIsSimulationMode(true);
                console.log('QA Mode activated via URL parameter');
            }
        }
    }, []);

    // Check URL for simulation trigger on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            // SECURITY: Only allow simulation mode in non-production environments
            const isDev = process.env.NODE_ENV !== 'production';

            if (isDev && (params.get('sim') === 'true' || params.get('qa') === 'true')) {
                setIsSimulationMode(true);
            }
            if (params.get('state') === 'active') setRoundState('ACTIVE');
        }
    }, []);

    const [prediction, setPrediction] = useState<number>(15.0);
    const [stakeAmount, setStakeAmount] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<{ hours: string, minutes: string, seconds: string }>({ hours: '00', minutes: '00', seconds: '00' });
    const [nextRoundTimeLeft, setNextRoundTimeLeft] = useState<{ hours: string, minutes: string, seconds: string }>({ hours: '00', minutes: '30', seconds: '00' });
    const [nextRoundTime, setNextRoundTime] = useState<Date | null>(null);

    // Economic Simulation State
    const [potSol, setPotSol] = useState<number>(1.36);
    const [burnedTokens, setBurnedTokens] = useState<number>(1250);

    // Round Logic State
    const [roundStartTime, setRoundStartTime] = useState<number>(() => Date.now());
    const [launchPrice, setLaunchPrice] = useState<number>(0);
    const [currentPrice, setCurrentPrice] = useState<number>(0);

    // Initialize simulation state on mount to avoid hydration mismatch
    useEffect(() => {
        setPotSol(1.36);
        setBurnedTokens(1250);
    }, []);
    // Simulation: Community Predictions
    const [cmPredictions, setCmPredictions] = useState<{ user: string, roi: string, color: string }[]>([
        { user: 'G8Xp...m2K', roi: '12.5x', color: 'text-neon-green' },
        { user: 'Ar4z...L9q', roi: '2.1x', color: 'text-neon-purple' },
        { user: '2Wnn...o0X', roi: '28.0x', color: 'text-neon-green' },
    ]);

    // VWAP Tracking
    const { peakVwap, peakRoi, addTrade } = useVwapPeak(launchPrice, roundStartTime);

    // Round State Management
    type RoundState = 'ANNOUNCED' | 'ACTIVE' | 'RESOLVED' | 'CANCELED';
    const [roundState, setRoundState] = useState<RoundState>('ANNOUNCED');
    const [lobbyPlayers, setLobbyPlayers] = useState(0);
    const [lobbyEndTime] = useState(Date.now() + 15 * 60 * 1000); // 15 min lobby
    const [elapsedLobbyTime, setElapsedLobbyTime] = useState(0);

    // Auto-activate round in QA mode
    useEffect(() => {
        if (isSimulationMode && roundState === 'ANNOUNCED') {
            console.log('[QA] Auto-activating round for immediate gameplay');
            setRoundState('ACTIVE');
            setLobbyPlayers(MIN_PLAYERS);

            // Set a simulated start time for 5x speedup
            // A 30 min round becomes 6 mins
            const sixMinsAgo = Date.now() - (1 * 60 * 1000); // Start as if 1 min already passed
            // Ref: useVwapPeak uses roundStartTime
        }
    }, [isSimulationMode]);

    const MIN_PLAYERS = 15;
    const MIN_POT = 0.45;

    // Simulation: Lobby Logic
    const [showActivationMsg, setShowActivationMsg] = useState(false);
    useEffect(() => {
        if (roundState === 'ACTIVE') {
            setShowActivationMsg(true);
            const timer = setTimeout(() => setShowActivationMsg(false), 3000);
            return () => clearTimeout(timer);
        }

        if (roundState !== 'ANNOUNCED') return;
        if (!isSimulationMode) return; // ONLY RUN SIM IN SIM MODE

        const interval = setInterval(() => {
            setElapsedLobbyTime(prev => prev + 1);

            // Sim: Auto-increment players to show progress (FASTER in QA)
            setLobbyPlayers(prev => {
                if (prev >= MIN_PLAYERS - 1) {
                    setRoundState('ACTIVE');
                    return prev + 1;
                }
                return prev + Math.floor(Math.random() * 3 + 1); // 1-3 players per tick
            });

            if (Date.now() > lobbyEndTime) {
                setRoundState('CANCELED');
            }

        }, 500); // Faster lobby tick for demo

        return () => clearInterval(interval);
    }, [roundState, lobbyEndTime, isSimulationMode]);

    // Token Selection State
    const [candidates, setCandidates] = useState<TokenCandidate[]>([]);
    const [selectedToken, setSelectedToken] = useState<TokenCandidate | null>(null);
    const [isTokenLocked, setIsTokenLocked] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [isLoadingTokens, setIsLoadingTokens] = useState(false);
    const [isHalted, setIsHalted] = useState(false);
    const [isWaitingForToken, setIsWaitingForToken] = useState(false);
    const [selectionAudit, setSelectionAudit] = useState<SelectionAudit | null>(null);
    const [waitingStartTime, setWaitingStartTime] = useState<number | null>(null);

    // Holder Status (Mocked for now, but ready for token check)
    const [isTokenHolder] = useState(true);
    const [showHoldersView, setShowHoldersView] = useState(false);



    const handleLogoClick = () => {
        const newCount = logoClickCount + 1;
        if (newCount >= 5) {
            setIsSimulationMode(!isSimulationMode);
            setLogoClickCount(0);
            console.log(`Simulation Mode: ${!isSimulationMode ? 'ENABLED' : 'DISABLED'}`);
        } else {
            setLogoClickCount(newCount);
            // Reset count if not clicked for 2 seconds
            setTimeout(() => setLogoClickCount(0), 2000);
        }
    };

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
    const loadTokens = React.useCallback(async () => {
        setIsLoadingTokens(true);
        const liveTokens = await fetchLatestPumpTokens();
        if (liveTokens.length > 0) {
            setCandidates(liveTokens);
            setIsHalted(false);

            // Only select if we haven't locked in a token yet
            if (!selectedToken) {
                const { chosen, wait, audit } = await selector.selectTargetToken('initial', Date.now(), liveTokens);
                if (chosen) {
                    setSelectedToken(chosen);
                    // Use a slightly lower price as "launch" to simulate immediate ROI
                    const price = chosen.price || 0.00001;
                    const initialPrice = price * 0.95;
                    setLaunchPrice(initialPrice);
                    setCurrentPrice(price);
                    setIsWaitingForToken(false);
                    setSelectionAudit(audit || null);
                } else if (wait) {
                    console.log('Oraculum: Entering WAIT state. Reasons:', audit?.rejectionReasons);
                    setIsWaitingForToken(true);
                    setWaitingStartTime(prev => prev || Date.now()); // Keep original start time
                    setSelectionAudit(audit || null);
                }
            }
        } else {
            console.warn('CRITICAL: No live tokens found in last hour. Halting rounds.');
            setIsHalted(true);
            setRoundState('CANCELED');
        }
        setIsLoadingTokens(false);
    }, [selector, selectedToken]);

    // Initial Load
    useEffect(() => {
        loadTokens();
    }, [selector]); // Remove loadTokens dependency to avoid loop, selector is stable

    // Polling while waiting
    useEffect(() => {
        if (!isWaitingForToken) return;

        const interval = setInterval(() => {
            console.log('Oraculum: Re-scanning market...');
            loadTokens();
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [isWaitingForToken, loadTokens]);



    // Live Polling for Selected Token
    useEffect(() => {
        if (!selectedToken || roundState !== 'ACTIVE') return;

        const pollInterval = setInterval(async () => {
            const freshData = await fetchTokenDetails(selectedToken.mint);
            if (freshData) {
                setSelectedToken(prev => prev ? { ...prev, ...freshData } : null);
                if (freshData.price) {
                    setCurrentPrice(freshData.price);
                }
            }
        }, 10000); // Poll every 10s

        return () => clearInterval(pollInterval);
    }, [selectedToken?.mint, roundState]);

    // Refresh Ticker Candidates
    useEffect(() => {
        const refreshTicker = async () => {
            const liveTokens = await fetchLatestPumpTokens();
            if (liveTokens.length > 0) {
                setCandidates(prev => {
                    // Update only if changed to avoid unnecessary re-renders
                    if (JSON.stringify(prev.map(t => t.mint)) === JSON.stringify(liveTokens.map(t => t.mint))) return prev;
                    return liveTokens;
                });
            }
        };
        const interval = setInterval(refreshTicker, 20000);
        return () => clearInterval(interval);
    }, []);

    // Heartbeat Simulation (Bot Activity)
    useEffect(() => {
        if (!isSimulationMode) return;

        const interval = setInterval(() => {
            // 1. Simulate Pot Growth
            const entrySize = 0.03 + (Math.random() * 0.15);
            setPotSol(prev => prev + entrySize);

            // 2. Simulate Market Activity using token volatility
            const tokenVol = selectedToken?.volatility15m || 1.5;
            const trend = Math.random() > 0.4 ? 0.01 : -0.005; // Slight upward bias
            const movement = (trend + (Math.random() * 0.1 - 0.05)) * (tokenVol / 5);
            const lastPrice = currentPrice || launchPrice || 0.00001;
            const newPrice = lastPrice * (1 + movement);
            const volume = Math.random() * 5000 + 500;

            setCurrentPrice(newPrice);
            addTrade(newPrice, volume);
        }, 1500);

        return () => clearInterval(interval);
    }, [peakVwap, launchPrice, addTrade, selectedToken, isSimulationMode, currentPrice]);

    const handleLockIn = async () => {
        if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;

        // QA Mode: Fake transaction (no wallet required)
        if (isSimulationMode) {
            try {
                setTxStatus('signing');
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate signing delay

                const fakeTxHash = 'QA' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                setTxHash(fakeTxHash);
                setTxStatus('confirming');

                await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate confirmation delay
                setTxStatus('success');

                // USER BET POT INCREASE
                setPotSol(prev => prev + parseFloat(stakeAmount));

                console.log(`[QA] Fake transaction successful: ${fakeTxHash}`);
                console.log(`[QA] Bet placed: ${prediction.toFixed(1)}x with ${stakeAmount} SOL`);
            } catch (error) {
                console.error('[QA] Fake transaction failed:', error);
                setTxStatus('error');
            }
            return;
        }

        // Real Mode: Actual blockchain transaction
        if (!publicKey) return;

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
        if (!isSimulationMode) return;

        const interval = setInterval(() => {
            // 1. Simulate Pot/Burn from "other players" - MORE FREQUENT in QA mode
            if (Math.random() > 0.6) { // Further increased for demo activity
                const entrySize = Math.random() * 0.15 + 0.05; // Slightly larger bot bets
                setPotSol(prev => prev + entrySize); // 100% of bot bet to pot for visible growth
                setBurnedTokens(prev => prev + Math.floor(Math.random() * 50 + 10));

                // Add a new community pick occasionally
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
                const user = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') + '...' +
                    Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                const randRoi = (Math.random() * 25 + 1).toFixed(1) + 'x';

                const communityEntry = Math.random() * 0.04 + 0.01;
                setPotSol(prev => prev + communityEntry);

                setCmPredictions(prev => [{
                    user,
                    roi: randRoi,
                    color: parseFloat(randRoi) > 10 ? 'text-neon-green' : 'text-neon-purple'
                }, ...prev.slice(0, 4)]);

                // Log simulated bet for QA visibility
                console.log(`[QA] Simulated bot bet: ${user} predicted ${randRoi} with ${entrySize.toFixed(3)} SOL | New Pot: ${potSol.toFixed(3)}`);
            }

            // 2. Simulate Market Activity using token volatility
            // Remove the activeBonus check to ensure trades always happen in simulation mode
            const tokenVol = selectedToken?.volatility15m || 0.5;
            const movement = (Math.random() * 0.2 - 0.1) * tokenVol; // Scaled by token vol
            const lastPrice = currentPrice || launchPrice;
            const newPrice = lastPrice * (1 + movement);
            const volume = Math.random() * 5000 + 500;
            setCurrentPrice(newPrice);
            addTrade(newPrice, volume);
        }, 2000);

        return () => clearInterval(interval);
    }, [peakVwap, launchPrice, addTrade, selectedToken, isSimulationMode, currentPrice]);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const zonedNow = toZonedTime(now, TIMEZONE);

            // QA MODE: Accelerated Round (5x Speed)
            if (isSimulationMode) {
                // Determine virtual time based on 5x speedup
                // If 1 real 200ms tick passes, 1 virtual second pass
                // For demonstration, we'll base it on Date.now() for linear speed
                const virtElapsedTotal = Math.floor((Date.now() - roundStartTime) * 0.005); // 1ms = 0.005 virtual seconds (approx 5x)

                // Using a more predictable 5x speed for demonstration:
                // Every 1 real minute = 5 virtual minutes
                const cycleSecs = 30 * 60;
                const realSecsFromStart = Math.floor((Date.now() - roundStartTime) / 1000);
                const virtSecsFromStart = realSecsFromStart * 5;

                const secsRemaining = cycleSecs - (virtSecsFromStart % cycleSecs);

                if (secsRemaining <= 0) {
                    return { hours: '00', minutes: '30', seconds: '00' };
                }

                const m = Math.floor(secsRemaining / 60);
                const s = Math.floor(secsRemaining % 60);

                const nextSecs = secsRemaining + cycleSecs;
                const nm = Math.floor(nextSecs / 60);
                const ns = Math.floor(nextSecs % 60);
                const nh = Math.floor(nm / 60);

                setNextRoundTimeLeft({
                    hours: nh.toString().padStart(2, '0'),
                    minutes: (nm % 60).toString().padStart(2, '0'),
                    seconds: ns.toString().padStart(2, '0')
                });

                return {
                    hours: '00',
                    minutes: m.toString().padStart(2, '0'),
                    seconds: s.toString().padStart(2, '0')
                };
            }

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

            // Check for Round Boundary Crossing
            // If the new targetTime is AFTER the previously stored nextRoundTime, we just finished a round.
            if (nextRoundTime && targetTime.getTime() > nextRoundTime.getTime()) {
                console.log('Round Boundary Detected!');

                // 1. Resolve Previous Round
                if (roundState === 'ACTIVE') {
                    setRoundState('RESOLVED');

                    // Trigger Payount
                    if (!isProcessing) {
                        const mockPredictions = [
                            { userAddress: 'G8Xp...m2K', predictedRoi: peakRoi * 0.95, stakeAmount: 0.03, isHolder: true },
                            { userAddress: 'Ar4z...L9q', predictedRoi: peakRoi * 1.1, stakeAmount: 0.03, isHolder: false },
                            { userAddress: '2Wnn...o0X', predictedRoi: peakRoi * 0.98, stakeAmount: 0.03, isHolder: true },
                        ];
                        simulatePayout(potSol, peakRoi, mockPredictions);
                    }
                }

                // 2. Schedule Reset for Next Round (Cooldown)
                setTimeout(() => {
                    setRoundState('ANNOUNCED');
                    setPotSol(1.0);
                    setRoundStartTime(Date.now());
                    setIsTokenLocked(false);
                    setCandidates([]); // Clear old candidates to force refresh
                    setNextRoundTime(targetTime); // Now update the target
                }, 10000); // 10s Cooldown to show results

                // While in cooldown, freeze timer at 00:00:00 ? 
                // Alternatively, just let it show 'Processing...'
                return { hours: '00', minutes: '00', seconds: '00' };
            }

            // Normal Update if no boundary cross yet
            // Only update state if it's strictly different to avoid loop
            if (!nextRoundTime || targetTime.getTime() !== nextRoundTime.getTime()) {
                // Initial set
                setNextRoundTime(targetTime);
            }

            const diff = differenceInSeconds(nextRoundTime || targetTime, zonedNow);

            // Token Selection Timing (T_snapshot = start_time - 120s)
            const isSnapshotWindow = diff <= TOKEN_SELECTION_CONFIG.SNAPSHOT_BEFORE_START_SEC;

            if (isSnapshotWindow && !isTokenLocked && candidates.length > 0 && !isWaitingForToken && roundState !== 'RESOLVED') {
                const triggerSelection = async () => {
                    const result = await selector.selectTargetToken(
                        `round-${targetTime.getTime()}`,
                        Date.now(),
                        candidates
                    );

                    if (result.chosen) {
                        setSelectedToken(result.chosen);
                        setSelectionAudit(result.audit);
                        setIsTokenLocked(true);
                        setIsWaitingForToken(false);
                        setWaitingStartTime(null);

                        // Set initial prices
                        const price = result.chosen.price || 0.00001;
                        setLaunchPrice(price * 0.95);
                        setCurrentPrice(price);

                        // Move to LOCKED state strictly
                        setRoundState('ACTIVE'); // Ensure active
                    } else {
                        // Failsafe: Wait and retry
                        console.log('No qualifying token found. Entering WAITING state...');
                        setIsWaitingForToken(true);
                        if (!waitingStartTime) setWaitingStartTime(Date.now());

                        // Check for timeout (10m)
                        if (waitingStartTime && (Date.now() - waitingStartTime > TOKEN_SELECTION_CONFIG.MAX_WAIT_FOR_TOKEN_SEC * 1000)) {
                            console.error('Wait timeout: Canceling round.');
                            setRoundState('CANCELED');
                            setIsWaitingForToken(false);
                        }
                    }
                };

                // Run immediately, then effect interval handles the 60s "re-check" naturally
                // since this whole block re-runs every 1s-500ms, we need a small throttle or use the seconds check
                if (zonedNow.getSeconds() % 60 === 0 || !isWaitingForToken) {
                    triggerSelection();
                }
            }

            // Visual Diff Calc
            const h = Math.floor(Math.max(0, diff) / 3600);
            const m = Math.floor((Math.max(0, diff) % 3600) / 60);
            const s = Math.floor(Math.max(0, diff) % 60);

            // Calculate NEXT round (current + 30 mins)
            const nextDiff = Math.max(0, diff) + 1800; // 30 mins = 1800s
            const nh = Math.floor(nextDiff / 3600);
            const nm = Math.floor((nextDiff % 3600) / 60);
            const ns = Math.floor(nextDiff % 60);

            setNextRoundTimeLeft({
                hours: nh.toString().padStart(2, '0'),
                minutes: nm.toString().padStart(2, '0'),
                seconds: ns.toString().padStart(2, '0')
            });

            return {
                hours: h.toString().padStart(2, '0'),
                minutes: m.toString().padStart(2, '0'),
                seconds: s.toString().padStart(2, '0')
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, isSimulationMode ? 200 : 1000); // 5x speed: 1s virtual = 200ms real

        return () => clearInterval(timer);
    }, [nextRoundTime, isTokenLocked, isProcessing, lastPayouts, peakRoi, potSol, simulatePayout, updateBonus, isSimulationMode]);

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
                    <div
                        className="flex items-center gap-3 w-[240px] cursor-pointer select-none"
                        onClick={handleLogoClick}
                    >
                        <div className="size-8 bg-primary text-neon-green flex items-center justify-center rounded-lg shadow-[2px_2px_0px_0px_rgba(204,255,0,1)]">
                            <span className="material-symbols-outlined text-xl">query_stats</span>
                        </div>
                        <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
                            CROWD<br /><span className="text-[10px] tracking-widest text-primary/60 not-italic font-bold">ORACLE</span>
                            {isSimulationMode && <span className="block text-[8px] text-neon-purple animate-pulse">QA MODE</span>}
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
                            <button
                                onClick={() => document.getElementById('rules')?.scrollIntoView({ behavior: 'smooth' })}
                                className="font-bold text-xs uppercase tracking-wider text-primary/40 hover:text-primary transition-colors"
                            >
                                Rules
                            </button>
                        </nav>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 w-[280px] justify-end">
                        <a
                            href="https://dexscreener.com/solana/8s98mky3u2f6pk5ny9m3x9xzvq6z3u9n9p2f"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden lg:flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg border-2 border-primary hover:bg-primary/90 transition-all"
                        >
                            <span className="material-symbols-outlined text-neon-green text-sm translate-y-[1px]">token</span>
                            <span className="text-[10px] font-mono font-bold">$SOL: $142.65</span>
                        </a>

                        <div className="flex items-center gap-2">
                            <a
                                href="https://t.me/CROWD_CTRL_BOT"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="size-9 bg-white border-2 border-primary rounded-lg flex items-center justify-center hover:bg-neon-green transition-all shadow-[2px_2px_0px_0px_#141414] group"
                                title="Message @CROWD_CTRL_BOT"
                            >
                                <span className="material-symbols-outlined text-lg">send</span>
                            </a>
                            <a
                                href="https://x.com/CROWD_ORACLE"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="size-9 bg-white border-2 border-primary rounded-lg flex items-center justify-center hover:bg-neon-green transition-all shadow-[2px_2px_0px_0px_#141414] group"
                                title="Follow @CROWD_ORACLE"
                            >
                                <span className="flex items-center justify-center font-black text-sm">X</span>
                            </a>
                        </div>

                        <div className="relative group">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black uppercase italic tracking-wider transition-all shadow-[4px_4px_0px_0px_#141414] border-2 border-primary
                                ${connected ? 'bg-primary text-white hover:bg-primary/90' : 'bg-neon-green text-primary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'}`}>
                                <span className="material-symbols-outlined text-sm">{connected ? 'account_balance_wallet' : 'wallet'}</span>
                                <span className="text-[11px]">
                                    {connected && publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : 'Connect'}
                                </span>
                            </div>
                            {/* Invisible Wallet Adapter Button Overlay */}
                            <div className="absolute inset-0 opacity-0 cursor-pointer overflow-hidden rounded-lg">
                                <WalletMultiButton className="!w-full !h-full !bg-transparent !p-0 !m-0 !border-none !text-[0px]" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                {/* Main Content */}
                <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-10 pt-0 pb-20 relative">
                    {/* Activation Notification */}
                    {showActivationMsg && (
                        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                            <div className="bg-neon-green text-primary px-6 py-3 rounded-full border-2 border-primary font-black uppercase tracking-widest shadow-[0_0_20px_rgba(189,255,25,0.6)] flex items-center gap-2">
                                <span className="material-symbols-outlined">bolt</span>
                                Round activated — tracking begins now
                            </div>
                        </div>
                    )}

                    {/* Countdown Section */}
                    <div className="flex flex-col items-center mb-4">
                        {/* Round Type Header Area */}
                        <div className="mb-2 flex flex-col items-center gap-1">
                            {/* Round Badge/Label */}
                            <div className={`px-5 py-1.5 border-2 border-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_#141414] transition-all
                                ${currentRoundType === 'RAPID' ? 'bg-white text-primary' :
                                    currentRoundType === 'FEATURED' ? 'bg-primary text-neon-green border-neon-green underline decoration-2 underline-offset-4' :
                                        'bg-primary text-white border-white scale-110 shadow-[6px_6px_0px_0px_#b026ff]'}`}
                            >
                                {currentRoundType === 'ANCHOR' ? 'DAILY ANCHOR' : currentRoundType === 'FEATURED' ? 'FEATURED ROUND' : 'RAPID ROUND · 30 MIN'}
                            </div>

                            {/* Global Disclaimer for non-rapid */}
                            {currentRoundType !== 'RAPID' && (
                                <div className="text-[10px] font-bold uppercase tracking-widest text-neon-purple mt-1">
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

                        <div className={`flex items-end gap-2 mb-1 ${currentRoundType === 'ANCHOR' ? 'scale-110' : ''}`}>
                            <span className="material-symbols-outlined text-xl text-primary">{isTokenLocked ? 'timer' : 'lock_open'}</span>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">
                                {isTokenLocked ? 'Round Ends In' : 'Entry Closes In'}
                            </h2>
                        </div>

                        <div className="flex gap-4 mb-1">
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

                        {/* HALTED STATE MESSAGE */}
                        {isHalted && (
                            <div className="mt-2 p-3 bg-red-500 text-white border-4 border-primary rounded-xl flex items-center gap-4 animate-pulse max-w-md text-center">
                                <span className="material-symbols-outlined text-2xl">warning</span>
                                <div>
                                    <p className="font-black uppercase italic tracking-widest text-xs">Target Search Failed</p>
                                    <p className="text-[9px] font-bold opacity-80 uppercase tracking-tighter mt-1">
                                        No qualified tokens launched in the last hour. Seeking fresh assets...
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Round Timeline & Status Dashboard (COMPACT REFINEMENT) */}
                    <div className="w-full max-w-xl mx-auto mb-4 transition-all flex flex-col items-center gap-3">
                        {/* Timeline Card */}
                        <div className="w-full bg-white/40 backdrop-blur-sm border-2 border-primary/5 rounded-3xl p-4 shadow-sm">
                            <div className="w-full px-4 scale-90 sm:scale-100">
                                <div className="flex justify-between items-center relative">
                                    {/* Connector Line */}
                                    <div className="absolute left-0 right-0 h-[2px] bg-primary/10 top-1/2 -translate-y-1/2 z-0"></div>
                                    <div className="absolute left-0 w-1/3 h-[2px] bg-neon-green top-1/2 -translate-y-1/2 z-0"></div>

                                    {[
                                        { label: 'Entry Open', status: isTokenLocked ? 'completed' : 'active' },
                                        { label: 'Locked', status: isTokenLocked ? 'active' : 'pending' },
                                        { label: 'Live', status: 'pending' },
                                        { label: 'Resolved', status: 'pending' }
                                    ].map((step, i) => (
                                        <div key={i} className="relative z-10 flex flex-col items-center gap-1.5">
                                            <div className={`size-3.5 rounded-full border-[3px] border-white shadow-[0_0_8px_rgba(0,0,0,0.08)] ${step.status === 'active' || step.status === 'completed' ? 'bg-neon-green border-primary' : 'bg-primary/20 border-primary/10'}`}></div>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${step.status === 'active' || step.status === 'completed' ? 'text-primary' : 'text-primary/30'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Next Round Timer (NANO) */}
                        <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                            <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] italic">
                                Next Round:
                            </p>
                            <div className="px-2 py-0.5 bg-white/50 border border-primary/20 rounded shadow-sm">
                                <span className="text-primary font-mono text-[13px] font-bold tracking-tighter">
                                    {nextRoundTimeLeft.hours}:{nextRoundTimeLeft.minutes}:{nextRoundTimeLeft.seconds}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3-Column Layout - Stacked on Mobile */}
                    <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">

                        {/* Left Column (3 Spans) - Market Reality Layer (COLD) */}
                        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 lg:order-1 order-2">
                            <div className="flex flex-col gap-3 ml-2">
                                <div className="text-[10px] font-black uppercase text-primary/50 tracking-[0.3em]">Market Reality Layer</div>
                                <div className="h-[2px] w-12 bg-primary/10"></div>
                            </div>
                            {/* Live Asset Card - COLD STYLING */}
                            <div className="bg-[#f0f0f0] border-2 border-primary/40 rounded-lg p-6 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                                {roundState === 'ANNOUNCED' ? (
                                    <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                                        <div className="animate-pulse mb-6">
                                            <span className="material-symbols-outlined text-primary/30 text-6xl">hourglass_empty</span>
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic leading-tight mb-2">Waiting for<br />Players to Join</h3>
                                        <p className="text-[10px] font-mono text-primary/60 mb-8 max-w-[200px]">
                                            This round will begin automatically once enough players have entered.
                                        </p>

                                        {/* Player Progress */}
                                        <div className="w-full mb-6">
                                            <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                                <span>Participation</span>
                                                <span>{Math.min(100, (lobbyPlayers / MIN_PLAYERS) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="h-4 w-full bg-primary/10 rounded-full border border-primary/20 overflow-hidden relative">
                                                <div
                                                    className="h-full bg-neon-purple transition-all duration-500 ease-out relative"
                                                    style={{ width: `${Math.min(100, (lobbyPlayers / MIN_PLAYERS) * 100)}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                </div>
                                                {/* Threshold Marker */}
                                                <div className="absolute top-0 bottom-0 w-[2px] bg-primary/20 left-[100%]"></div>
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px] font-mono text-primary/60">{lobbyPlayers} / {MIN_PLAYERS} Players</span>
                                                <span className="text-[10px] font-mono text-primary/60">{format(new Date(lobbyEndTime - Date.now()), 'mm:ss')} left</span>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-4 w-full border-t border-primary/10 pt-4">
                                            <div className="bg-primary/5 p-2 rounded">
                                                <p className="text-[9px] font-black uppercase text-primary/40">Current Pot</p>
                                                <p className="font-mono font-bold">{potSol} SOL</p>
                                            </div>
                                            <div className="bg-primary/5 p-2 rounded">
                                                <p className="text-[9px] font-black uppercase text-primary/40">Min Pot</p>
                                                <p className="font-mono font-bold">{MIN_POT} SOL</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
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
                                                    <div className="size-24 rounded-sm border border-primary/10 overflow-hidden bg-white relative">
                                                        {selectedToken?.image ? (
                                                            <img
                                                                src={selectedToken.image}
                                                                alt={selectedToken.symbol}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = `https://dd.dexscreener.com/ds-data/tokens/solana/${selectedToken?.mint}.png`;
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-primary/5 text-primary/20">
                                                                <span className="material-symbols-outlined text-5xl">token</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="px-3 py-1 bg-neon-green border-2 border-primary rounded-full text-xs font-black uppercase italic">Live</span>
                                                        {selectionAudit && (
                                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded border border-primary/10 group cursor-help relative">
                                                                <span className="material-symbols-outlined text-[10px] text-primary/40">verified</span>
                                                                <span className="text-[8px] font-black uppercase tracking-tighter text-primary/40">Activity Filters</span>

                                                                {/* Tooltip */}
                                                                <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-primary text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
                                                                    <p className="font-bold mb-1">Rule-Based Selection</p>
                                                                    <p className="opacity-80">This token was chosen automatically based on liquidity, trade frequency, and unique trader counts to ensure a meaningful round.</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <h3 className="text-3xl font-black italic uppercase leading-none mb-1">
                                                    {selectedToken?.symbol || 'SEARCHING...'}
                                                </h3>
                                                <div className="flex flex-col mb-6">
                                                    <p className="text-[9px] font-black uppercase text-primary/50 tracking-widest mb-1">Token Address</p>
                                                    <p className="text-[10px] font-mono text-primary/70 break-all leading-tight bg-primary/5 p-2 rounded border border-primary/5 select-all">
                                                        {selectedToken?.mint || 'Scanning chain...'}
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs font-bold uppercase mb-1">
                                                    <span>{selectedToken?.bondingProgress && selectedToken.bondingProgress >= 100 ? 'Graduated' : 'Bonding'}</span>
                                                    <span>{Math.min(100, Math.floor(selectedToken?.bondingProgress || 0))}%</span>
                                                </div>
                                                <div className="h-4 w-full bg-primary/10 rounded-full border-2 border-primary overflow-hidden">
                                                    <div className="h-full bg-neon-purple relative" style={{ width: `${Math.min(100, selectedToken?.bondingProgress || 0)}%` }}>
                                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 py-4 border-t-2 border-dashed border-primary/20">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-primary/60">Market Cap</p>
                                                    <p className="font-mono font-bold text-primary">
                                                        {selectedToken?.mcUsd
                                                            ? (selectedToken.mcUsd >= 1000000
                                                                ? '$' + (selectedToken.mcUsd / 1000000).toFixed(1) + 'M'
                                                                : '$' + (selectedToken.mcUsd / 1000).toFixed(1) + 'K')
                                                            : '$1.24M'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-primary/60">Current ROI</p>
                                                    <p className="font-mono font-bold text-neon-purple">{((currentPrice || launchPrice) / (launchPrice || 1)).toFixed(1)}x</p>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-primary/5 rounded-lg border-2 border-primary/10 mb-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase text-primary/60">VWAP Peak (30s)</span>
                                                    <span className="font-mono font-bold text-xs text-primary">{peakRoi.toFixed(2)}x</span>
                                                </div>
                                                <div className="mt-1 h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-neon-green" style={{ width: `${Math.min(100, (peakRoi / 30) * 100)}%` }}></div>
                                                </div>
                                            </div>

                                            <a
                                                href={selectedToken
                                                    ? (selectedToken.mint.endsWith('pump')
                                                        ? `https://pump.fun/coin/${selectedToken.mint}`
                                                        : `https://dexscreener.com/solana/${selectedToken.mint}`)
                                                    : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`w-full py-4 bg-primary text-white font-black italic uppercase text-xl hover:bg-white hover:text-primary transition-colors border-2 border-primary flex items-center justify-center gap-2 group ${!selectedToken ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                <span>View Chart</span>
                                                <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">arrow_outward</span>
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Community Predictions */}
                            <div className="bg-primary border-4 border-primary rounded-2xl p-6 text-white shadow-[8px_8px_0px_0px_#ccff00]">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-neon-green">groups</span>
                                    <h4 className="font-black italic uppercase tracking-wider text-sm">Community Picks</h4>
                                </div>
                                <div className="space-y-3">
                                    {cmPredictions.map((item, i) => (
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
                                                {isLoadingTokens ? 'Scanning...' : 'Live Protocol Feed'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 group cursor-help">
                                            <span className="material-symbols-outlined text-[14px] text-neon-green">verified_user</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wide text-primary/40 group-hover:text-primary transition-colors">
                                                Verified Sources
                                            </span>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-4 w-48 p-3 bg-primary text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed text-center">
                                                Market data aggregated from Dexscreener, Pump.fun, and verified On-Chain via Solana RPC.
                                            </div>
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
                                    {/* Slider Area */}
                                    <div className="w-full max-w-lg mb-10">
                                        <div className="flex justify-between items-end mb-8 relative">
                                            <div className="text-center group cursor-pointer hover:-translate-y-1 transition-transform">
                                                <p className="text-[10px] font-black uppercase text-primary/40 mb-1">Floor</p>
                                                <p className="text-2xl font-black italic text-primary/40 group-hover:text-primary transition-colors">0x</p>
                                            </div>

                                            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-30">
                                                <div className="text-7xl font-black font-mono tracking-tighter italic tabular-nums relative drop-shadow-sm">
                                                    {prediction.toFixed(1)}
                                                    <span className="text-3xl text-neon-purple absolute top-0 -right-8">x</span>
                                                </div>
                                                <div className="text-xs font-bold uppercase tracking-widest bg-neon-green px-3 py-1 rounded inline-block -rotate-2 mt-2 border border-primary text-primary shadow-sm">Your Pick</div>
                                            </div>

                                            <div className="text-center group cursor-pointer hover:-translate-y-1 transition-transform">
                                                <p className="text-[10px] font-black uppercase text-primary/40 mb-1">Cap</p>
                                                <p className="text-2xl font-black italic text-primary/40 group-hover:text-primary transition-colors">30x</p>
                                            </div>
                                        </div>

                                        <div className="relative h-14 flex items-center select-none">
                                            {/* Track Background */}
                                            <div className="absolute w-full h-4 bg-primary/5 rounded-full border-2 border-primary/10 overflow-hidden">
                                                {/* Weighted Zones Visuals */}
                                                <div className="absolute left-0 w-[75%] h-full border-r-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10"></div>
                                                <div className="absolute right-0 w-[25%] h-full bg-neon-purple/5"></div>
                                            </div>

                                            {/* Labels / Ticks */}
                                            <div className="absolute top-full mt-2 left-[75%] -translate-x-1/2 flex flex-col items-center">
                                                <div className="w-0.5 h-2 bg-primary/20 mb-1"></div>
                                                <span className="text-[9px] font-bold text-primary/40 uppercase tracking-wider">10x</span>
                                            </div>

                                            {/* "Rare Outcome" Label */}
                                            <div className="absolute bottom-full mb-3 right-0 text-right pr-2">
                                                <span className="text-[9px] font-black uppercase text-neon-purple/40 tracking-[0.2em] relative top-1">
                                                    Extreme Outlier Zone
                                                </span>
                                            </div>

                                            {/* Fill Bar */}
                                            <div
                                                className="absolute h-4 bg-gradient-to-r from-neon-purple to-neon-green opacity-50 rounded-l-full pointer-events-none"
                                                style={{
                                                    width: `${prediction <= 10 ? (prediction / 10) * 75 : 75 + ((prediction - 10) / 20) * 25}%`
                                                }}
                                            ></div>

                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={prediction <= 10 ? (prediction / 10) * 75 : 75 + ((prediction - 10) / 20) * 25}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    let newPrediction;
                                                    // Reverse Map: Slider(0-100) -> Prediction(0-30)
                                                    if (val <= 75) {
                                                        // 0-75% maps to 0-10x
                                                        newPrediction = (val / 75) * 10;
                                                    } else {
                                                        // 75-100% maps to 10-30x
                                                        newPrediction = 10 + ((val - 75) / 25) * 20;
                                                    }
                                                    setPrediction(Number(newPrediction.toFixed(1))); // Snap to 1 decimal
                                                }}
                                                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                            />

                                            {/* Thumb Handle */}
                                            <div
                                                className="absolute h-8 w-8 bg-primary rounded-full border-4 border-neon-green shadow-[0_0_20px_#ccff00] z-10 pointer-events-none transition-transform hover:scale-110"
                                                style={{
                                                    left: `calc(${prediction <= 10 ? (prediction / 10) * 75 : 75 + ((prediction - 10) / 20) * 25}% - 16px)`
                                                }}
                                            ></div>
                                        </div>

                                        {/* Trust Copy */}
                                        <div className="text-center mt-6">
                                            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest bg-primary/5 inline-block px-4 py-1.5 rounded-full border border-primary/5">
                                                Most peaks occur below 10x. Extreme outcomes are rare.
                                            </p>
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

                                    {/* HOLDERS VIEW - Exclusive Insights */}
                                    {showHoldersView && isTokenHolder && (
                                        <div className="w-full mb-8 p-6 bg-gradient-to-br from-neon-purple/10 to-neon-green/10 rounded-xl border-2 border-neon-purple/30 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="material-symbols-outlined text-neon-purple">insights</span>
                                                <h3 className="text-sm font-black uppercase tracking-wider text-primary">Crowd Distribution Insights</h3>
                                            </div>

                                            {/* Prediction Distribution Histogram */}
                                            <div className="mb-4">
                                                <p className="text-[10px] font-bold uppercase text-primary/60 mb-2">Prediction Density</p>
                                                <div className="flex items-end justify-between h-20 gap-1">
                                                    {[15, 35, 55, 75, 90, 70, 45, 25, 10, 5].map((height, i) => (
                                                        <div key={i} className="flex-1 bg-neon-purple/30 rounded-t" style={{ height: `${height}%` }}>
                                                            <div className="w-full bg-neon-purple rounded-t" style={{ height: `${Math.random() * 40 + 20}%` }}></div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between mt-1 text-[8px] font-mono text-primary/40">
                                                    <span>0x</span>
                                                    <span>15x</span>
                                                    <span>30x</span>
                                                </div>
                                            </div>

                                            {/* Crowd Sentiment */}
                                            <div className="grid grid-cols-2 gap-3 text-[10px]">
                                                <div className="bg-white/50 p-3 rounded-lg">
                                                    <p className="font-bold text-primary/60 mb-1">Avg Prediction</p>
                                                    <p className="text-lg font-black text-neon-purple">14.2x</p>
                                                </div>
                                                <div className="bg-white/50 p-3 rounded-lg">
                                                    <p className="font-bold text-primary/60 mb-1">Crowd Sentiment</p>
                                                    <p className="text-lg font-black text-neon-green">Bullish</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* SEARCHING / HALTED STATE MESSAGE */}
                                    {isHalted && (
                                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                            <div className="bg-zinc-900 border border-primary/30 p-8 rounded-xl max-w-md text-center shadow-2xl">
                                                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                                                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Searching for Active Markets</h2>
                                                <p className="text-zinc-400 mb-6 leading-relaxed">
                                                    The Oracle is scanning the Solana ecosystem for fresh, high-velocity tokens to ensure a fair and exciting round.
                                                </p>
                                                <div className="flex gap-3 justify-center">
                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full animate-pulse">Scanning Pump.fun</span>
                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full animate-pulse delay-75">Indexing Dexscreener</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 gap-4 w-full">
                                        <div className="bg-white p-6 rounded-xl border-2 border-primary flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform">
                                            {(connected || isSimulationMode) && prediction !== null && stakeAmount !== '' && parseFloat(stakeAmount) > 0 ? (
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
                                            {(potSol + (activeBonus?.bonus || 0)).toFixed(2)} sol
                                            {activeBonus?.bonus !== undefined && activeBonus.bonus > 0 && (
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
                                    <div className="mb-4 p-4 bg-primary text-white border-4 border-neon-green rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 shadow-[0_0_20px_rgba(204,255,0,0.3)]">
                                        <div className="size-10 bg-neon-green text-primary rounded-full flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined font-black">lock</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black uppercase italic tracking-widest text-neon-green">Prediction Locked</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono opacity-60">TX: {txHash.slice(0, 12)}...</span>
                                                <a
                                                    href={`https://solscan.io/tx/${txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[9px] font-bold text-neon-purple hover:underline uppercase"
                                                >
                                                    View on Solscan
                                                </a>
                                            </div>
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
                                    disabled={(!isSimulationMode && !connected) || txStatus === 'signing' || txStatus === 'confirming' || !stakeAmount || parseFloat(stakeAmount) < minFee}
                                    className={`w-full py-4 text-white text-lg font-black uppercase italic tracking-widest rounded-xl border-4 border-primary transition-all group relative overflow-hidden
                                        ${((!isSimulationMode && !connected) || txStatus === 'signing' || txStatus === 'confirming' || !stakeAmount || parseFloat(stakeAmount) < minFee)
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
                                                <span className="group-hover:mr-2 transition-all">
                                                    {roundState === 'ANNOUNCED' ? 'Join Lobby & Start Round' : 'Lock It In'}
                                                </span>
                                                <span className="material-symbols-outlined align-middle text-sm absolute right-12 opacity-0 group-hover:opacity-100 group-hover:right-8 transition-all">
                                                    {roundState === 'ANNOUNCED' ? 'play_arrow' : 'lock'}
                                                </span>
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
                <Rules />
                <Docs />

                {/* Footer Ticker - RECENT WINS */}
                <div className="fixed bottom-0 left-0 right-0 bg-primary text-white py-1.5 border-t-2 border-neon-green overflow-hidden flex items-center z-40 shadow-[0_-10px_30px_rgba(189,255,25,0.2)]">
                    <div className="px-4 border-r border-white/20 mr-4 z-50 bg-primary flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase text-neon-green tracking-widest">Recent Wins</span>
                        <button
                            onClick={() => {
                                if (selectionAudit) {
                                    console.log('--- TOKEN SELECTION AUDIT ---');
                                    console.log('Chosen:', selectionAudit.chosenMint);
                                    console.log('Scores:', selectionAudit.scores);
                                    console.log('Rejections:', selectionAudit.rejectionReasons);
                                    alert(`Audit logged to console for Round ${selectionAudit.roundId}`);
                                } else {
                                    alert('No audit log available for this round yet.');
                                }
                            }}
                            className="text-[9px] font-mono text-white/40 hover:text-white uppercase cursor-pointer"
                        >
                            [Admin Audit]
                        </button>
                    </div>
                    <div className="flex animate-scroll whitespace-nowrap font-mono text-xs font-bold uppercase tracking-wider w-max">
                        {/* Repeat 3 times for seamless loop */}
                        {[1, 2, 3].map((set) => (
                            <div key={set} className="flex gap-16 items-center px-10">
                                {[
                                    { user: 'apaul.sol', roi: '15.2x', payout: '12.4' },
                                    { user: 'whale.eth', roi: '8.4x', payout: '45.1' },
                                    { user: 'degen42', roi: '22.1x', payout: '2.5' },
                                    { user: 'skynet', roi: '11.5x', payout: '18.9' },
                                    { user: 'anon', roi: '5.6x', payout: '0.9' },
                                    { user: '0x3a...f1', roi: '3.1x', payout: '7.2' }
                                ].map((win, i) => (
                                    <span key={i} className="flex items-center gap-2">
                                        <span className="text-white/40">USER</span>
                                        <span className="text-white">{win.user}</span>
                                        <span className="text-neon-green font-black underline">WON</span>
                                        <span className="text-neon-green">{win.roi}</span>
                                        <span className="text-white/40">/</span>
                                        <span className="text-white">{win.payout} SOL</span>
                                        <span className="text-white/10 ml-6">|</span>
                                    </span>
                                ))}
                            </div>
                        ))}
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

            {/* Waiting for Token State Overlay */}
            {isWaitingForToken && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center border-4 border-primary shadow-[0_0_50px_rgba(204,255,0,0.2)]">
                        <div className="inline-block p-4 rounded-full bg-primary/5 mb-6 relative">
                            <span className="material-symbols-outlined text-4xl text-primary animate-[spin_3s_linear_infinite]">hourglass_top</span>
                            <div className="absolute inset-0 border-2 border-neon-green/30 rounded-full animate-ping"></div>
                        </div>
                        <h2 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">Scanning Market</h2>
                        <p className="text-xs font-bold text-primary/60 mb-8 leading-relaxed px-4">
                            Finding a token with &gt;$20k liquidity and high trade velocity to ensure a fair round...
                        </p>

                        <div className="flex flex-col gap-2 mb-4">
                            <div className="flex justify-between text-[10px] font-black uppercase text-primary/40">
                                <span>Scanning Ecosystem</span>
                                <span>Verifying Activity</span>
                            </div>
                            <div className="w-full bg-primary/5 h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-neon-green animate-loading-bar w-1/2"></div>
                            </div>
                            <p className="text-[10px] font-mono font-bold text-center text-primary mt-1">
                                {isLoadingTokens ? (
                                    <span className="animate-pulse">Refreshing market data...</span>
                                ) : (
                                    candidates.length > 0 ? `Evaluated ${candidates.length} candidates (Profiles, Boosts, Search)` : 'Fetching market data...'
                                )}
                            </p>
                        </div>

                        <p className="text-[10px] font-mono text-primary/40 uppercase tracking-widest animate-pulse">
                            Live Scanning — Retrying every 10s <br />
                            <span className="text-[9px] opacity-70">Last updated: {new Date().toLocaleTimeString()}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
