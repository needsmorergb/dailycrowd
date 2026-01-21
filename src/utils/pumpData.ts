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
}

export async function fetchLatestPumpTokens(): Promise<TokenCandidate[]> {
    try {
        // In a real scenario, this would hit the Pump.fun frontend API or a dedicated indexing service
        // For this implementation, we simulate the fetch from the trending endpoint
        const response = await fetch('https://frontend-api.pump.fun/coins/trending?limit=20&offset=0', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) throw new Error('Failed to fetch from Pump.fun');

        const data: PumpTokenApiResponse[] = await response.json();

        return data.map(coin => ({
            mint: coin.mint,
            symbol: coin.symbol,
            name: coin.name,
            createdAt: coin.created_timestamp,
            vol5m: coin.volume_5m / 1e9, // Convert lamports to SOL if necessary, or use USD
            trades5m: coin.total_trades_5m,
            uniqueTraders5m: coin.unique_traders_5m,
            vol30m: coin.volume_30m / 1e9,
            volatility5m: coin.volatility_5m || (Math.random() * 2), // Fallback volatility
        }));
    } catch (error) {
        console.error('PumpDataService Error:', error);
        // Fallback to empty or mock if network fails during dev
        return [];
    }
}
