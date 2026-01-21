# CROWD Oracle 🟣🏛️

**The High-Accuracy Intelligence Layer for Solana.**

CROWD Oracle is a decentralized prediction protocol designed to measure and reward collective accuracy. Unlike traditional prediction markets, CROWD uses a shared-pool payout model weighted by accuracy distance and conviction, ensuring that skill—rather than just capital—determines success.

## 🏹 Protocol Philosophy: The Skill-First Mandate
CROWD is built on the principle of **Meritocratic Payouts**. 
- **Accuracy First**: Your payout is determined by how close your prediction is to the actual 30s VWAP peak. 
- **conviction Scaling**: Your entry size (SOL) scales your share of the pot *only after* your accuracy qualifies you as a winner.
- **Shared Pools**: Transparent 80/10/5/5 fee distribution (Winners / Maintenance / RevShare / Burn).

## 🚀 Key Features

### 🏛️ Oracle Terminal
A high-performance "Protocol Console" for rapid analysis and prediction.
- **VWAP Peak Detection**: Rolling 30s measurement to prevent single-price manipulation.
- **3-Layer Architecture**: Distinct visual separation between Market Reality, Prediction Zone, and Consensus Stats.
- **Round-Type Escalation**: Visual gravity shifts for **Rapid**, **Featured**, and **Daily Anchor** rounds.

### 🟣 Holder Benefits (Non-P2W)
Holding $CROWD provides information and status without altering game probability:
- **Holders View**: Advanced crowd distribution insights and bias trends.
- **Early Reveal**: 60s head start on target token identification.
- **Tie-Break Priority**: Status-based priority for identical accuracy scores.
- **Digital Identity**: Exclusive badges and reputational stats on the global leaderboard.

### 🛡️ Trust & Transparency
- **Deterministic Outcomes**: Calculation logic based on on-chain price data.
- **P2W Guardrails**: Explicitly no accuracy boosts or automation for holders.
- **Real-Time Burn**: Every round contributes to the $CROWD deflationary pressure.

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (Turbopack)
- **State Management**: React Hooks + Solana Wallet Adapter
- **Styling**: Vanilla Tailwind CSS (Neo-Brutalist / Protocol aesthetic)
- **Time Logic**: Zoned date-time for global 5:00 PM PST Anchor rounds.

## 🏁 Getting Started

1.  **Clone**: `git clone https://github.com/needsmorergb/dailycrowd.git`
2.  **Install**: `npm install`
3.  **Env**: Set up `.env` (see `.env.example`)
4.  **Dev**: `npm run dev`
5.  **Build**: `npm run build`

---
*CROWD Oracle: Reward the accurate, burn the rest.*

