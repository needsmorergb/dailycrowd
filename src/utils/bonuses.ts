/**
 * Zero-Subsidy Reward Bonus Logic
 * 
 * Rules:
 * 1. Immediate Profitability: House takes 10% fee from round one.
 * 2. Creator Reward Funding: All bonuses come from a dedicated creator_reward_pool.
 * 3. Conditional Injections: Featured (min 1 SOL) and Anchor (min 3 SOL) only run if funded.
 */

export interface RoundStats {
    totalEntryFees: number;
    playerCount: number;
    roundStartTime: Date;
    roundType: 'RAPID' | 'FEATURED' | 'ANCHOR';
}

export class RewardBonusManager {
    private creatorRewardPool: number = 0; // State persisted in backend/localstorage

    private readonly FEATURED_MIN_BONUS = 1.0;
    private readonly FEATURED_MAX_BONUS = 0.5;
    private readonly ANCHOR_MIN_BONUS = 3.0;

    constructor(initialPool: number = 0) {
        this.creatorRewardPool = initialPool;
    }

    /**
     * Funding the pool from incoming rewards
     * Split: 50% House, 25% Bonus Pool, 25% Buyback
     */
    receiveCreatorReward(amount: number): { toHouse: number; toPool: number; toBuyback: number } {
        const toHouse = amount * 0.5;
        const toPool = amount * 0.25;
        const toBuyback = amount * 0.25;

        this.creatorRewardPool += toPool;

        return { toHouse, toPool, toBuyback };
    }

    /**
     * Calculates the injection for the current round
     */
    calculateInjection(roundType: 'RAPID' | 'FEATURED' | 'ANCHOR'): {
        injection: number;
        label: string;
        isActive: boolean;
    } {
        // 1. Featured Round Logic
        if (roundType === 'FEATURED') {
            if (this.creatorRewardPool >= this.FEATURED_MIN_BONUS) {
                const injection = Math.min(this.creatorRewardPool * 0.25, this.FEATURED_MAX_BONUS);
                this.creatorRewardPool -= injection;
                return {
                    injection,
                    label: 'Bonus funded by creator rewards',
                    isActive: true
                };
            }
            return { injection: 0, label: 'No bonus active for this round', isActive: false };
        }

        // 2. Anchor Round Logic
        if (roundType === 'ANCHOR') {
            if (this.creatorRewardPool >= this.ANCHOR_MIN_BONUS) {
                // For anchor, we might inject a larger fixed amount or percentage
                const injection = Math.min(this.creatorRewardPool * 0.3, 1.5);
                this.creatorRewardPool -= injection;
                return {
                    injection,
                    label: 'Bonus funded by creator rewards',
                    isActive: true
                };
            }
            return { injection: 0, label: 'No bonus active for this round', isActive: false };
        }

        // Standard Rapid rounds have no bonus injection
        return { injection: 0, label: '', isActive: false };
    }

    getPoolBalance(): number {
        return this.creatorRewardPool;
    }
}
