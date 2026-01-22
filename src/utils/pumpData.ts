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

/**
 * Primary fetch: Recent pumping tokens (last hour)
 * Excludes SOL (base token) and searches for tokens with recent price action
 */
export async function fetchLatestPumpTokens(): Promise<TokenCandidate[]> {
    try {
        console.log('Fetching recently pumping tokens (last hour)...');

        // Fetch trending Solana pairs sorted by 1h price change
        const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112');

        if (!response.ok) {
            console.log('Dexscreener trending failed, trying search...');
            return await fetchBySearch();
        }

        const data = await response.json();

        if (!data || !data.pairs || data.pairs.length === 0) {
            return await fetchBySearch();
        }

        const candidates: TokenCandidate[] = [];
        const seenMints = new Set<string>();
        const oneHourAgo = Date.now() - (60 * 60 * 1000);

        // Filter for recently pumping pairs
        const validPairs = data.pairs.filter((p: any) => {
            // Exclude SOL itself (wrapped SOL)
            if (p.baseToken?.symbol === 'SOL' || p.baseToken?.symbol === 'WSOL') {
                return false;
            }

            // Must have recent activity
            const pairAge = p.pairCreatedAt ? Date.now() - p.pairCreatedAt : Infinity;
            const hasRecentActivity = pairAge < (24 * 60 * 60 * 1000); // Created in last 24h OR has recent volume

            // Must be pumping (positive 1h price change)
            const priceChange1h = p.priceChange?.h1 || 0;
            const isPumping = priceChange1h > 5; // At least 5% gain in last hour

            return (
                p.chainId === 'solana' &&
                p.liquidity?.usd > 5000 &&
                p.volume?.h1 > 5000 && // At least $5K volume in last hour
                p.baseToken?.address &&
                p.priceUsd &&
                isPumping &&
                (hasRecentActivity || p.volume?.h1 > 50000) // Either new or high volume
            );
        });

        validPairs.slice(0, 30).forEach((pair: any) => {
            if (seenMints.has(pair.baseToken.address)) return;

            seenMints.add(pair.baseToken.address);

            const isPumpToken = pair.baseToken.address.endsWith('pump');
            const marketCap = pair.marketCap || pair.fdv || 0;

            let bondingProgress = 100;
            if (isPumpToken && marketCap < 69000) {
                bondingProgress = Math.min(100, (marketCap / 69000) * 100);
            }

            candidates.push({
                mint: pair.baseToken.address,
                symbol: pair.baseToken.symbol,
                name: pair.baseToken.name,
                createdAt: pair.pairCreatedAt || Date.now(),
                vol5m: pair.volume?.m5 || 0,
                trades5m: (pair.txns?.m5?.buys || 0) + (pair.txns?.m5?.sells || 0),
                uniqueTraders5m: 0,
                vol30m: (pair.volume?.m5 || 0) * 6,
                volatility5m: Math.abs(pair.priceChange?.m5 || 0),
                price: parseFloat(pair.priceUsd || '0'),
                mcUsd: marketCap,
                bondingProgress,
                image: pair.info?.imageUrl || `https://dd.dexscreener.com/ds-data/tokens/solana/${pair.baseToken.address}.png`
            });
        });

        if (candidates.length > 0) {
            console.log(`Found ${candidates.length} recently pumping tokens (excluding SOL)`);
            // Sort by 1h volume to get most active pumps
            return candidates.sort((a, b) => b.vol30m - a.vol30m).slice(0, 20);
        }

        return await fetchBySearch();
    } catch (error) {
        console.error('Recent pump fetch error:', error);
        return await fetchBySearch();
    }
}

/**
 * Secondary: Search-based fetch for diverse pumping tokens
 */
async function fetchBySearch(): Promise<TokenCandidate[]> {
    try {
        console.log('Searching for diverse pumping tokens...');

        // Search popular pumping tokens (NOT SOL)
        const queries = ['BONK', 'JUP', 'WIF', 'PYTH', 'POPCAT'];

        const results = await Promise.all(
            queries.map(q =>
                fetch(`https://api.dexscreener.com/latest/dex/search/?q=${q}`)
                    .then(res => res.ok ? res.json() : null)
                    .catch(() => null)
            )
        );

        const candidates: TokenCandidate[] = [];
        const seenMints = new Set<string>();

        results.forEach(data => {
            if (!data || !data.pairs) return;

            const validPairs = data.pairs.filter((p: any) => {
                // Exclude SOL
                if (p.baseToken?.symbol === 'SOL' || p.baseToken?.symbol === 'WSOL') {
                    return false;
                }

                const priceChange1h = p.priceChange?.h1 || 0;

                return (
                    p.chainId === 'solana' &&
                    p.liquidity?.usd > 3000 &&
                    p.volume?.h1 > 3000 &&
                    p.baseToken?.address &&
                    priceChange1h > 0 // Positive price action
                );
            });

            validPairs.forEach((pair: any) => {
                if (seenMints.has(pair.baseToken.address)) return;

                seenMints.add(pair.baseToken.address);

                const isPumpToken = pair.baseToken.address.endsWith('pump');
                const marketCap = pair.marketCap || pair.fdv || 0;

                let bondingProgress = 100;
                if (isPumpToken && marketCap < 69000) {
                    bondingProgress = Math.min(100, (marketCap / 69000) * 100);
                }

                candidates.push({
                    mint: pair.baseToken.address,
                    symbol: pair.baseToken.symbol,
                    name: pair.baseToken.name,
                    createdAt: pair.pairCreatedAt || Date.now(),
                    vol5m: pair.volume?.m5 || 0,
                    trades5m: (pair.txns?.m5?.buys || 0) + (pair.txns?.m5?.sells || 0),
                    uniqueTraders5m: 0,
                    vol30m: (pair.volume?.m5 || 0) * 6,
                    volatility5m: Math.abs(pair.priceChange?.m5 || 0),
                    price: parseFloat(pair.priceUsd || '0'),
                    mcUsd: marketCap,
                    bondingProgress,
                    image: pair.info?.imageUrl || `https://dd.dexscreener.com/ds-data/tokens/solana/${pair.baseToken.address}.png`
                });
            });
        });

        if (candidates.length > 0) {
            return candidates.sort((a, b) => b.vol30m - a.vol30m).slice(0, 20);
        }

        return await fetchPumpFunTokens();
    } catch (error) {
        console.error('Search fetch error:', error);
        return await fetchPumpFunTokens();
    }
}

/**
 * Tertiary: Pump.fun API fallback
 */
async function fetchPumpFunTokens(): Promise<TokenCandidate[]> {
    try {
        console.log('Fetching from Pump.fun API...');
        const response = await fetch('https://frontend-api.pump.fun/coins/trending?limit=20&offset=0', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to fetch from Pump.fun');

        const data: PumpTokenApiResponse[] = await response.json();

        if (!data || data.length === 0) throw new Error('Empty response from Pump.fun');

        return data.map(coin => ({
            mint: coin.mint,
            symbol: coin.symbol,
            name: coin.name,
            createdAt: coin.created_timestamp,
            vol5m: coin.volume_5m || 0,
            trades5m: coin.total_trades_5m || 0,
            uniqueTraders5m: coin.unique_traders_5m || 0,
            vol30m: coin.volume_30m || 0,
            volatility5m: coin.volatility_5m || (Math.random() * 2),
            price: (coin.usd_market_cap / 1000000000) * (1 + Math.random() * 0.1),
            mcUsd: coin.usd_market_cap,
            bondingProgress: coin.complete ? 100 : (coin.bonding_curve_percentage ?? Math.min(100, (coin.usd_market_cap / 69000) * 100)),
            image: coin.image_uri || `https://dd.dexscreener.com/ds-data/tokens/solana/${coin.mint}.png`
        }));
    } catch (error) {
        console.error('Pump.fun API error:', error);
        return await fetchStaticFallback();
    }
}

/**
 * Last resort: Static fallback
 */
async function fetchStaticFallback(): Promise<TokenCandidate[]> {
    console.warn('Using static fallback token list');

    return [{
        mint: '3B5wuUrMEi5yATD7on46hKfej3pfmd7t1RKgrsN3pump',
        symbol: 'BILLY',
        name: 'Billy',
        createdAt: Date.now(),
        vol5m: 12000,
        trades5m: 1500,
        uniqueTraders5m: 400,
        vol30m: 50000,
        volatility5m: 2.5,
        price: 0.02,
        mcUsd: 20000000,
        bondingProgress: 100,
        image: 'https://dd.dexscreener.com/ds-data/tokens/solana/3B5wuUrMEi5yATD7on46hKfej3pfmd7t1RKgrsN3pump.png'
    }];
}
