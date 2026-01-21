import React from 'react';

const Whitepaper = () => {
    const sections = [
        {
            title: "Problem Statement",
            content: "Traditional trading tools are designed for price movement, yet retail participation is increasingly driven by social sentiment and 'hype' cycles. Most participants fail not because they lack intuition, but because they lack the tools to express that intuition without catastrophic leverage or execution risk."
        },
        {
            title: "The Thesis",
            content: "CROWD Oracle treats markets as social systems, not just price systems. We believe that forecasting the intensity of a crowd's interest (Hype-Intensity) is a distinct skill-set from forecasting price direction. Our protocol isolates this variable, allowing players to compete solely on their ability to read the social 'Peak'."
        },
        {
            title: "Game Design & Ethics",
            content: "By moving from 'Directional Betting' to 'Accuracy Forecasting,' we remove the toxicity of liquidation and replace it with the meritocracy of skill. Accuracy is the absolute north star of the ecosystem."
        },
        {
            title: "Fairness & Integrity",
            content: "Economic integrity is enforced through deterministic token selection and VWAP-based resolution. By removing single-trade wicks from the results, the Oracle prevents manipulation by large actors within the round window."
        },
        {
            title: "Round Viability & Soft-Start",
            content: "We respect your time and capital. Rounds do not \"start empty.\" Every round begins in a Lobby State and only activates once a liquidity or player threshold is met. If the crowd doesn't arrive, the round is canceled and 100% of funds are instantly refunded. No dead rounds, ever."
        },
        {
            title: "Meritocratic Payouts",
            content: "Payouts are determined exclusively by relative accuracy. Successful participants receive a skill-based share of the pot. Because the prize pool is shared among all qualifying winners within the target accuracy band, final rewards are dynamic and strictly merit-dependent. Entry size scales the reward but never improves the probability of winning."
        }
    ];

    return (
        <section id="whitepaper" className="py-24 px-4 sm:px-10 border-t-4 border-primary bg-black text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="px-3 py-1 bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest rounded mb-6">Strategic Paper</div>
                    <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter mb-4">Whitepaper</h2>
                    <div className="w-24 h-1 bg-neon-purple rounded-full"></div>
                </div>

                <div className="space-y-16">
                    {sections.map((section, i) => (
                        <div key={i} className="relative pl-8 border-l-2 border-neon-purple/30 group hover:border-neon-purple transition-colors">
                            <span className="absolute -left-2 top-0 size-4 bg-neon-purple rounded-full shadow-[0_0_10px_rgba(176,38,255,0.5)]"></span>
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-neon-purple/80 group-hover:text-neon-purple transition-colors">
                                {section.title}
                            </h3>
                            <p className="text-base sm:text-lg leading-relaxed text-white/70 font-display">
                                {section.content}
                            </p>
                        </div>
                    ))}

                    <div className="p-10 border-2 border-white/10 rounded-3xl bg-white/5 mt-20">
                        <h4 className="text-xl font-black uppercase tracking-widest mb-6 text-center">What CROWD Is Not</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Not a Signal Service', desc: 'We do not provide trade advice.' },
                                { title: 'Not an Investment', desc: 'Entries are game fees, not deposits.' },
                                { title: 'Not Trading', desc: 'No directional exposure to tokens.' }
                            ].map((item, i) => (
                                <div key={i} className="text-center p-4 border border-white/5 rounded-xl">
                                    <span className="material-symbols-outlined text-neon-purple mb-2">cancel</span>
                                    <div className="font-bold uppercase text-xs mb-1">{item.title}</div>
                                    <p className="text-[10px] text-white/40">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Whitepaper;
