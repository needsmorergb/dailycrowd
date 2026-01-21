'use client';

import React, { useEffect, useState } from 'react';

export default function MaintenanceView() {
    const [progress, setProgress] = useState(0);

    // Simulate a loading sequence
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                // Random increments to feel like real loading
                const increment = Math.random() * 5;
                const next = prev + increment;
                if (next >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return next;
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center relative overflow-hidden font-display selection:bg-[#ccff00] selection:text-black">
            {/* Background Texture */}
            <div className="absolute inset-0 grid-bg opacity-[0.03] pointer-events-none"></div>

            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ccff00] opacity-[0.03] blur-[100px] rounded-full pointer-events-none animate-pulse"></div>

            <main className="z-10 flex flex-col items-center text-center max-w-2xl px-6 w-full">

                {/* Logo / Branding */}
                <div className="mb-12 relative group">
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase relative z-10 transition-transform duration-500 group-hover:scale-105">
                        Crowd<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#b026ff]">Oracle</span>
                    </h1>
                    {/* Glitch Shadow Effect */}
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase absolute top-1 left-1 text-white/5 z-0 select-none">
                        Crowd<br />Oracle
                    </h1>
                </div>

                {/* Loading Container */}
                <div className="w-full max-w-md flex flex-col gap-2 mb-8">
                    <div className="flex justify-between items-end px-1">
                        <span className="text-xs font-mono font-bold text-[#ccff00] uppercase tracking-widest animate-pulse">
                            System Initializing...
                        </span>
                        <span className="text-xs font-mono font-bold text-[#ccff00]/60">
                            {Math.floor(progress)}%
                        </span>
                    </div>

                    {/* Progress Bar Frame */}
                    <div className="h-2 w-full bg-[#ccff00]/10 rounded-full overflow-hidden border border-[#ccff00]/20 relative shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                        {/* Progress Fill */}
                        <div
                            className="h-full bg-[#ccff00] transition-all duration-300 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Shine effect on bar */}
                            <div className="absolute inset-0 bg-white/20"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                        </div>
                    </div>
                </div>

                {/* Subtext */}
                <p className="text-[#ccff00]/40 font-mono text-sm uppercase tracking-[0.2em] animate-pulse">
                    Coming Soon
                </p>

                {/* Footer decorations */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 opacity-20 text-[10px] font-mono uppercase">
                    <span>Protocol v0.1.0</span>
                    <span>Solana Mainnet</span>
                    <span>Secure Connection</span>
                </div>

            </main>
        </div>
    );
}
