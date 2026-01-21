import { useState, useEffect, useRef } from 'react';
import { VwapTracker, Trade } from '../utils/vwap';

export function useVwapPeak(launchPrice: number, roundStartTime: number) {
    const [peakVwap, setPeakVwap] = useState(0);
    const [peakRoi, setPeakRoi] = useState(0);
    const trackerRef = useRef<VwapTracker>(new VwapTracker(launchPrice));

    useEffect(() => {
        trackerRef.current.setLaunchPrice(launchPrice);
        trackerRef.current.reset();
        setPeakVwap(0);
        setPeakRoi(0);
    }, [launchPrice, roundStartTime]);

    const addTrade = (price: number, volume: number) => {
        trackerRef.current.addTrade(price, volume);
        const newPeak = trackerRef.current.updatePeak(roundStartTime, Date.now());
        setPeakVwap(newPeak);
        setPeakRoi(trackerRef.current.getPeakRoi());
    };

    return { peakVwap, peakRoi, addTrade };
}
