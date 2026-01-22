import React from 'react';

const Docs = () => {
    const sections = [
        {
            id: "what-is-crowd",
            title: "1. What Is CROWD Oracle?",
            content: (
                <>
                    <p className="mb-4">CROWD Oracle is a competitive game where players predict how intense market hype will get — not which direction price moves.</p>
                    <div className="p-4 bg-primary text-neon-green rounded-lg italic font-bold border-2 border-primary shadow-[4px_4px_0px_0px_rgba(204,255,0,1)]">
                        &quot;You are not trading. You are forecasting collective behavior.&quot;
                    </div>
                </>
            )
        },
        {
            id: "how-rounds-work",
            title: "2. How Rounds Work",
            content: (
                <div className="space-y-4">
                    <ul className="list-disc list-inside space-y-2 text-primary/80">
                        <li><span className="font-bold text-primary">Rapid Rounds</span>: Every 30 minutes. <span className="text-neon-purple font-black">0.03 SOL MIN</span>.</li>
                        <li><span className="font-bold text-primary">Featured Rounds</span>: Every few hours. <span className="text-neon-purple font-black">0.05 SOL MIN</span>.</li>
                        <li><span className="font-bold text-primary">Daily Anchor</span>: 5 PM PST. High-stakes consensus. <span className="text-neon-purple font-black">0.06 SOL MIN</span>.</li>
                    </ul>
                    <div className="flex flex-wrap sm:grid sm:grid-cols-5 gap-2 text-center text-[10px] font-black uppercase tracking-tighter">
                        <div className="flex-1 min-w-[50px] p-2 border border-primary/20 bg-primary/5 rounded">Entry</div>
                        <div className="flex-1 min-w-[50px] p-2 border border-primary/20 bg-primary/5 rounded">Prediction</div>
                        <div className="flex-1 min-w-[50px] p-2 border border-primary/20 bg-primary/5 rounded">Lock</div>
                        <div className="flex-1 min-w-[50px] p-2 border border-primary/20 bg-primary/5 rounded">Live</div>
                        <div className="flex-1 min-w-[50px] p-2 border border-primary/20 bg-primary/5 rounded">Resolution</div>
                    </div>
                </div>
            )
        },
        {
            id: "vwap-measurement",
            title: "3. How the Peak Is Measured",
            content: (
                <>
                    <p className="mb-4">We use <span className="font-bold underline decoration-neon-purple underline-offset-4">30-second Volume Weighted Average Price (VWAP)</span> to determine the round peak.</p>
                    <p className="text-sm text-primary/60 border-l-4 border-neon-purple pl-4">
                        By using average prices rather than single spikes (wicks), we ensure a fair result that cannot be decided by a single erratic trade.
                    </p>
                </>
            )
        },
        {
            id: "how-winners-chosen",
            title: "4. How Winners Are Chosen",
            content: (
                <div className="space-y-4">
                    <p>The prize pot is split between the predictions closest to the actual 30s VWAP peak. We use a tie-banding system to ensure multiple accurate forecasters are rewarded fairly.</p>
                    <div className="p-3 bg-neon-green/10 border-2 border-neon-green rounded-lg font-bold text-xs">
                        ⚠️ IMPORTANT: Entry size never improves your win probability. Accuracy is the only factor for winning.
                    </div>
                </div>
            )
        },
        {
            id: "entry-size",
            title: "5. What Entry Size Means",
            content: (
                <p>Entry size is an expression of <span className="font-black italic text-neon-purple">Confidence</span>. While accuracy determines IF you win, your entry size scales HOW MUCH you win. Think of it as scaling your rewards based on your conviction.</p>
            )
        },
        {
            id: "token-selection",
            title: "6. How Tokens Are Chosen",
            content: (
                <>
                    <p className="mb-4">Tokens are selected via an automated, deterministic pool system from Pump.fun trending data.</p>
                    <div className="flex gap-4 items-center mb-4">
                        <div className="bg-primary text-white p-2 rounded rotate-[-2deg] text-[10px] font-black">PULL</div>
                        <div className="bg-primary text-white p-2 rounded rotate-[1deg] text-[10px] font-black">FILTER</div>
                        <div className="bg-primary text-white p-2 rounded rotate-[-1deg] text-[10px] font-black">SCORE</div>
                        <div className="bg-primary text-white p-2 rounded rotate-[2deg] text-[10px] font-black">LOCK</div>
                    </div>
                    <p className="text-sm text-primary/60">Tokens are locked 2 minutes before the round starts. Once locked, they cannot be changed.</p>
                </>
            )
        },
        {
            id: "crowd-token",
            title: "7. $CROWD Token",
            content: (
                <div className="space-y-4">
                    <p>The official CROWD token is live on Solana.</p>
                    <div className="p-4 bg-neon-green/10 border-2 border-neon-green rounded-lg">
                        <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-2">Contract Address</p>
                        <p className="font-mono text-xs break-all text-primary mb-3">65uNmB4h4a3CVCaoAWwhhLNPfJLQNdq2c7cJPgXFpump</p>
                        <a
                            href="https://pump.fun/coin/65uNmB4h4a3CVCaoAWwhhLNPfJLQNdq2c7cJPgXFpump"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs py-2 px-4 rounded transition-colors"
                        >
                            View on Pump.fun →
                        </a>
                    </div>
                </div>
            )
        },
        {
            id: "soft-start",
            title: "8. Soft-Start & Refunds",
            content: (
                <div className="space-y-4">
                    <p>Parameters to protect game integrity and prevent empty rounds:</p>
                    <ul className="list-disc list-inside space-y-2 text-primary/80">
                        <li><span className="font-bold text-primary">Lobby Phase</span>: All rounds start in a waiting state.</li>
                        <li><span className="font-bold text-primary">Activation Threshold</span>: Round goes live with <span className="text-neon-purple font-black">15 Players</span> OR <span className="text-neon-purple font-black">0.45 SOL Pot</span>.</li>
                        <li><span className="font-bold text-primary">Auto-Refund</span>: If thresholds aren't met in 15m, the round cancels and 100% of SOL is refunded.</li>
                    </ul>
                </div>
            )
        }
    ];

    return (
        <section id="docs" className="py-20 px-10 border-t-4 border-primary bg-[#fafafa]">
            <div className="max-w-4xl mx-auto">
                <div className="mb-16">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Product Manual</h2>
                    <p className="text-primary/40 font-bold uppercase tracking-[0.2em] text-xs">Technical documentation & game mechanics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {sections.map((section, i) => (
                        <div key={i} className="space-y-4 flex flex-col">
                            <h3 className="text-xl font-black uppercase tracking-tight text-primary border-b-2 border-primary pb-2">
                                {section.title}
                            </h3>
                            <div className="text-base leading-relaxed text-primary/80">
                                {section.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Docs;
