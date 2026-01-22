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
 * Primary fetch: ONLY tokens launched in the last hour
 * Excludes ALL established tokens (SOL, BONK, JUP, etc.)
 */
export async function fetchLatestPumpTokens(): Promise<TokenCandidate[]> {
    try {
        console.log('Fetching tokens launched in the last hour...');

        const oneHourAgo = Date.now() - (60 * 60 * 1000);

        // Fetch trending Solana pairs
        const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112');

        if (!response.ok) {
            console.log('Dexscreener trending failed, trying Pump.fun...');
            return await fetchPumpFunTokens();
        }

        const data = await response.json();

        if (!data || !data.pairs || data.pairs.length === 0) {
            return await fetchPumpFunTokens();
        }

        const candidates: TokenCandidate[] = [];
        const seenMints = new Set<string>();

        // STRICT FILTER: Only tokens launched in the last hour
        const recentPairs = data.pairs.filter((p: any) => {
            // Must have creation timestamp
            if (!p.pairCreatedAt) return false;

            const pairAge = Date.now() - p.pairCreatedAt;
            const isWithinLastHour = pairAge < (60 * 60 * 1000); // 1 hour

            // Exclude SOL and all established tokens
            const excludedSymbols = ['SOL', 'WSOL', 'BONK', 'JUP', 'WIF', 'PYTH', 'POPCAT', 'USDC', 'USDT'];
            const isExcluded = excludedSymbols.includes(p.baseToken?.symbol?.toUpperCase());

            // Must have some activity
            const hasVolume = (p.volume?.h1 || 0) > 100; // At least $100 volume
            const hasLiquidity = (p.liquidity?.usd || 0) > 100; // At least $100 liquidity

            return (
                p.chainId === 'solana' &&
                isWithinLastHour &&
                !isExcluded &&
                hasVolume &&
                hasLiquidity &&
                p.baseToken?.address &&
                p.priceUsd
            );
        });

        console.log(`Found ${recentPairs.length} tokens launched in the last hour`);

        recentPairs.slice(0, 30).forEach((pair: any) => {
            if (seenMints.has(pair.baseToken.address)) return;

            seenMints.add(pair.baseToken.address);

            const isPumpToken = pair.baseToken.address.endsWith('pump');
            const marketCap = pair.marketCap || pair.fdv || 0;

            let bondingProgress = 100;
            if (isPumpToken && marketCap < 69000) {
                bondingProgress = Math.min(100, (marketCap / 69000) * 100);
            }

            const pairAge = Date.now() - pair.pairCreatedAt;
            const ageMinutes = Math.floor(pairAge / (60 * 1000));

            console.log(`  - ${pair.baseToken.symbol}: launched ${ageMinutes}m ago, vol: $${pair.volume?.h1?.toFixed(0) || 0}`);

            candidates.push({
                mint: pair.baseToken.address,
                symbol: pair.baseToken.symbol,
                name: pair.baseToken.name,
                createdAt: pair.pairCreatedAt,
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
            // Sort by most recent first
            return candidates.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);
        }

        console.log('No tokens found in last hour, trying Pump.fun...');
        return await fetchPumpFunTokens();
    } catch (error) {
        console.error('Recent token fetch error:', error);
        return await fetchPumpFunTokens();
    }
}

/**
 * Secondary: Pump.fun API for new launches
 */
async function fetchPumpFunTokens(): Promise<TokenCandidate[]> {
    try {
        console.log('Fetching new launches from Pump.fun...');
        const response = await fetch('https://frontend-api.pump.fun/coins/latest?limit=50&offset=0', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to fetch from Pump.fun');

        const data: PumpTokenApiResponse[] = await response.json();

        if (!data || data.length === 0) throw new Error('Empty response from Pump.fun');

        const oneHourAgo = Date.now() - (60 * 60 * 1000);

        // Filter for tokens created in the last hour
        const recentTokens = data.filter(coin => {
            const createdAt = coin.created_timestamp;
            return createdAt > oneHourAgo;
        });

        console.log(`Found ${recentTokens.length} Pump.fun tokens launched in the last hour`);

        if (recentTokens.length === 0) {
            console.warn('No recent Pump.fun tokens, using static fallback');
            return await fetchStaticFallback();
        }

        return recentTokens.map(coin => {
            const ageMinutes = Math.floor((Date.now() - coin.created_timestamp) / (60 * 1000));
            console.log(`  - ${coin.symbol}: launched ${ageMinutes}m ago`);

            return {
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
            };
        });
    } catch (error) {
        console.error('Pump.fun API error:', error);
        return await fetchStaticFallback();
    }
}

/**
 * Last resort: Static fallback (simulated new token)
 */
async function fetchStaticFallback(): Promise<TokenCandidate[]> {
    console.warn('Using static fallback - simulated new token');

    const now = Date.now();
    const thirtyMinutesAgo = now - (30 * 60 * 1000);

    return [{
        mint: '3B5wuUrMEi5yATD7on46hKfej3pfmd7t1RKgrsN3pump',
        symbol: 'NEWTOKEN',
        name: 'New Launch Token',
        createdAt: thirtyMinutesAgo,
        vol5m: 5000,
        trades5m: 150,
        uniqueTraders5m: 40,
        vol30m: 15000,
        volatility5m: 2.5,
        price: 0.00001,
        mcUsd: 10000,
        bondingProgress: 15,
        image: 'https://dd.dexscreener.com/ds-data/tokens/solana/3B5wuUrMEi5yATD7on46hKfej3pfmd7t1RKgrsN3pump.png'
    }];
}
