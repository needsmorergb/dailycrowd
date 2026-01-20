'use client'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b-2 border-primary bg-white/90 backdrop-blur-md px-6 py-4">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-4 text-primary">
                    <div className="size-10 bg-primary text-neon-green flex items-center justify-center rounded-lg border-2 border-primary shadow-[4px_4px_0px_0px_rgba(204,255,0,0.5)]">
                        <span className="material-symbols-outlined text-2xl font-black">query_stats</span>
                    </div>
                    <h2 className="text-xl font-black leading-tight tracking-tighter uppercase italic">
                        CROWD <span className="text-primary/40 not-italic">|</span> Oracle
                    </h2>
                </div>

                {/* Nav & Wallet */}
                <div className="flex items-center gap-8">
                    <nav className="hidden md:flex items-center gap-8">
                        {['Terminal', 'Hall of Fame', 'Rules'].map((item) => (
                            <a key={item} href="#" className="text-sm font-bold uppercase tracking-wider hover:text-neon-purple hover:underline decoration-2 underline-offset-4 transition-all">
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        {/* SOL Price Ticker */}
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
                            <span className="text-xs font-mono font-bold">$SOL: $142.65</span>
                        </div>

                        <WalletMultiButton className="!bg-primary !text-white !font-bold !uppercase !tracking-widest !rounded-lg !h-10 !px-6 hover:!bg-primary/90 hover:!translate-x-0.5 hover:!translate-y-0.5 hover:!shadow-none transition-all shadow-[4px_4px_0px_0px_#ccff00] border-2 border-primary" />
                    </div>
                </div>
            </div>
        </header>
    )
}
