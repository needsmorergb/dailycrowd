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
 * Primary fetch: Tokens launched STRICTLY in the last hour with MOTION
 * Covers all Solana ecosystems (Raydium, Pump, etc.) via Dexscreener
 */
export async function fetchLatestPumpTokens(): Promise<TokenCandidate[]> {
    try {
        console.log('Fetching tokens launched strictly in the last hour with activity...');

        const oneHourAgo = Date.now() - (60 * 60 * 1000);

        // Fetch latest Solana pairs from internal API proxy (to bypass CORS)
        const response = await fetch('/api/tokens?source=dex', {
            cache: 'no-store'
        });

        if (!response.ok) {
            console.log('API proxy primary failed, trying fallback...');
            return await fetchPumpFunTokens();
        }

        const data = await response.json();

        if (!data || !data.pairs || data.pairs.length === 0) {
            return await fetchPumpFunTokens();
        }

        const candidates: TokenCandidate[] = [];
        const seenMints = new Set<string>();

        // STRICT FILTER: Created < 60 mins ago AND has volume AND has price motion
        const validPairs = data.pairs.filter((p: any) => {
            if (!p.pairCreatedAt) return false;

            const pairAge = Date.now() - p.pairCreatedAt;
            const isStrictlyRecent = pairAge < (60 * 60 * 1000);

            const isExcluded = EXCLUDED_SYMBOLS.includes(p.baseToken?.symbol?.toUpperCase());

            // Motion check: must have volume and some price movement in last 5m or 1h
            const hasVolume = (p.volume?.h1 || 0) > 500; // Require at least $500 vol
            const hasMotion = Math.abs(p.priceChange?.h1 || 0) > 0.1 || Math.abs(p.priceChange?.m5 || 0) > 0.1;

            return (
                p.chainId === 'solana' &&
                isStrictlyRecent &&
                !isExcluded &&
                hasVolume &&
                hasMotion &&
                p.baseToken?.address &&
                p.priceUsd
            );
        });

        console.log(`Found ${validPairs.length} qualified tokens launched in the last hour`);

        validPairs.forEach((pair: any) => {
            if (seenMints.has(pair.baseToken.address)) return;
            seenMints.add(pair.baseToken.address);

            const isPumpToken = pair.baseToken.address.endsWith('pump');
            const marketCap = pair.marketCap || pair.fdv || 0;

            let bondingProgress = 100;
            if (isPumpToken && marketCap < 69000) {
                bondingProgress = Math.min(100, (marketCap / 69000) * 100);
            }

            const ageMinutes = Math.floor((Date.now() - pair.pairCreatedAt) / 60000);

            console.log(`  - ${pair.baseToken.symbol}: ${ageMinutes}m old | Vol: $${pair.volume?.h1?.toFixed(0)} | Move: ${pair.priceChange?.h1}%`);

            candidates.push({
                mint: pair.baseToken.address,
                symbol: pair.baseToken.symbol,
                name: pair.baseToken.name,
                createdAt: pair.pairCreatedAt,
                vol5m: pair.volume?.m5 || 0,
                trades5m: (pair.txns?.m5?.buys || 0) + (pair.txns?.m5?.sells || 0),
                uniqueTraders5m: 0,
                vol30m: (pair.volume?.m5 || 0) * 6,
                volatility5m: Math.abs(pair.priceChange?.m5 || 1.0),
                price: parseFloat(pair.priceUsd || '0'),
                mcUsd: marketCap,
                bondingProgress,
                image: pair.info?.imageUrl || `https://dd.dexscreener.com/ds-data/tokens/solana/${pair.baseToken.address}.png`
            });
        });

        if (candidates.length > 0) {
            // Sort by highest volume to find the most active "bidding" token
            return candidates.sort((a, b) => (b.vol5m || 0) - (a.vol5m || 0)).slice(0, 20);
        }

        return await fetchPumpFunTokens();
    } catch (error) {
        console.error('Dexscreener fetch error:', error);
        return await fetchPumpFunTokens();
    }
}

/**
 * Fallback: Latest Pump.fun tokens (Strict 1-hour)
 */
async function fetchPumpFunTokens(): Promise<TokenCandidate[]> {
    try {
        console.log('Trying Pump.fun latest for fresh tokens via proxy...');
        const response = await fetch('/api/tokens?source=pump', {
            cache: 'no-store'
        });

        if (!response.ok) throw new Error('Pump.fun proxy fetch failed');

        const data: PumpTokenApiResponse[] = await response.json();
        const oneHourAgo = Date.now() - (60 * 60 * 1000);

        const recent = data.filter(c => c.created_timestamp > oneHourAgo);

        if (recent.length === 0) return await fetchStaticFallback();

        return recent.map(coin => ({
            mint: coin.mint,
            symbol: coin.symbol,
            name: coin.name,
            createdAt: coin.created_timestamp,
            vol5m: coin.volume_5m || 0,
            trades5m: coin.total_trades_5m || 0,
            uniqueTraders5m: coin.unique_traders_5m || 0,
            vol30m: coin.volume_30m || 0,
            volatility5m: coin.volatility_5m || 1.5,
            price: coin.usd_market_cap / 1000000000, // Normalized
            mcUsd: coin.usd_market_cap,
            bondingProgress: coin.complete ? 100 : (coin.bonding_curve_percentage ?? Math.min(100, (coin.usd_market_cap / 69000) * 100)),
            image: coin.image_uri || `https://dd.dexscreener.com/ds-data/tokens/solana/${coin.mint}.png`
        }));
    } catch (error) {
        console.error('Pump.fun fallback fail:', error);
        return await fetchStaticFallback();
    }
}

async function fetchStaticFallback(): Promise<TokenCandidate[]> {
    console.warn('CRITICAL: No live tokens found in last hour. Using static failover (Check API connectivity).');
    return [{
        mint: '3B5wuUrMEi5yATD7on46hKfej3pfmd7t1RKgrsN3pump',
        symbol: 'FALLBACK',
        name: 'Fallback Token',
        createdAt: Date.now() - 30 * 60 * 1000,
        vol5m: 5000,
        trades5m: 100,
        uniqueTraders5m: 20,
        vol30m: 30000,
        volatility5m: 2.0,
        price: 0.00001,
        mcUsd: 10000,
        bondingProgress: 15,
        image: 'https://dd.dexscreener.com/ds-data/tokens/solana/3B5wuUrMEi5yATD7on46hKfej3pfmd7t1RKgrsN3pump.png'
    }];
}
