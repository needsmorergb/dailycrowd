'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
    const { publicKey } = useWallet();

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-muted">
            <div className="container max-w-6xl flex items-center justify-between py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">C</span>
                    </div>
                    <div>
                        <span className="font-bold text-lg block leading-none">CROWD</span>
                        <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Oracle</span>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-6">
                    <Link href="/rules" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                        Rules
                    </Link>
                    <Link href="/results" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                        Results
                    </Link>

                    {/* Solana Wallet Button */}
                    <div className="flex items-center gap-4">
                        <WalletMultiButton className="!bg-primary !text-primary-foreground !h-10 !px-6 !rounded-xl !text-sm !font-bold transition-all hover:!scale-105" />
                    </div>
                </nav>
            </div>
        </header>
    );
}
