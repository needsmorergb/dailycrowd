'use client';

export default function TargetTokenCard() {
    return (
        <div className="glass-card neon-border rounded-2xl p-6 mb-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                {/* Token Icon */}
                <div className="shrink-0 relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/20 rounded-2xl flex items-center justify-center text-4xl shadow-lg border border-primary/30">
                        🐸
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-black text-primary text-[10px] font-bold px-2 py-1 rounded inline-block border border-primary/30 uppercase tracking-widest">
                        Bonding
                    </div>
                </div>

                {/* Token Info */}
                <div className="flex-grow text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="text-primary mr-2">●</span>
                            Round 2 of 3 (Asia)
                        </span>
                        <div className="w-px h-3 bg-white/20 mx-2"></div>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Target of the Round</span>
                    </div>

                    <h2 className="text-3xl font-black text-white mb-1">PEPE 3.0 <span className="text-lg text-muted-foreground font-normal ml-2">$PEPE3</span></h2>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-muted-foreground font-mono mt-2">
                        <div className="bg-muted px-3 py-1 rounded-md border border-white/5 flex items-center gap-2">
                            <span>MINT:</span>
                            <span className="text-primary truncate max-w-[100px]">8xP...9jL</span>
                            <span className="cursor-pointer hover:text-white transition-colors">📋</span>
                        </div>
                        <div className="bg-muted px-3 py-1 rounded-md border border-white/5">
                            DEV: <span className="text-white">Active</span>
                        </div>
                        <div className="bg-muted px-3 py-1 rounded-md border border-white/5">
                            MCAP: <span className="text-white">$12.4k</span>
                        </div>
                    </div>
                </div>

                {/* Live Timer */}
                <div className="shrink-0 text-center">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Prediction Window</div>
                    <div className="text-2xl font-mono font-bold text-white tabular-nums">
                        00:45:12
                    </div>
                </div>
            </div>
        </div>
    );
}
