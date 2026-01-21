import { TOKEN_SELECTION_CONFIG } from './tokenSelectionConfig';

export interface TokenCandidate {
    mint: string;
    symbol: string;
    name: string;
    createdAt: number;
    vol5m: number;
    trades5m: number;
    uniqueTraders5m: number;
    vol30m: number;
    volatility5m: number;
    bondingProgress?: number;
    price?: number;
    mcUsd?: number;
    image?: string;
}

export interface SelectionAudit {
    roundId: string;
    snapshotTime: number;
    candidateList: { mint: string, symbol: string }[];
    filtersApplied: string[];
    eligibleList: string[]; // mints
    scores: Record<string, number>;
    weights: Record<string, number>;
    chosenMint: string;
    seed: string;
    version: string;
    relaxations: string[];
}

export class TokenSelector {
    private usedMints: Set<string> = new Set();

    async selectTargetToken(roundId: string, snapshotTime: number, candidates: TokenCandidate[]): Promise<{ chosen: TokenCandidate; audit: SelectionAudit }> {
        const pool = candidates;
        let relaxations: string[] = [];

        // 1. Initial Filtering
        let eligiblePool = this.filterPool(pool);

        // 2. Relaxation if needed
        if (eligiblePool.length < TOKEN_SELECTION_CONFIG.MIN_POOL_SIZE) {
            const result = this.relaxFilters(pool);
            eligiblePool = result.pool;
            relaxations = result.relaxations;
        }

        // 3. Scoring
        const scores = this.calculateScores(eligiblePool);

        // 4. Weighting
        const weights = this.calculateWeights(scores);

        // 5. Selection (Weighted Random)
        const seed = Math.random().toString(36).substring(7); // In production, use crypto.getRandomValues
        const chosenMint = this.weightedRandomChoice(eligiblePool.map(t => t.mint), weights);

        const chosen = eligiblePool.find(t => t.mint === chosenMint)!;
        this.usedMints.add(chosenMint);

        const audit: SelectionAudit = {
            roundId,
            snapshotTime,
            candidateList: candidates.map(c => ({ mint: c.mint, symbol: c.symbol })),
            filtersApplied: ['age', 'activity', 'recent_use'],
            eligibleList: eligiblePool.map(t => t.mint),
            scores,
            weights,
            chosenMint,
            seed,
            version: '1.0.0',
            relaxations
        };

        return { chosen, audit };
    }

    private filterPool(pool: TokenCandidate[]): TokenCandidate[] {
        const config = TOKEN_SELECTION_CONFIG.FILTERS;
        const now = Date.now();

        return pool.filter(t => {
            const ageMin = (now - t.createdAt) / 60000;
            const ageHours = ageMin / 60;

            const isAgeValid = ageMin >= config.MIN_AGE_MINUTES && ageHours <= config.MAX_AGE_HOURS;
            const isVolValid = t.vol5m >= config.MIN_VOL_5M_SOL;
            const isTradesValid = t.trades5m >= config.MIN_TRADES_5M;
            const isTradersValid = t.uniqueTraders5m >= config.MIN_UNIQUE_TRADERS_5M;
            const isNotRecentlyUsed = !this.usedMints.has(t.mint);

            return isAgeValid && isVolValid && isTradesValid && isTradersValid && isNotRecentlyUsed;
        });
    }

    private relaxFilters(pool: TokenCandidate[]): { pool: TokenCandidate[]; relaxations: string[] } {
        const relaxations: string[] = [];

        // Simplified relaxation for demo
        relaxations.push('lower_activity_thresholds');
        return { pool: pool.slice(0, 5), relaxations }; // Fallback to top 5
    }

    private calculateScores(pool: TokenCandidate[]): Record<string, number> {
        const weights = TOKEN_SELECTION_CONFIG.SCORE_WEIGHTS;
        const scores: Record<string, number> = {};

        // Normalize and score
        pool.forEach(t => {
            // Mocked normalization for demo
            const normVol = Math.min(t.vol5m / 100, 1);
            const normUniq = Math.min(t.uniqueTraders5m / 500, 1);
            const normTrades = Math.min(t.trades5m / 1000, 1);
            const volAccel = t.vol5m / Math.max(t.vol30m / 6, 0.1);
            const normAccel = Math.min(volAccel / 2, 1);
            const normVolatility = Math.min(t.volatility5m / TOKEN_SELECTION_CONFIG.VOL_CAP, 1);

            scores[t.mint] =
                weights.VOL_5M * normVol +
                weights.UNIQ_5M * normUniq +
                weights.TRADES_5M * normTrades +
                weights.VOL_ACCEL * normAccel +
                weights.VOLATILITY_5M * normVolatility;
        });

        return scores;
    }

    private calculateWeights(scores: Record<string, number>): Record<string, number> {
        const weights: Record<string, number> = {};
        const temp = TOKEN_SELECTION_CONFIG.TEMP;

        let total = 0;
        Object.entries(scores).forEach(([mint, score]) => {
            const w = Math.exp(score / temp);
            weights[mint] = w;
            total += w;
        });

        // Normalize to 1
        Object.keys(weights).forEach(mint => {
            weights[mint] /= total;
        });

        return weights;
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
}
