export const TOKEN_SELECTION_CONFIG = {
    SNAPSHOT_BEFORE_START_SEC: 120, // 2 minutes
    N_CANDIDATES: 50,
    MIN_POOL_SIZE: 3,
    MAX_WAIT_FOR_TOKEN_SEC: 600, // 10 minutes

    // PRIMARY FILTERS (A-F)
    FILTERS: {
        MIN_LIQUIDITY_USD: 2000, // Reduced from 20k to catch fresh pumps
        MIN_MARKET_CAP_USD: 50000,
        MAX_MARKET_CAP_USD: 10000000,
        MIN_TRADES_15M: 30, // Relaxed from 60
        MIN_UNIQUE_TRADERS_15M: 10, // Relaxed from 25
        MIN_PRICE_CHANGE_15M_ABS_PCT: 2,
        MIN_HIGH_LOW_RANGE_15M_PCT: 4,
        MIN_AGE_MINUTES: 10,
        BONDING_CURVE_RANGE: [10, 95], // [min, max]
        EXCLUDE_LAST_ROUNDS: 12,
    },

    // FAILSAFE EXPANSION (One step)
    FAILSAFE: {
        MIN_LIQUIDITY_USD: 5000,
        MIN_TRADES_15M: 10,
        MIN_UNIQUE_TRADERS_15M: 5,
    },

    // SCORING WEIGHTS
    SCORE_WEIGHTS: {
        VOLUME_15M: 0.35,
        TRADES_15M: 0.25,
        UNIQUE_TRADERS_15M: 0.20,
        VOLATILITY_15M: 0.20,
    },

    TOP_K: 5,
    TEMP: 2.0, // Increased to 2.0 to ensure variety (XROLL killer)
};
