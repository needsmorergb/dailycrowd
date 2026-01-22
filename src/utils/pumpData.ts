import { TokenCandidate } from './tokenSelection';

export interface PumpTokenApiResponse {
    mint: string;
    symbol: string;
    name: string;
    created_timestamp: number;
    usd_market_cap: number;
    v_buy_qty_5m: number;
    v_sell_qty_5m: number;
    total_trades_5m: number;
    unique_traders_5m: number;
    volume_5m: number;
    volume_30m: number;
    volatility_5m: number;
    image_uri?: string;
    complete?: boolean;
    bonding_curve_percentage?: number;
}

const EXCLUDED_SYMBOLS = ['SOL', 'WSOL', 'BONK', 'JUP', 'WIF', 'PYTH', 'POPCAT', 'USDC', 'USDT', 'RAY', 'ORCA', 'DRIFT', 'ZETA', 'BOME', 'MEW', 'JITOSOL', 'MSOL'];

const SEED_TOKENS = [
    { mint: 'J5ftSUhpFPGigP8dGFSQCrf44rZeGnFvWbVbkSe3pump', symbol: 'MISSED', name: 'Missedanthropic', mcUsd: 1250000, price: 0.00000125, vol5m: 5000 },
    { mint: 'HeLp6elPRQvRsSba8Z7En5Y84X7fW26YkXW17fJ25n4pump', symbol: 'FARTCOIN', name: 'Fartcoin', mcUsd: 25000000, price: 0.025, vol5m: 15000 },
    { mint: 'jtoS6XonY997m7s6TjMvNoYxsnA7LzshfC9Qn38h959', symbol: 'Jitosol', name: 'Jito Staked SOL', mcUsd: 1500000000, price: 175.5, vol5m: 50000 }
];

/**
 * Tiered search for tokens to ensure we ALWAYS find something.
 * 1. Fresh & Hot (< 2h, > $1000 Vol)
 * 2. Recent (< 6h, > $200 Vol)
 * 3. Daily Active (< 24h, > $50 Vol)
 * 4. Safety Net (Boosts/Trending)
 */
import { TokenDataAggregator } from '../services/TokenDataAggregator';

/**
 * Tiered search for tokens to ensure we ALWAYS find something.
 * NOW USES: Multi-Source Aggregator (Tier 1 + 2)
 */
export async function fetchLatestPumpTokens(): Promise<TokenCandidate[]> {
    try {
        const aggregator = TokenDataAggregator.getInstance();
        const result = await aggregator.fetchAggregatedCandidates();
        let uniqueCandidates = result.candidates;

        // Final Safety Net: Seed Tokens
        if (uniqueCandidates.length === 0) {
            console.warn('ALL API FEEDS FAILED. Triggering emergency seed fallback.');
            uniqueCandidates = SEED_TOKENS.map(t => ({
                mint: t.mint,
                symbol: t.symbol,
                name: t.name,
                createdAt: Date.now() - (6 * 60 * 60 * 1000),
                vol15m: t.vol5m * 3,
                trades15m: 80,
                uniqueTraders15m: 35,
                volatility15m: 4.5,
                highLowRange15m: 6.0,
                bondingProgress: 85,
                price: t.price,
                mcUsd: t.mcUsd,
                liquidityUsd: t.mcUsd * 0.1,
                image: `https://dd.dexscreener.com/ds-data/tokens/solana/${t.mint}.png`
            }));
        }

        // Ticker Healing is now partly done in Aggregator but we keep enrichment for top candidates
        const topForTicker = uniqueCandidates.sort((a, b) => (b.vol15m || 0) - (a.vol15m || 0)).slice(0, 15);
        topForTicker.forEach(t => {
            if (t.symbol === '???' || (t.price || 0) <= 0.0000001) {
                fetchTokenDetails(t.mint).then(details => {
                    if (details) Object.assign(t, details);
                }).catch(() => { });
            }
        });

        return uniqueCandidates.sort((a, b) => (b.vol15m || 0) - (a.vol15m || 0)).slice(0, 40);

    } catch (error) {
        console.error('Aggregator error:', error);
        return [];
    }
}

// Keep fetchTokenDetails as a direct helper or move to Aggregator entirely?
// For now, redirect to Aggregator's internal source logic or keep simple.
// It is used by OracleTerminal for single-token updates.
export async function fetchTokenDetails(mint: string): Promise<Partial<TokenCandidate> | null> {
    // Redirect to Dexscreener Source for consistency
    // But since we need Candidate shape, we might need a mapper. 
    // Let's keep the existing logic here for now but use the new fetch wrapper if we wanted DRY.
    // For safety in this refactor, I'll keep the existing fetchTokenDetails logic below as is, 
    // or better, implement it using the Source.

    // Legacy implementation preserved for stability of single-token polling
    try {
        console.log(`Polling live data for: ${mint}`);
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {
            cache: 'no-store'
        });

        if (!response.ok) return null;
        const data = await response.json();

        if (!data || !data.pairs || data.pairs.length === 0) return null;

        const pair = data.pairs.sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0];

        const mcUsd = pair.marketCap || pair.fdv || 0;
        const isPump = mint.toLowerCase().endsWith('pump');
        let bondingProgress = isPump ? (mcUsd / 69000) * 100 : 100;
        if (bondingProgress > 100) bondingProgress = 100;

        return {
            price: parseFloat(pair.priceUsd || '0') || (mcUsd / 1000000000) || 0.00001,
            mcUsd,
            symbol: pair.baseToken?.symbol || pair.symbol || '???',
            name: pair.baseToken?.name || pair.name || 'Unknown',
            bondingProgress,
            vol15m: (pair.volume?.m5 || 0) * 3,
            trades15m: (((pair.txns?.m5?.buys || 0) + (pair.txns?.m5?.sells || 0)) || 0) * 3,
            liquidityUsd: pair.liquidity?.usd || (mcUsd * 0.05)
        };
    } catch (e) {
        console.error('Error polling token details:', e);
        return null;
    }
}

/**
 * Fetches real-time details (Price, MC, Volume) for a specific token
 */
