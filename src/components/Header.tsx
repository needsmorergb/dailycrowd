'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b-2 border-solid border-primary px-10 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-4 text-primary">
                <div className="size-8 bg-primary text-neon-green flex items-center justify-center rounded-lg">
                    <span className="material-symbols-outlined text-2xl">query_stats</span>
                </div>
                <h2 className="text-primary text-xl font-black leading-tight tracking-tighter uppercase italic">CROWD Oracle</h2>
            </div>
            <div className="flex flex-1 justify-end gap-8 items-center">
                <div className="flex items-center gap-9">
                    <a className="text-primary text-sm font-bold leading-normal uppercase tracking-wider hover:text-neon-purple transition-colors" href="#">Terminal</a>
                    <a className="text-primary text-sm font-bold leading-normal uppercase tracking-wider hover:text-neon-purple transition-colors" href="#">Hall of Fame</a>
                    <a className="text-primary text-sm font-bold leading-normal uppercase tracking-wider hover:text-neon-purple transition-colors" href="#">Whitepaper</a>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
                        <span className="text-xs font-mono font-bold">$SOL: $142.65</span>
                    </div>
                    {/* Wallet Button Wrapper to match style */}
                    <div className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-lg h-10 bg-primary text-white text-sm font-bold leading-normal tracking-widest uppercase hover:bg-neon-green hover:text-primary transition-all duration-300 border-2 border-primary group">
                        <span className="truncate w-full h-full flex items-center justify-center">
                            <WalletMultiButton className="!bg-transparent !text-inherit !h-full !w-full !px-4 !py-0 !m-0 !text-sm !font-bold !uppercase !tracking-widest !rounded-none hover:!bg-transparent shadow-none" />
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
