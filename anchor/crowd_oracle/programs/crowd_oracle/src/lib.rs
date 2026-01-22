use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program::invoke;

pub mod errors;
pub mod state;

use crate::errors::OracleError;
use crate::state::*;

declare_id!("8SPRdNaAnWjPGGP91uRsVcBEkzxvizDjFUVdWkoCZceq");

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
        min_players: u32,
        min_pot: u64,
        max_lobby_duration: i64,
    ) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let clock = Clock::get()?;

        round.round_id = round_id;
        round.target_token_mint = target_token_mint;
        round.announce_time = clock.unix_timestamp;
        // Start time will be set upon activation
        round.start_time = 0; 
        // Lock/Resolve times are relative to Duration, but we store the planned offsets for now
        // We will recalculate exact absolute times upon activation.
        // For now, store duration in lock_time temporarily or just use 0?
        // Let's store the durations relative to start in the client or recalculate.
        // Actually, easiest is to store the "planned duration" and "lock offset" in new fields, 
        // OR just reuse the fields knowing they need update.
        // Let's interpret 'resolve_time' as 'duration_sec' and 'lock_time' as 'lock_before_end_sec' 
        // purely during the Announced phase to save space, OR strictly use 0.
        // Better: Set them to 0 and pass them as args again? No, we need to persist them.
        // Ideally we'd add fields 'duration' and 'lock_offset' to the struct, but to save space/time:
        // We will store the intended duration in 'resolve_time' and lock offset in 'lock_time' 
        // ONLY while status == Announced.
        round.resolve_time = duration_sec; // Storing duration here temporarily
        round.lock_time = lock_before_end_sec; // Storing offset here temporarily

        round.min_players = min_players;
        round.min_pot = min_pot;
        round.max_lobby_duration = max_lobby_duration;
        
        round.total_pot = 0;
        round.player_count = 0;
        round.status = RoundStatus::Announced;
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

        // 1. Check State
        if round.status == RoundStatus::Canceled {
            return err!(OracleError::RoundCanceled);
        }
        if round.status == RoundStatus::Resolved {
            return err!(OracleError::RoundResolved);
        }
        if round.status == RoundStatus::Locked {
            return err!(OracleError::RoundClosed);
        }

        // 2. Handle Announced State (Activation Check)
        if round.status == RoundStatus::Announced {
            // Check expiry
            if clock.unix_timestamp > round.announce_time + round.max_lobby_duration {
                // Should be canceled. Reject entry. User should call cancel_round.
                return err!(OracleError::RoundLobbyExpired);
            }

            // Calculations for potential activation
            // We verify AFTER adding this user if we trigger.
            // But we can also check if THIS user is the catalyst.
        } else {
            // If already Open, check lock time
            if clock.unix_timestamp >= round.lock_time {
                return err!(OracleError::RoundClosed);
            }
        }

        require!(predicted_roi_bps > 0 && predicted_roi_bps <= 1000000, OracleError::InvalidPredictionRange);

        // 3. Transfer Stake
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

        // 4. Record Entry
        let entry = &mut ctx.accounts.entry;
        entry.user = ctx.accounts.user.key();
        entry.round_id = round_id;
        entry.predicted_roi_bps = predicted_roi_bps;
        entry.stake_amount = stake_amount;
        entry.is_holder = is_holder;
        entry.claimed = false;
        entry.bump = ctx.bumps.entry;

        round.total_pot = round.total_pot.checked_add(stake_amount).ok_or(OracleError::Overflow)?;
        round.player_count = round.player_count.checked_add(1).ok_or(OracleError::Overflow)?;

        // 5. Activation Trigger Logic
        if round.status == RoundStatus::Announced {
            // Check if thresholds met
            let threshold_met = round.total_pot >= round.min_pot || round.player_count >= round.min_players;
            
            if threshold_met {
                // ACTIVATE ROUND
                round.status = RoundStatus::Open;
                round.start_time = clock.unix_timestamp;
                
                // Retrieve stored duration config from temp fields
                let duration_sec = round.resolve_time;
                let lock_offset_sec = round.lock_time;

                // Set actual absolute timestamps
                round.resolve_time = round.start_time + duration_sec;
                round.lock_time = round.resolve_time - lock_offset_sec; // Lock is relative to end usually, or start + (duration - offset)
            }
        }

        Ok(())
    }

    pub fn cancel_round(
        ctx: Context<CancelRound>,
    ) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let clock = Clock::get()?;

        // Can only cancel if Announced
        require!(round.status == RoundStatus::Announced, OracleError::RoundNotAnnounced);

        // Check if expired
        require!(clock.unix_timestamp > round.announce_time + round.max_lobby_duration, OracleError::RoundNotExpired);

        round.status = RoundStatus::Canceled;
        
        Ok(())
    }

    pub fn refund_entry(
        ctx: Context<RefundEntry>,
    ) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let entry = &mut ctx.accounts.entry;

        require!(round.status == RoundStatus::Canceled, OracleError::RoundNotCanceled);
        require!(!entry.claimed, OracleError::RewardAlreadyClaimed);
        require!(entry.user == ctx.accounts.user.key(), OracleError::Unauthorized);

        let refund_amount = entry.stake_amount;
        entry.claimed = true; // Mark as "claimed" (refunded) so they can't drain

        // Transfer refund
        let round_id_bytes = round.round_id.to_le_bytes();
        
        **round.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += refund_amount;

        Ok(())
    }

    pub fn resolve_round(
        ctx: Context<ResolveRound>,
        peak_roi_multiplier_bps: u32,
    ) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let clock = Clock::get()?;

        // If it never activated (Announced) and is expired, it should be canceled, not resolved.
        // But if manual resolve is called, we enforce Open status check mostly.
        
        require!(round.status == RoundStatus::Open || round.status == RoundStatus::Locked, OracleError::RoundNotOpen);
        require!(clock.unix_timestamp >= round.resolve_time, OracleError::RoundNotEnded);
        require!(round.status != RoundStatus::Resolved, OracleError::RoundResolved);

        round.peak_roi_multiplier_bps = peak_roi_multiplier_bps;
        round.status = RoundStatus::Resolved;

        Ok(())
    }

    pub fn claim_reward(
        ctx: Context<ClaimReward>,
        accuracy_percentile_bps: u32, 
    ) -> Result<()> {
        let round = &ctx.accounts.round;
        let entry = &mut ctx.accounts.entry;

        require!(round.status == RoundStatus::Resolved, OracleError::RoundNotEnded);
        require!(!entry.claimed, OracleError::RewardAlreadyClaimed);

        if accuracy_percentile_bps <= 1000 { // Top 10%
            let total_winners_pool = (round.total_pot as u128)
                .checked_mul(8000).unwrap()
                .checked_div(10000).unwrap() as u64;

            let reward = total_winners_pool / 10; // Mock share
            entry.claimed = true;

            let round_id_bytes = round.round_id.to_le_bytes();

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

#[derive(Accounts)]
pub struct CancelRound<'info> {
    #[account(mut, seeds = [b"round", round.round_id.to_le_bytes().as_ref()], bump = round.bump)]
    pub round: Account<'info, Round>,
}

#[derive(Accounts)]
pub struct RefundEntry<'info> {
    #[account(mut, seeds = [b"round", round.round_id.to_le_bytes().as_ref()], bump = round.bump)]
    pub round: Account<'info, Round>,
    #[account(mut, seeds = [b"entry", round.round_id.to_le_bytes().as_ref(), user.key().as_ref()], bump = entry.bump)]
    pub entry: Account<'info, Entry>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
