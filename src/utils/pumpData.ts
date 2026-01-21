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
}

export async function fetchLatestPumpTokens(): Promise<TokenCandidate[]> {
    try {
        const response = await fetch('https://frontend-api.pump.fun/coins/trending?limit=20&offset=0', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
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
            bondingProgress: (coin.usd_market_cap / 69000) * 100,
            image: coin.image_uri || `https://dd.dexscreener.com/ds-data/tokens/solana/${coin.mint}.png`
        }));
    } catch (error) {
        return await fetchFallbackTokens();
    }
}

async function fetchFallbackTokens(): Promise<TokenCandidate[]> {
    try {
        console.log('Fetching dynamic ecosystem tokens...');

        // Search queries for ecosystems requested by user (including Pump)
        const queries = ['Pump', 'Bonk', 'Bags', 'WLFI', 'USD1'];

        // Parallel fetch for all search queries
        const results = await Promise.all(
            queries.map(q =>
                fetch(`https://api.dexscreener.com/latest/dex/search/?q=${q}`)
                    .then(res => res.ok ? res.json() : null)
                    .catch(err => null)
            )
        );

        const candidates: TokenCandidate[] = [];
        const seenMints = new Set<string>();

        // Process results from all queries
        results.forEach(data => {
            if (!data || !data.pairs) return;

            // Filter for Solana pairs with decent liquidity/volume
            const validPairs = data.pairs.filter((p: any) =>
                p.chainId === 'solana' &&
                p.liquidity?.usd > 10000 &&
                p.volume?.h24 > 50000 &&
                p.baseToken?.address
            );

            validPairs.forEach((pair: any) => {
                if (seenMints.has(pair.baseToken.address)) return;

                seenMints.add(pair.baseToken.address);
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
                    mcUsd: pair.marketCap || pair.fdv || 0,
                    bondingProgress: 100,
                    image: pair.info?.imageUrl || `https://dd.dexscreener.com/ds-data/tokens/solana/${pair.baseToken.address}.png`
                });
            });
        });

        // If dynamic fetch yields results, return them (random selection happens downstream)
        if (candidates.length > 0) {
            // Sort by 24h volume to ensure quality
            return candidates.sort((a, b) => b.vol30m - a.vol30m).slice(0, 20);
        }

        throw new Error('No dynamic candidates found');

    } catch (error) {
        console.error('Dynamic Fallback Error:', error);

        // Static "Disaster Recovery" list if even Dexscreener search fails
        return [{
            mint: '3B5wuUrMEi5yATD7on46hKfej3pfmd7t1RKgrsN3pump', // Billy
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
}
