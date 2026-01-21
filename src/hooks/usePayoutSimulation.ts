import { useState, useCallback } from 'react';
import { PayoutEngine, Prediction, PayoutResult } from '../utils/payout';

export function usePayoutSimulation() {
    const [lastPayouts, setLastPayouts] = useState<PayoutResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const engine = new PayoutEngine();

    const simulatePayout = useCallback((totalPot: number, actualPeakRoi: number, currentPredictions: Prediction[]) => {
        setIsProcessing(true);

        // Simulate network delay
        setTimeout(() => {
            const results = engine.calculatePayouts(totalPot, actualPeakRoi, currentPredictions);
            setLastPayouts(results);
            setIsProcessing(false);
        }, 2000);
    }, []);

    return { lastPayouts, isProcessing, simulatePayout };
}
