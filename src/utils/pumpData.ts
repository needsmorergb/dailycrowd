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

/**
 * Tiered search for tokens to ensure we ALWAYS find something.
 * 1. Fresh & Hot (< 2h, > $1000 Vol)
 * 2. Recent (< 6h, > $200 Vol)
 * 3. Daily Active (< 24h, > $50 Vol)
 * 4. Safety Net (Boosts/Trending)
 */
export async function fetchLatestPumpTokens(): Promise<TokenCandidate[]> {
    try {
        console.log('Starting tiered token search...');

        // Tier 1 & 2: Dexscreener Profiles/Latest
        let candidates = await fetchFromDexTiered();

        if (candidates.length === 0) {
            console.log('No Dexscreener tokens found, trying Pump.fun...');
            candidates = await fetchPumpFunTokens();
        }

        // Final Safety Net: Dexscreener Boosts
        if (candidates.length === 0) {
            console.log('Still nothing, trying Dexscreener Boosts as safety net...');
            candidates = await fetchFromDexSource('boosts');
        }

        if (candidates.length > 0) {
            // Deduplicate and sort by volume
            const unique = Array.from(new Map(candidates.map(item => [item.mint, item])).values());
            console.log(`Bulletproof search found ${unique.length} unique candidates.`);
            return unique.sort((a, b) => (b.vol5m || 0) - (a.vol5m || 0)).slice(0, 20);
        }

        console.error('CRITICAL: All token search tiers failed!');
        return [];
    } catch (error) {
        console.error('Bulletproof search error:', error);
        return [];
    }
}

async function fetchFromDexTiered(): Promise<TokenCandidate[]> {
    const data = await fetchFromDexSource('profiles');
    if (!data || data.length === 0) return [];

    const now = Date.now();

    // TIER 1: Fresh & Hot (< 2 hours)
    const tier1 = data.filter(c => {
        const age = now - (c.createdAt || 0);
        return age < (2 * 60 * 60 * 1000) && (c.vol5m || 0) > 100;
    });
    if (tier1.length > 0) {
        console.log(`Found ${tier1.length} Tier 1 (Fresh & Hot) tokens.`);
        return tier1;
    }

    // TIER 2: Recent (< 6 hours)
    const tier2 = data.filter(c => {
        const age = now - (c.createdAt || 0);
        return age < (6 * 60 * 60 * 1000) && (c.vol5m || 0) > 20;
    });
    if (tier2.length > 0) {
        console.log(`Found ${tier2.length} Tier 2 (Recent) tokens.`);
        return tier2;
    }

    // TIER 3: Daily Active (< 24 hours)
    const tier3 = data.filter(c => {
        const age = now - (c.createdAt || 0);
        return age < (24 * 60 * 60 * 1000);
    });

    console.log(`Falling back to ${tier3.length} Tier 3 (Daily Active) tokens.`);
    return tier3;
}

async function fetchFromDexSource(source: string): Promise<TokenCandidate[]> {
    try {
        const response = await fetch(`/api/tokens?source=${source}`, { cache: 'no-store' });
        if (!response.ok) return [];

        const data = await response.json();
        // Dexscreener Profile/Boost endpoints return an array of objects
        const results = Array.isArray(data) ? data : (data.pairs || []);

        return results
            .filter((p: any) => {
                const symbol = (p.baseToken?.symbol || p.symbol || '').toUpperCase();
                return !EXCLUDED_SYMBOLS.includes(symbol) && (p.baseToken?.address || p.mint || p.tokenAddress);
            })
            .map((p: any) => {
                const mint = p.baseToken?.address || p.mint || p.tokenAddress || p.address;
                const mcUsd = p.marketCap || p.fdv || 0;
                const symbol = p.baseToken?.symbol || p.symbol || p.tokenSymbol || '???';
                const isPump = mint.endsWith('pump');
                let bondingProgress = isPump ? (mcUsd / 69000) * 100 : 100;
                if (bondingProgress > 100) bondingProgress = 100;

                return {
                    mint,
                    symbol,
                    name: p.baseToken?.name || p.name || p.tokenName || 'Unknown',
                    createdAt: p.pairCreatedAt || p.tokenCreated_at || Date.now() - (12 * 60 * 60 * 1000),
                    vol5m: p.volume?.m5 || p.volume_5m || 0,
                    trades5m: (p.txns?.m5?.buys || 0) + (p.txns?.m5?.sells || 0) || p.total_trades_5m || 0,
                    uniqueTraders5m: 0,
                    vol30m: (p.volume?.h1 || 0) / 2 || 0,
                    volatility5m: Math.abs(p.priceChange?.m5 || 1.0) || 1.0,
                    price: parseFloat(p.priceUsd || p.price || (mcUsd / 1000000000).toString()),
                    mcUsd,
                    bondingProgress,
                    image: p.info?.imageUrl || p.image_uri || p.icon || p.image || `https://dd.dexscreener.com/ds-data/tokens/solana/${mint}.png`
                };
            });
    } catch (e) {
        return [];
    }
}

async function fetchPumpFunTokens(): Promise<TokenCandidate[]> {
    try {
        const response = await fetch('/api/tokens?source=pump', { cache: 'no-store' });
        if (!response.ok) return [];

        const data: PumpTokenApiResponse[] = await response.json();

        // Tiered filter for Pump.fun too
        return data.map(coin => {
            const mcUsd = coin.usd_market_cap;
            let bondingProgress = coin.complete ? 100 : (mcUsd / 69000) * 100;
            if (bondingProgress > 100) bondingProgress = 100;

            return {
                mint: coin.mint,
                symbol: coin.symbol,
                name: coin.name,
                createdAt: coin.created_timestamp,
                vol5m: coin.volume_5m || 0,
                trades5m: coin.total_trades_5m || 0,
                uniqueTraders5m: coin.unique_traders_5m || 0,
                vol30m: coin.volume_30m || 0,
                volatility5m: coin.volatility_5m || 1.5,
                price: mcUsd / 1000000000,
                mcUsd: mcUsd,
                bondingProgress,
                image: coin.image_uri || `https://dd.dexscreener.com/ds-data/tokens/solana/${coin.mint}.png`
            };
        });
    } catch (error) {
        return [];
    }
}

/**
 * Fetches real-time details (Price, MC, Volume) for a specific token
 */
export async function fetchTokenDetails(mint: string): Promise<Partial<TokenCandidate> | null> {
    try {
        console.log(`Polling live data for: ${mint}`);
        // Dexscreener pairs API supports fetching by address
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {
            cache: 'no-store'
        });

        if (!response.ok) return null;
        const data = await response.json();

        if (!data || !data.pairs || data.pairs.length === 0) return null;

        // Take the pair with the highest volume (usually the main pool)
        const pair = data.pairs.sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0];

        const mcUsd = pair.marketCap || pair.fdv || 0;
        const isPump = mint.endsWith('pump');
        let bondingProgress = isPump ? (mcUsd / 69000) * 100 : 100;
        if (bondingProgress > 100) bondingProgress = 100;

        return {
            price: parseFloat(pair.priceUsd || '0'),
            mcUsd,
            bondingProgress,
            vol5m: pair.volume?.m5 || 0,
            trades5m: (pair.txns?.m5?.buys || 0) + (pair.txns?.m5?.sells || 0)
        };
    } catch (e) {
        console.error('Error polling token details:', e);
        return null;
    }
}
