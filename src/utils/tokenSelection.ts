import { TOKEN_SELECTION_CONFIG } from './tokenSelectionConfig';

export interface TokenCandidate {
    mint: string;
    symbol: string;
    name: string;
    createdAt: number;
    vol15m: number;
    trades15m: number;
    uniqueTraders15m: number;
    volatility15m: number; // Max percentage movement
    highLowRange15m?: number;
    bondingProgress?: number;
    price?: number;
    mcUsd?: number;
    liquidityUsd?: number;
    image?: string;
}

export interface SelectionAudit {
    roundId: string;
    snapshotTime: number;
    candidatesExamined: number;
    filtersUsed: any;
    expansionStep: number;
    rejectionReasons: Record<string, string[]>;
    eligibleMints: string[];
    scores: Record<string, number>;
    weightedProbabilities: Record<string, number>;
    chosenMint: string;
    timestamp: number;
}

export class TokenSelector {
    private usedMints: Set<string> = new Set();
    private auditLogs: SelectionAudit[] = [];

    async selectTargetToken(roundId: string, snapshotTime: number, candidates: TokenCandidate[]): Promise<{ chosen: TokenCandidate | null; wait: boolean; audit: SelectionAudit }> {
        const config = TOKEN_SELECTION_CONFIG;
        let expansionStep = 0;
        let eligiblePool: TokenCandidate[] = [];
        let rejectionReasons: Record<string, string[]> = {};

        // Expand thresholds if needed (one step)
        let currentFilters = { ...config.FILTERS };

        // 1. Primary Filter
        eligiblePool = this.filterPool(candidates, currentFilters, rejectionReasons);

        // 2. expansionStep 1 (Failsafe)
        if (eligiblePool.length < config.MIN_POOL_SIZE) {
            expansionStep = 1;
            const expandedFilters = {
                ...currentFilters,
                MIN_LIQUIDITY_USD: config.FAILSAFE.MIN_LIQUIDITY_USD,
                MIN_TRADES_15M: config.FAILSAFE.MIN_TRADES_15M,
                MIN_UNIQUE_TRADERS_15M: config.FAILSAFE.MIN_UNIQUE_TRADERS_15M,
            };
            eligiblePool = this.filterPool(candidates, expandedFilters, rejectionReasons);
        }

        if (eligiblePool.length === 0) {
            const audit = this.createAudit(roundId, snapshotTime, candidates, eligiblePool, expansionStep, rejectionReasons, {}, {}, '');
            return { chosen: null, wait: true, audit };
        }

        // 3. Scoring
        const scores = this.calculateScores(eligiblePool);

        // 4. Weighting & Probabilities for Top K
        // Sort by score and take top K
        const sortedPool = [...eligiblePool].sort((a, b) => (scores[b.mint] || 0) - (scores[a.mint] || 0)).slice(0, config.TOP_K);
        const probabilities = this.calculateWeights(sortedPool, scores);

        // 5. Selection
        const chosenMint = this.weightedRandomChoice(sortedPool.map(t => t.mint), probabilities);
        const chosen = sortedPool.find(t => t.mint === chosenMint)!;

        this.usedMints.add(chosenMint);

        const audit = this.createAudit(roundId, snapshotTime, candidates, eligiblePool, expansionStep, rejectionReasons, scores, probabilities, chosenMint);
        this.auditLogs.push(audit);

        return { chosen, wait: false, audit };
    }

    private filterPool(pool: TokenCandidate[], filters: any, rejectionReasons: Record<string, string[]>): TokenCandidate[] {
        const now = Date.now();
        return pool.filter(t => {
            const reasons: string[] = [];
            const ageMin = (now - t.createdAt) / 60000;

            if (ageMin < filters.MIN_AGE_MINUTES) reasons.push('too_young');
            if ((t.liquidityUsd || 0) < filters.MIN_LIQUIDITY_USD) reasons.push('low_liquidity');
            if ((t.mcUsd || 0) < filters.MIN_MARKET_CAP_USD) reasons.push('low_mc');
            if ((t.mcUsd || 0) > filters.MAX_MARKET_CAP_USD) reasons.push('high_mc');
            if (t.trades15m < filters.MIN_TRADES_15M) reasons.push('low_activity_trades');
            if (t.uniqueTraders15m < filters.MIN_UNIQUE_TRADERS_15M) reasons.push('low_activity_traders');

            const volValid = (t.volatility15m || 0) >= filters.MIN_PRICE_CHANGE_15M_ABS_PCT ||
                (t.highLowRange15m || 0) >= filters.MIN_HIGH_LOW_RANGE_15M_PCT;
            if (!volValid) reasons.push('low_volatility');

            if (t.bondingProgress !== undefined) {
                const [min, max] = filters.BONDING_CURVE_RANGE;
                if (t.bondingProgress < min || t.bondingProgress > max) reasons.push('bonding_out_of_range');
            }

            if (this.usedMints.has(t.mint)) reasons.push('recently_used');

            if (reasons.length > 0) {
                rejectionReasons[t.mint] = reasons;
                return false;
            }
            return true;
        });
    }

    private calculateScores(pool: TokenCandidate[]): Record<string, number> {
        const weights = TOKEN_SELECTION_CONFIG.SCORE_WEIGHTS;
        const scores: Record<string, number> = {};

        // Find max values for normalization
        const maxVol = Math.max(...pool.map(t => t.vol15m), 1);
        const maxTrades = Math.max(...pool.map(t => t.trades15m), 1);
        const maxTraders = Math.max(...pool.map(t => t.uniqueTraders15m), 1);
        const maxVolatility = Math.max(...pool.map(t => t.volatility15m), 1);

        pool.forEach(t => {
            const nVol = t.vol15m / maxVol;
            const nTrades = t.trades15m / maxTrades;
            const nTraders = t.uniqueTraders15m / maxTraders;
            const nVolatility = (t.volatility15m || 0) / maxVolatility;

            scores[t.mint] =
                (weights.VOLUME_15M * nVol) +
                (weights.TRADES_15M * nTrades) +
                (weights.UNIQUE_TRADERS_15M * nTraders) +
                (weights.VOLATILITY_15M * nVolatility);
        });

        return scores;
    }

    private calculateWeights(pool: TokenCandidate[], scores: Record<string, number>): Record<string, number> {
        const probabilities: Record<string, number> = {};
        const temp = TOKEN_SELECTION_CONFIG.TEMP;

        let totalWeight = 0;
        pool.forEach(t => {
            const weight = Math.exp((scores[t.mint] || 0) / temp);
            probabilities[t.mint] = weight;
            totalWeight += weight;
        });

        // Normalize
        pool.forEach(t => {
            probabilities[t.mint] /= totalWeight;
        });

        return probabilities;
    }

    private weightedRandomChoice(mints: string[], weights: Record<string, number>): string {
        const r = Math.random();
        let cumulative = 0;
        for (const mint of mints) {
            cumulative += weights[mint];
            if (r <= cumulative) return mint;
        }
        return mints[mints.length - 1];
    }

    private createAudit(roundId: string, snapshotTime: number, all: TokenCandidate[], eligible: TokenCandidate[], step: number, rejections: any, scores: any, probs: any, chosen: string): SelectionAudit {
        return {
            roundId,
            snapshotTime,
            candidatesExamined: all.length,
            filtersUsed: TOKEN_SELECTION_CONFIG.FILTERS,
            expansionStep: step,
            rejectionReasons: rejections,
            eligibleMints: eligible.map(t => t.mint),
            scores,
            weightedProbabilities: probs,
            chosenMint: chosen,
            timestamp: Date.now()
        };
    }

    getAuditLogs(): SelectionAudit[] {
        return this.auditLogs;
    }
}
