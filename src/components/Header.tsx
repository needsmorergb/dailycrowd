'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
    return (
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-acid-green text-black flex items-center justify-center font-black italic text-xl border-r-4 border-b-4 border-neon-purple">C</div>
                <h1 className="text-xl font-bold tracking-tighter uppercase italic text-white flex items-center gap-2">
                    CROWD <span className="text-acid-green">Oracle</span>
                </h1>
            </div>
            <div className="flex flex-col items-center">
                <div className="text-[10px] text-acid-green uppercase tracking-[0.4em] mb-1 font-bold">Window Closing</div>
                <div className="flex gap-2 digital-timer font-black text-2xl text-white">
                    <span className="bg-white/5 px-2 py-1 border border-white/20">00</span>
                    <span className="text-neon-purple animate-pulse">:</span>
                    <span className="bg-white/5 px-2 py-1 border border-white/20">14</span>
                    <span className="text-neon-purple animate-pulse">:</span>
                    <span className="bg-white/5 px-2 py-1 border border-white/20">52</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-4 text-xs font-bold uppercase text-white/60">
                    <a className="hover:text-acid-green transition-colors" href="#">Terminal</a>
                    <a className="hover:text-acid-green transition-colors" href="#">Stats</a>
                </div>
                {/* Wallet Button Wrapper matches HTML button style */}
                <div className="relative">
                    <div className="px-6 py-2 bg-acid-green text-black text-xs font-black uppercase italic hover:bg-white transition-all neon-border-green cursor-pointer">
                        <WalletMultiButton className="!bg-transparent !text-black !h-full !w-full !p-0 !text-xs !font-black !uppercase !italic !shadow-none hover:!bg-transparent" style={{ lineHeight: '1' }} />
                    </div>
                </div>
            </div>
        </header>
    );
}
