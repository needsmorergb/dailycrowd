use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program::invoke;

pub mod errors;
pub mod state;

use crate::errors::OracleError;
use crate::state::*;

declare_id!("CrowdOracle11111111111111111111111111111111");

#[program]
pub mod crowd_oracle {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        fee_stakers_bps: u16,
        fee_burn_bps: u16,
        fee_house_bps: u16,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.treasury = ctx.accounts.treasury.key();
        config.fee_stakers_bps = fee_stakers_bps;
        config.fee_burn_bps = fee_burn_bps;
        config.fee_house_bps = fee_house_bps;
        config.round_count = 0;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn create_round(
        ctx: Context<CreateRound>,
        round_id: u64,
        target_token_mint: Pubkey,
        duration_sec: i64,
        lock_before_end_sec: i64,
    ) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let clock = Clock::get()?;

        round.round_id = round_id;
        round.target_token_mint = target_token_mint;
        round.start_time = clock.unix_timestamp;
        round.lock_time = clock.unix_timestamp + duration_sec - lock_before_end_sec;
        round.resolve_time = clock.unix_timestamp + duration_sec;
        round.total_pot = 0;
        round.status = RoundStatus::Open;
        round.peak_roi_multiplier_bps = 0;
        round.winner_count = 0;
        round.bump = ctx.bumps.round;

        let config = &mut ctx.accounts.config;
        config.round_count = config.round_count.checked_add(1).ok_or(OracleError::Overflow)?;

        Ok(())
    }

    pub fn submit_entry(
        ctx: Context<SubmitEntry>,
        round_id: u64,
        predicted_roi_bps: u32,
        stake_amount: u64,
        is_holder: bool,
    ) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let clock = Clock::get()?;

        // Validations
        require!(round.status == RoundStatus::Open, OracleError::RoundNotOpen);
        require!(clock.unix_timestamp < round.lock_time, OracleError::RoundClosed);
        require!(predicted_roi_bps > 0 && predicted_roi_bps <= 1000000, OracleError::InvalidPredictionRange); // cap at 100x

        // Transfer SOL Stake
        let transfer_ix = system_instruction::transfer(
            &ctx.accounts.user.key(),
            &round.key(),
            stake_amount,
        );
        invoke(
            &transfer_ix,
            &[
                ctx.accounts.user.to_account_info(),
                round.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Record Entry
        let entry = &mut ctx.accounts.entry;
        entry.user = ctx.accounts.user.key();
        entry.round_id = round_id;
        entry.predicted_roi_bps = predicted_roi_bps;
        entry.stake_amount = stake_amount;
        entry.is_holder = is_holder;
        entry.claimed = false;
        entry.bump = ctx.bumps.entry;

        round.total_pot = round.total_pot.checked_add(stake_amount).ok_or(OracleError::Overflow)?;

        Ok(())
    }

    pub fn resolve_round(
        ctx: Context<ResolveRound>,
        peak_roi_multiplier_bps: u32,
    ) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp >= round.resolve_time, OracleError::RoundNotEnded);
        require!(round.status != RoundStatus::Resolved, OracleError::RoundResolved);

        round.peak_roi_multiplier_bps = peak_roi_multiplier_bps;
        round.status = RoundStatus::Resolved;

        // Note: In production, actual winner selection and share calculation 
        // would occur here or in a separate Crank instruction due to compute limits.
        
        Ok(())
    }

    pub fn claim_reward(
        ctx: Context<ClaimReward>,
        accuracy_percentile_bps: u32, // Passed by Oracle authority after off-chain sort
    ) -> Result<()> {
        let round = &ctx.accounts.round;
        let entry = &mut ctx.accounts.entry;
        let config = &ctx.accounts.config;

        require!(round.status == RoundStatus::Resolved, OracleError::RoundNotEnded);
        require!(!entry.claimed, OracleError::RewardAlreadyClaimed);

        // Simple accuracy-based payout logic (80% of pot shared among winners)
        // Production would use a more complex distance-based weight
        if accuracy_percentile_bps <= 1000 { // Top 10%
            let total_winners_pool = (round.total_pot as u128)
                .checked_mul(8000).unwrap()
                .checked_div(10000).unwrap() as u64;

            // Simplified share calculation: (Stake / Winner_Count) * Multiplier
            // For production, we'd sum all winning stakes and divide proportionally
            let reward = total_winners_pool / 10; // Mock share calculation

            entry.claimed = true;

            // Transfer reward from round PDA back to user
            let round_seeds = &[
                b"round",
                &round.round_id.to_le_bytes(),
                &[round.bump],
            ];
            let signer_seeds = &[&round_seeds[..]];

            **round.to_account_info().try_borrow_mut_lamports()? -= reward;
            **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += reward;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = authority, 
        space = GlobalConfig::SIZE, 
        seeds = [b"config"], 
        bump
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Treasury wallet for fees
    pub treasury: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(round_id: u64)]
pub struct CreateRound<'info> {
    #[account(
        init,
        payer = authority,
        space = Round::SIZE,
        seeds = [b"round", round_id.to_le_bytes().as_ref()],
        bump
    )]
    pub round: Account<'info, Round>,
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut, constraint = authority.key() == config.authority @ OracleError::Unauthorized)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(round_id: u64)]
pub struct SubmitEntry<'info> {
    #[account(mut, seeds = [b"round", round_id.to_le_bytes().as_ref()], bump = round.bump)]
    pub round: Account<'info, Round>,
    #[account(
        init,
        payer = user,
        space = Entry::SIZE,
        seeds = [b"entry", round_id.to_le_bytes().as_ref(), user.key().as_ref()],
        bump
    )]
    pub entry: Account<'info, Entry>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveRound<'info> {
    #[account(mut, seeds = [b"round", round.round_id.to_le_bytes().as_ref()], bump = round.bump)]
    pub round: Account<'info, Round>,
    #[account(constraint = authority.key() == config.authority @ OracleError::Unauthorized)]
    pub authority: Signer<'info>,
    pub config: Account<'info, GlobalConfig>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut, seeds = [b"round", round.round_id.to_le_bytes().as_ref()], bump = round.bump)]
    pub round: Account<'info, Round>,
    #[account(mut, seeds = [b"entry", round.round_id.to_le_bytes().as_ref(), user.key().as_ref()], bump = entry.bump)]
    pub entry: Account<'info, Entry>,
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
