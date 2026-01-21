import { useState, useCallback } from 'react';
import { RewardBonusManager } from '../utils/bonuses';

export function useHouseBonuses() {
    const [activeBonus, setActiveBonus] = useState<{ bonus: number; label: string; isActive: boolean } | null>(null);
    const manager = new RewardBonusManager(2.5); // Initializing with mock reward pool for demo (2.5 SOL)

    const updateBonus = useCallback((roundType: 'RAPID' | 'FEATURED' | 'ANCHOR') => {
        const result = manager.calculateInjection(roundType);
        if (result.isActive) {
            setActiveBonus({ bonus: result.injection, label: result.label, isActive: true });
        } else {
            setActiveBonus({ bonus: 0, label: result.label || 'No bonus active for this round', isActive: false });
        }
    }, []);

    return { activeBonus, updateBonus };
}
