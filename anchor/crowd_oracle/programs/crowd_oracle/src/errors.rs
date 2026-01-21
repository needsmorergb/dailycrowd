use anchor_lang::prelude::*;

#[error_code]
pub enum OracleError {
    #[msg("Round is not yet open for entries.")]
    RoundNotOpen,
    #[msg("Round has already closed.")]
    RoundClosed,
    #[msg("Round is already resolved.")]
    RoundResolved,
    #[msg("Prediction ROI must be between 0 and 1000.")]
    InvalidPredictionRange,
    #[msg("Stake amount is below the required minimum.")]
    BelowMinimumStake,
    #[msg("Unauthorized authority for this instruction.")]
    Unauthorized,
    #[msg("The round has not ended yet.")]
    RoundNotEnded,
    #[msg("Reward has already been claimed.")]
    RewardAlreadyClaimed,
    #[msg("Mathematical overflow.")]
    Overflow,
    #[msg("Arithmetic error.")]
    MathError,
}
