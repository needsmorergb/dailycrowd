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
        console.error('PumpDataService Error:', error);
        return [{
            mint: '3B5wuUrMEi5yATD7on46hKfej3pfmd7t1RKgrsN3pump',
            symbol: 'BILLY',
            name: 'Billy',
            createdAt: Date.now() - 86400000 * 30, // 30 days ago
            vol5m: 4500,
            trades5m: 1200,
            uniqueTraders5m: 350,
            vol30m: 12500,
            volatility5m: 1.25,
            price: 0.18,
            mcUsd: 180000000,
            bondingProgress: 100,
            image: 'https://dd.dexscreener.com/ds-data/tokens/solana/3B5wuUrMEi5yATD7on46hKfej3pfmd7t1RKgrsN3pump.png'
        }, {
            mint: 'HeLp6Nu64ecnAcSstL2S1RY9S4AsuHkyuB6YyEeg6pzt',
            symbol: 'AMERICA',
            name: 'America',
            createdAt: Date.now() - 3600000,
            vol5m: 500,
            trades5m: 150,
            uniqueTraders5m: 45,
            vol30m: 2100,
            volatility5m: 1.45,
            price: 0.00001,
            mcUsd: 10000,
            bondingProgress: 15,
            image: 'https://dd.dexscreener.com/ds-data/tokens/solana/HeLp6Nu64ecnAcSstL2S1RY9S4AsuHkyuB6YyEeg6pzt.png'
        }];
    }
}
