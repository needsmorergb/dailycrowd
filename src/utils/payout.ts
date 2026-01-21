/**
 * Payout Engine Logic
 * 
 * Rules:
 * 1. Entry Fee: 0.03 SOL
 * 2. Split: 80% Pot, 10% House, 5% Revenue Share, 5% Buyback/Burn
 * 3. Pot Splits: Closest predictions using tie-banding (e.g., within 0.1x of each other share equally)
 */

export interface Prediction {
    userAddress: string;
    predictedRoi: number;
    stakeAmount: number;
    isHolder: boolean; // Added for tie-break priority
}

export interface PayoutResult {
    userAddress: string;
    payoutAmount: number;
    sharePercentage: number;
}

export class PayoutEngine {
    private potPercentage: number = 0.8;
    private housePercentage: number = 0.1;
    private revSharePercentage: number = 0.05;
    private burnPercentage: number = 0.05;
    private tieBand: number = 0.1; // Within 0.1x ROI

    calculatePayouts(totalPot: number, actualPeakRoi: number, predictions: Prediction[]): PayoutResult[] {
        if (predictions.length === 0) return [];

        // 1. Calculate the distance from actual peak for each prediction
        const predictionsWithDistance = predictions.map(p => ({
            ...p,
            distance: Math.abs(p.predictedRoi - actualPeakRoi)
        }));

        // 2. Sort by distance (closest first), then by holder status (priority)
        predictionsWithDistance.sort((a, b) => {
            if (a.distance !== b.distance) {
                return a.distance - b.distance;
            }
            // If distances are identical, holders come first
            return (b.isHolder ? 1 : 0) - (a.isHolder ? 1 : 0);
        });

        // 3. Identify the winners (those within the tie-band of the best prediction)
        const bestDistance = predictionsWithDistance[0].distance;
        const winners = predictionsWithDistance.filter(p =>
            p.distance <= bestDistance + this.tieBand
        );

        // 4. Calculate payouts for winners
        // In this simplified model, winners split the pot equally
        const payoutPerWinner = (totalPot * this.potPercentage) / winners.length;
        const sharePerWinner = (100 * this.potPercentage) / winners.length;

        return winners.map(w => ({
            userAddress: w.userAddress,
            payoutAmount: payoutPerWinner,
            sharePercentage: sharePerWinner
        }));
    }

    getEconomicsBreakdown(totalEntryFees: number) {
        return {
            pot: totalEntryFees * this.potPercentage,
            house: totalEntryFees * this.housePercentage,
            revShare: totalEntryFees * this.revSharePercentage,
            burn: totalEntryFees * this.burnPercentage
        };
    }
}
