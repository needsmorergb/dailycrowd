
import { TokenDataSource, TokenMetrics } from './DataSourceInterface';
import { TokenCandidate } from '../../utils/tokenSelection';
import { DexscreenerSource } from './DexscreenerSource'; // Reuse mapper if possible or duplicate

export class PumpFunSource implements TokenDataSource {
    name = 'PumpFun_Search';
    tier: 1 | 2 | 3 = 1;
    private health: 'healthy' | 'degraded' | 'down' = 'healthy';

    // We use Dexscreener SEARCH as a proxy for "Pump Fun" ecosystem since direct API is blocked
    // This allows us to find specifically "Pump" tokens or "Solana" trending

    async fetchCandidates(): Promise<TokenCandidate[]> {
        const queries = ['pump', 'solana', 'meme', 'ai', 'beta'];
        try {
            const results = await Promise.all(
                queries.map(q =>
                    fetch(`https://api.dexscreener.com/latest/dex/search?q=${q}`, { cache: 'no-store' })
                        .then(res => res.json())
                        .then(data => data.pairs || [])
                        .catch(() => [])
                )
            );

            const allPairs = results.flat();

            // Deduplicate logic
            const seen = new Set();
            const uniquePairs = allPairs.filter((p: any) => {
                const mint = p.baseToken?.address;
                if (!mint || seen.has(mint)) return false;
                seen.add(mint);
                // Hard filter: Must be Solana
                return p.chainId === 'solana';
            });

            // Map using a local helper (duplicated to keep Source independent)
            return uniquePairs.map(p => this.mapPairToCandidate(p));

        } catch (e) {
            console.error('[PumpSource] Search failed:', e);
            this.health = 'degraded';
            return [];
        }
    }

    async fetchTokenDetails(mint: string): Promise<TokenMetrics | null> {
        // PumpSource basically relies on Dexscreener search, so detail fetch is same.
        // We defer to Generic/DexSource logic for details usually.
        return null;
    }

    getHealthStatus() { return this.health; }

    private mapPairToCandidate(p: any): TokenCandidate {
        const mint = p.baseToken?.address;
        const mcUsd = p.marketCap || p.fdv || 0;
        const isPump = mint.toLowerCase().endsWith('pump');
        let bondingProgress = isPump ? (mcUsd / 69000) * 100 : 100;
        if (bondingProgress > 100) bondingProgress = 100;

        return {
            mint,
            symbol: (p.baseToken?.symbol || '???').toUpperCase(),
            name: p.baseToken?.name || 'Unknown',
            createdAt: p.pairCreatedAt || Date.now(),
            vol15m: (p.volume?.m5 || 0) * 3,
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
