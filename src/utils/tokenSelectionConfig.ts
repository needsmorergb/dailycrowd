export const TOKEN_SELECTION_CONFIG = {
    SNAPSHOT_BEFORE_START_SEC: 120, // 2 minutes
    N_CANDIDATES: 50,
    MIN_POOL_SIZE: 5,

    FILTERS: {
        MIN_AGE_MINUTES: 5,
        MAX_AGE_HOURS: 6,
        MIN_VOL_5M_SOL: 10,
        MIN_TRADES_5M: 50,
        MIN_UNIQUE_TRADERS_5M: 25,
        EXCLUDE_LAST_ROUNDS: 12,
    },

    SCORE_WEIGHTS: {
        VOL_5M: 0.35,
        UNIQ_5M: 0.25,
        TRADES_5M: 0.20,
        VOL_ACCEL: 0.15,
        VOLATILITY_5M: 0.05,
    },

    TEMP: 0.35,
    MAX_WEIGHT_SHARE: 0.35,
    VOL_CAP: 2.0, // ROI cap for volatility metric normalization
};
