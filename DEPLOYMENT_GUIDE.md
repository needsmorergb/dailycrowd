# Smart Contract Setup & Deployment Guide

## Step 0: Install Solana CLI (Required)

Since automated installation failed, you must install the Solana Tool Suite manually:

1.  **Download**: [solana-install-init.exe](https://release.solana.com/v1.18.18/solana-install-init-x86_64-pc-windows-msvc.exe)
2.  **Run**: Execute the downloaded file. It will install the Solana CLI to your system.
3.  **Restart**: Close and reopen your terminal to update your system PATH.

## Step 1: Generate Program Keypair

Run the following command to generate a new keypair for your smart contract. This keypair will determine your **Program ID**.

Run the following command to generate a new keypair for your smart contract. This keypair will determine your **Program ID**.

```bash
solana-keygen new -o anchor/crowd_oracle/target/deploy/crowd_oracle-keypair.json
```
*Note: If the directory `anchor/crowd_oracle/target/deploy/` does not exist, create it manually first.*

## Step 2: Get Your Program ID

Once generated, look at the output in your terminal. It will say "pubkey: <SOME_ADDRESS>".
Alternatively, run:
```bash
solana-keygen pubkey anchor/crowd_oracle/target/deploy/crowd_oracle-keypair.json
```
Copy this address. This is your **Program ID**.

## Step 3: Update `lib.rs`

Open `anchor/crowd_oracle/programs/crowd_oracle/src/lib.rs`.
Find the line:
```rust
declare_id!("CrowdOracle11111111111111111111111111111111");
```
Replace the placeholder with your new Program ID:
```rust
declare_id!("YOUR_NEW_PROGRAM_ID_HERE");
```

## Step 4: Update `Anchor.toml`

Open `Anchor.toml` in the root directory.
Update the `crowd_oracle` address for both `localnet` and `devnet`:

```toml
[programs.localnet]
crowd_oracle = "YOUR_NEW_PROGRAM_ID_HERE"

[programs.devnet]
crowd_oracle = "YOUR_NEW_PROGRAM_ID_HERE"
```

## Step 5: Build

Now you can build your program to verify everything matches:
```bash
anchor build
```

## Step 6: Deploy (Devnet)

Ensure you are on devnet and have some SOL:
```bash
solana config set --url devnet
solana airdrop 2
```

Deploy the program:
```bash
anchor deploy
```

## Step 7: Initialize

Once deployed, you need to initialize the global state (Treasury, Authority, etc.). You can do this via a script or the frontend if connected with the Authority wallet.
