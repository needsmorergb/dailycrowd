
import { TokenDataSource, TokenMetrics } from './DataSourceInterface';
import { TokenCandidate } from '../../utils/tokenSelection';

// Reuse logic from current pumpData but structured as a class
const EXCLUDED_SYMBOLS = ['SOL', 'WSOL', 'BONK', 'JUP', 'WIF', 'RAY', 'USDC', 'USDT'];

export class DexscreenerSource implements TokenDataSource {
    name = 'Dexscreener';
    tier: 1 | 2 | 3 = 1;
    private health: 'healthy' | 'degraded' | 'down' = 'healthy';

    async fetchCandidates(): Promise<TokenCandidate[]> {
        try {
            // We fetch Profiles (Fresh) and Boosts (Trending)
            const [profiles, boosts] = await Promise.all([
                this.fetchFromEndpoint('profiles'),
                this.fetchFromEndpoint('boosts')
            ]);

            // Basic deduplication happens at aggregation layer, but we can return both
            return [...profiles, ...boosts];
        } catch (e) {
            console.error('[DexSource] Fetch failed:', e);
            this.health = 'degraded';
            return [];
        }
    }

    async fetchTokenDetails(mint: string): Promise<TokenMetrics | null> {
        try {
            const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, { cache: 'no-store' });
            if (!res.ok) return null;
            const data = await res.json();
            const pair = data.pairs?.[0]; // Best pair

            if (!pair) return null;

            return {
                price: parseFloat(pair.priceUsd || '0'),
                liquidity: pair.liquidity?.usd || 0,
                volume24h: pair.volume?.h24 || 0,
                volume5m: pair.volume?.m5 || 0,
                marketCap: pair.marketCap || pair.fdv || 0,
                updatedAt: Date.now()
            };
        } catch (e) {
            return null;
        }
    }

    getHealthStatus() { return this.health; }

    private async fetchFromEndpoint(source: 'profiles' | 'boosts'): Promise<TokenCandidate[]> {
        try {
            // Note: We are mocking the internal API call here by assuming the 
            // proxy at /api/tokens is available or hitting dexscreener direct if simpler.
            // For robustness, we will hit the Dexscreener API direct if on server, 
            // or use our internal proxy if on client. Since this service runs on client (mostly),
            // let's use the proxy pattern we established.

            // Actually, best practice for 'Service' is to use absolute URL or relative if known environment.
            // We'll stick to the fetch logic pattern used in pumpData.

            const response = await fetch(`https://api.dexscreener.com/token-${source}/latest/v1`, { cache: 'no-store' });
            if (!response.ok) return [];

            const data = await response.json();
            // Profiles/Boosts return structured data, we need to extract mints and enrich
            const items = Array.isArray(data) ? data : [];
            const mints = items.map((p: any) => p.tokenAddress).filter((m: any) => m).slice(0, 40);

            if (mints.length === 0) return [];

            return await this.fetchPairsBatch(mints);
        } catch (e) {
            console.error(`[DexSource] ${source} failed:`, e);
            return [];
        }
    }

    private async fetchPairsBatch(mints: string[]): Promise<TokenCandidate[]> {
        // Dexscreener allows max 30 addresses. Split into chunks.
        const chunks = [];
        for (let i = 0; i < mints.length; i += 30) {
            chunks.push(mints.slice(i, i + 30));
        }

        const candidates: TokenCandidate[] = [];
        for (const chunk of chunks) {
            try {
                const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${chunk.join(',')}`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.pairs) {
                        data.pairs.forEach((p: any) => {
                            candidates.push(this.mapPairToCandidate(p));
                        });
                    }
                }
            } catch (e) { /* ignore chunk fail */ }
        }
        return candidates;
    }

    private mapPairToCandidate(p: any): TokenCandidate {
        const mint = p.baseToken?.address || p.mint || p.tokenAddress;
        const mcUsd = p.marketCap || p.fdv || 0;
        const isPump = mint.toLowerCase().endsWith('pump');
        let bondingProgress = isPump ? (mcUsd / 69000) * 100 : 100;
        if (bondingProgress > 100) bondingProgress = 100;

        return {
            mint,
            symbol: (p.baseToken?.symbol || '???').toUpperCase(),
            name: p.baseToken?.name || 'Unknown',
            createdAt: p.pairCreatedAt || Date.now(), // Fallback if missing
            vol15m: (p.volume?.m5 || 0) * 3, // rough estimate
            trades15m: ((p.txns?.m5?.buys || 0) + (p.txns?.m5?.sells || 0)) * 3,
            uniqueTraders15m: ((p.txns?.m5?.buys || 0) + (p.txns?.m5?.sells || 0)),
            volatility15m: Math.abs(p.priceChange?.m5 || 0),
            highLowRange15m: Math.abs(p.priceChange?.m5 || 0) * 1.5,
            price: parseFloat(p.priceUsd || '0'),
            mcUsd,
            liquidityUsd: p.liquidity?.usd || 0,
            bondingProgress,
            image: p.info?.imageUrl || `https://dd.dexscreener.com/ds-data/tokens/solana/${mint}.png`
        };
    }
}
