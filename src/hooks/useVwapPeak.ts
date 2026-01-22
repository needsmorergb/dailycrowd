import { useReducer, useEffect, useRef, useCallback } from 'react';
import { VwapTracker } from '../utils/vwap';

type State = {
    peakVwap: number;
    peakRoi: number;
};

type Action =
    | { type: 'RESET'; launchPrice: number }
    | { type: 'UPDATE'; peakVwap: number; peakRoi: number };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'RESET':
            return { peakVwap: 0, peakRoi: 0 };
        case 'UPDATE':
            return { peakVwap: action.peakVwap, peakRoi: action.peakRoi };
        default:
            return state;
    }
}

export function useVwapPeak(launchPrice: number, roundStartTime: number) {
    const [state, dispatch] = useReducer(reducer, { peakVwap: 0, peakRoi: 0 });
    const trackerRef = useRef<VwapTracker>(new VwapTracker(launchPrice));

    useEffect(() => {
        trackerRef.current.setLaunchPrice(launchPrice);
        trackerRef.current.reset();
        dispatch({ type: 'RESET', launchPrice });
    }, [launchPrice, roundStartTime]);

    const addTrade = useCallback((price: number, volume: number) => {
        trackerRef.current.addTrade(price, volume);
        const newPeak = trackerRef.current.updatePeak(roundStartTime, Date.now());
        dispatch({
            type: 'UPDATE',
            peakVwap: newPeak,
            peakRoi: trackerRef.current.getPeakRoi()
        });
    }, [roundStartTime]);

    return { peakVwap: state.peakVwap, peakRoi: state.peakRoi, addTrade };
}
