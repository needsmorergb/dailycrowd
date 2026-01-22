/**
 * VWAP-based Peak Measurement Logic
 * 
 * "Every 30 seconds of token life is measured as a single VWAP data point. 
 * The 'Peak ROI' is the highest 30s-VWAP achieved during the round."
 */

export interface Trade {
    price: number;
    volume: number;
    timestamp: number;
}

export interface VwapPoint {
    vwap: number;
    totalVolume: number;
    timestamp: number; // Start of the 30s bucket
}

export class VwapTracker {
    private trades: Trade[] = [];
    private windowSizeMs: number = 30000; // 30 seconds
    private peakVwap: number = 0;
    private launchPrice: number | null = null;

    constructor(launchPrice?: number) {
        if (launchPrice) this.launchPrice = launchPrice;
    }

    setLaunchPrice(price: number) {
        this.launchPrice = price;
    }

    addTrade(price: number, volume: number, timestamp: number = Date.now()) {
        this.trades.push({ price, volume, timestamp });
    }

    /**
     * Calculates VWAP for a specific time window
     */
    calculateVwap(startTime: number, endTime: number): number {
        const windowTrades = this.trades.filter(
            t => t.timestamp >= startTime && t.timestamp < endTime
        );

        if (windowTrades.length === 0) return 0;

        const sumPV = windowTrades.reduce((acc, t) => acc + t.price * t.volume, 0);
        const sumV = windowTrades.reduce((acc, t) => acc + t.volume, 0);

        return sumV === 0 ? 0 : sumPV / sumV;
    }

    /**
     * Processes trades into 30s buckets and updates the peak
     */
    updatePeak(roundStartTime: number, currentTime: number) {
        let currentBucketStart = roundStartTime;
        let localMaxVwap = 0;

        // Optimized: We could start from lastProcessedBucket, but since compute is light, 
        // we'll just ensure at least one full bucket is checked.
        while (currentBucketStart + this.windowSizeMs <= currentTime) {
            const bucketVwap = this.calculateVwap(
                currentBucketStart,
                currentBucketStart + this.windowSizeMs
            );

            if (bucketVwap > localMaxVwap) {
                localMaxVwap = bucketVwap;
            }

            currentBucketStart += this.windowSizeMs;
        }

        // Strictly monotonic update
        if (localMaxVwap > this.peakVwap) {
            this.peakVwap = localMaxVwap;
        }

        return this.peakVwap;
    }

    getPeakRoi(): number {
        if (!this.launchPrice) return 0;

        const highestInstantPrice = this.trades.length > 0
            ? Math.max(...this.trades.map(t => t.price))
            : 0;
        const highestInstantRoi = highestInstantPrice / this.launchPrice;
        const peakVwapRoi = this.peakVwap / this.launchPrice;

        return Math.max(peakVwapRoi, highestInstantRoi);
    }

    getPeakVwap(): number {
        return this.peakVwap;
    }

    reset() {
        this.trades = [];
        this.peakVwap = 0;
    }
}
