
import { TokenCandidate } from '../../utils/tokenSelection';

export interface TokenMetrics {
    price: number;
    liquidity: number;
    volume24h: number;
    volume1h?: number;
    volume5m?: number;
    marketCap: number;
    supply?: number;
    updatedAt: number;
}

export interface TokenDataSource {
    name: string;
    tier: 1 | 2 | 3; // 1=Primary, 2=Backup/Sanity, 3=Enrichment

    /**
     * Fetches a list of potential candidates from this source.
     * Returns a normalized list of TokenCandidates.
     */
    fetchCandidates(): Promise<TokenCandidate[]>;

    /**
     * Fetches details for a specific token.
     * Used for enrichment or verification.
     */
    fetchTokenDetails(mint: string): Promise<TokenMetrics | null>;

    /**
     * Returns the current health status of this source.
     */
    getHealthStatus(): 'healthy' | 'degraded' | 'down';
}

export interface AggregationResult {
    candidates: TokenCandidate[];
    sourcesUsed: string[];
    timestamp: number;
}
