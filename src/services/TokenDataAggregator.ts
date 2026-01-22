
import { TokenDataSource, AggregationResult } from './sources/DataSourceInterface';
import { DexscreenerSource } from './sources/DexscreenerSource';
import { PumpFunSource } from './sources/PumpFunSource';
import { RpcSanitySource } from './sources/RpcSanitySource';
import { TokenCandidate } from '../utils/tokenSelection';

export class TokenDataAggregator {
    private static instance: TokenDataAggregator;
    private sources: TokenDataSource[] = [];
    private tier2Source: TokenDataSource;

    private constructor() {
        // Initialize Sources
        this.sources = [
            new DexscreenerSource(),
            new PumpFunSource() // Tier 1 Alternate
        ];
        this.tier2Source = new RpcSanitySource();
    }

    public static getInstance(): TokenDataAggregator {
        if (!TokenDataAggregator.instance) {
            TokenDataAggregator.instance = new TokenDataAggregator();
        }
        return TokenDataAggregator.instance;
    }

    /**
     * Main entry point: Fetches candidates from all Tier 1 sources in parallel.
     * If total failures occur, halts.
     */
    async fetchAggregatedCandidates(): Promise<AggregationResult> {
        console.log('[Aggregator] Starting multi-source fetch...');
        const timestamp = Date.now();
        const sourcesUsed: string[] = [];

        // 1. Fetch from all Tier 1 sources in parallel
        const results = await Promise.all(
            this.sources.map(async (source) => {
                const candidates = await source.fetchCandidates();
                if (candidates.length > 0) sourcesUsed.push(source.name);
                return candidates;
            })
        );

        // 2. Flatten and Deduplicate
        const allCandidates = results.flat();
        const uniqueMap = new Map<string, TokenCandidate>();

        allCandidates.forEach(c => {
            if (!uniqueMap.has(c.mint)) {
                uniqueMap.set(c.mint, c);
            } else {
                // Determine "better" data if duplicate
                // For now, assume Dexscreener (first source) is authority if conflict
                const existing = uniqueMap.get(c.mint)!;
                if ((!existing.price || existing.price <= 0) && (c.price || 0) > 0) {
                    uniqueMap.set(c.mint, c);
                }
            }
        });

        const uniqueCandidates = Array.from(uniqueMap.values());
        console.log(`[Aggregator] Merged ${allCandidates.length} raw -> ${uniqueCandidates.length} unique candidates.`);

        // 3. Failsafe Check
        if (uniqueCandidates.length === 0) {
            console.warn('[Aggregator] CRITICAL: All Tier 1 sources failed or returned empty.');
            // Sanity check: Is internet/RPC down?
            // This would be where we trigger Tier 2 to see if *anything* is alive,
            // but Tier 2 doesn't give us Price, so we can't truly "fallback" for a game round.
            // We just report empty, which triggers the HALT state in UI.
        }

        return {
            candidates: uniqueCandidates,
            sourcesUsed,
            timestamp
        };
    }

    /**
     * Validates a specific chosen token before locking it in.
     * This is the "Final Consistency Check".
     */
    async validateCandidate(candidate: TokenCandidate): Promise<boolean> {
        // 1. Sanity Check via RPC (Tier 2)
        // Verify mint exists and isn't frozen/dead
        const onChainData = await this.tier2Source.fetchTokenDetails(candidate.mint);
        if (!onChainData) {
            console.warn(`[Aggregator] Validation FAILED for ${candidate.symbol}: Mint not found on-chain.`);
            return false;
        }

        // 2. Price Consistency (Future: Compare multiple price sources if we had them)
        // Current Check: Liquidity Sanity
        const safeLiq = candidate.liquidityUsd || 0;
        const safeMc = candidate.mcUsd || 0;
        if (safeLiq > safeMc * 2) {
            console.warn(`[Aggregator] Validation WARNING for ${candidate.symbol}: Liquidity > 2x MC? Suspicious.`);
            // Soft fail or log? For now log.
        }

        return true;
    }
}
