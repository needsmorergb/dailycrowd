import React from 'react';

const Leaderboard = () => {
    const tabs = ['All-Time Accuracy', '7-Day Accuracy', 'Win Streaks', 'Biggest Wins'];
    const [activeTab, setActiveTab] = React.useState('All-Time Accuracy');

    const mockData = [
        { rank: 1, wallet: 'G8Xp...m2K', accuracy: '98.5%', avgDist: '0.12x', rounds: 142, wins: 42, badge: 'Oracle S1', isHolder: true },
        { rank: 2, wallet: 'Ar4z...L9q', accuracy: '97.2%', avgDist: '0.15x', rounds: 89, wins: 28, badge: 'Top 5%', isHolder: false },
        { rank: 3, wallet: '2Wnn...o0X', accuracy: '95.8%', avgDist: '0.21x', rounds: 210, wins: 65, badge: 'Veteran', isHolder: true },
        { rank: 4, wallet: 'fD3k...p9A', accuracy: '94.1%', avgDist: '0.28x', rounds: 56, wins: 12, badge: null, isHolder: false },
        { rank: 5, wallet: '9vQ1...k7L', accuracy: '93.5%', avgDist: '0.30x', rounds: 124, wins: 31, badge: null, isHolder: true },
    ];

    return (
        <section id="leaderboard" className="py-20 px-10 border-t-4 border-primary bg-white grid-bg bg-opacity-5">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Leaderboard</h2>
                    <p className="text-primary/60 font-bold uppercase tracking-widest text-xs">Skill-based rankings across all CROWD Oracle rounds</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-none">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl border-4 font-black uppercase italic tracking-wider transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-primary text-neon-green border-primary shadow-[4px_4px_0px_0px_rgba(204,255,0,1)]'
                                : 'bg-white text-primary border-primary/10 hover:border-primary shadow-none'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-primary text-white rounded-t-2xl font-black uppercase text-[10px] tracking-widest">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-3">Wallet</div>
                    <div className="col-span-2">Accuracy</div>
                    <div className="col-span-2 text-center">Avg Dist.</div>
                    <div className="col-span-2 text-center">Rounds</div>
                    <div className="col-span-2 text-right">Wins</div>
                </div>

                {/* Table Rows */}
                <div className="bg-white border-x-4 border-b-4 border-primary rounded-b-2xl overflow-hidden shadow-[12px_12px_0px_0px_#141414]">
                    {mockData.map((user, i) => (
                        <div
                            key={i}
                            className={`grid grid-cols-12 gap-4 px-8 py-6 items-center border-t-2 border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer group ${i === 0 ? 'border-t-0' : ''}`}
                        >
                            <div className="col-span-1">
                                <span className={`size-8 rounded-lg flex items-center justify-center font-mono font-bold text-lg ${user.rank === 1 ? 'bg-neon-green text-primary border-2 border-primary' :
                                    user.rank === 2 ? 'bg-primary/10 text-primary border-2 border-primary/20' :
                                        'text-primary/40'
                                    }`}>
                                    {user.rank}
                                </span>
                            </div>
                            <div className="col-span-3 flex items-center gap-3">
                                <span className="font-mono font-black text-primary group-hover:text-neon-purple transition-colors">{user.wallet}</span>
                                {user.isHolder && (
                                    <div className="relative group/holder">
                                        <span className="material-symbols-outlined text-[10px] text-neon-purple font-black cursor-help">stars</span>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-primary text-white text-[8px] rounded-lg opacity-0 group-hover/holder:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed text-center">
                                            $CROWD Token Holder
                                        </div>
                                    </div>
                                )}
                                {user.badge && (
                                    <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase rounded tracking-tighter italic">
                                        {user.badge}
                                    </span>
                                )}
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-lg">{user.accuracy}</span>
                                    <div className="h-1.5 flex-1 bg-primary/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-neon-green" style={{ width: user.accuracy }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 text-center font-mono font-bold text-primary/60">{user.avgDist}</div>
                            <div className="col-span-2 text-center font-mono font-bold text-primary/60">{user.rounds}</div>
                            <div className="col-span-2 text-right font-mono font-black text-neon-purple">{user.wins}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Leaderboard;
