import { useState, useCallback, useMemo } from 'react';
import { PayoutEngine, Prediction, PayoutResult } from '../utils/payout';

export function usePayoutSimulation() {
    const [lastPayouts, setLastPayouts] = useState<PayoutResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const engine = useMemo(() => new PayoutEngine(), []);

    const simulatePayout = useCallback((totalPot: number, actualPeakRoi: number, currentPredictions: Prediction[]) => {
        setIsProcessing(true);

        // Simulate network delay
        setTimeout(() => {
            const results = engine.calculatePayouts(totalPot, actualPeakRoi, currentPredictions);
            setLastPayouts(results);
            setIsProcessing(false);
        }, 2000);
    }, [engine]);

    return { lastPayouts, isProcessing, simulatePayout };
}
