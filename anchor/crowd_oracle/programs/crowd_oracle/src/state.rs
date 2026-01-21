use anchor_lang::prelude::*;

#[account]
pub struct GlobalConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub fee_stakers_bps: u16,  // 5% = 500
    pub fee_burn_bps: u16,     // 5% = 500
    pub fee_house_bps: u16,    // 10% = 1000
    pub round_count: u64,
    pub bump: u8,
}

#[account]
pub struct Round {
    pub round_id: u64,
    pub target_token_mint: Pubkey,
    pub start_time: i64,
    pub lock_time: i64,
    pub resolve_time: i64,
    pub total_pot: u64,
    pub player_count: u32,
    pub peak_roi_multiplier_bps: u32, // bps (e.g., 1.5x = 15000)
    pub status: RoundStatus,
    pub winner_count: u32,
    pub announce_time: i64,
    pub min_players: u32,
    pub min_pot: u64,
    pub max_lobby_duration: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RoundStatus {
    Announced,
    Open,
    Locked,
    Resolved,
    Canceled,
}

#[account]
pub struct Entry {
    pub user: Pubkey,
    pub round_id: u64,
    pub predicted_roi_bps: u32,
    pub stake_amount: u64,
    pub is_holder: bool,
    pub distance_from_peak_bps: u32,
    pub claimed: bool,
    pub bump: u8,
}

impl GlobalConfig {
    pub const SIZE: usize = 8 + 32 + 32 + 2 + 2 + 2 + 8 + 1;
}

impl Round {
    pub const SIZE: usize = 8 + 8 + 32 + 8 + 8 + 8 + 8 + 4 + 4 + 1 + 4 + 8 + 4 + 8 + 8 + 1;
}

impl Entry {
    pub const SIZE: usize = 8 + 32 + 8 + 4 + 8 + 1 + 4 + 1 + 1;
}
