import React from 'react';

const Tokenomics = () => {
    return (
        <section id="tokenomics" className="py-24 px-4 sm:px-10 border-t-4 border-primary bg-white grid-bg bg-opacity-5">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-16 gap-8 text-center sm:text-left">
                    <div>
                        <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter mb-4">$CROWD Token</h2>
                        <p className="text-primary/60 font-bold uppercase tracking-widest text-[10px] sm:text-sm">Economic integrity & value redistribution</p>
                    </div>
                    <div className="bg-primary text-neon-green p-6 border-4 border-primary rounded-2xl shadow-[8px_8px_0px_0px_#141414] sm:rotate-3 text-center w-full sm:w-auto">
                        <div className="text-3xl sm:text-4xl font-black italic tracking-tighter">1,000,000,000</div>
                        <div className="text-[10px] uppercase font-black tracking-[0.3em]">Total Supply</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
                    {/* Fee Flow Diagram */}
                    <div className="bg-white border-4 border-primary rounded-3xl p-6 sm:p-10 shadow-[12px_12px_0px_0px_#141414]">
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined text-neon-purple">cyclone</span>
                            Protocol Fee Flow
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-1 p-4 bg-primary text-white rounded-xl font-black text-center italic text-base sm:text-xl border-2 border-primary shadow-[4px_4px_0px_0px_#b026ff]">ROUND ENTRY (100%)</div>
                            </div>

                            <div className="flex justify-center py-2 h-12">
                                <div className="w-1 bg-primary/20 rounded-full h-full relative">
                                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 material-symbols-outlined text-primary/40">expand_more</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: '80% Prize Pot', color: 'bg-neon-green', text: 'Players', icon: 'payments' },
                                    { label: '10% House', color: 'bg-primary/10', text: 'Ops', icon: 'account_balance' },
                                    { label: '5% Stakers', color: 'bg-neon-purple', text: 'RevShare', icon: 'group' },
                                    { label: '5% Burn', color: 'bg-black', text: 'Deflation', icon: 'local_fire_department' }
                                ].map((item, i) => (
                                    <div key={i} className={`p-4 rounded-xl border-2 border-primary flex flex-col items-center text-center group hover:-translate-y-2 transition-transform ${item.color.includes('bg-primary/10') ? '' : item.color} ${item.color === 'bg-black' || item.color === 'bg-neon-purple' || item.color === 'bg-primary' ? 'text-white' : 'text-primary'}`}>
                                        <span className="material-symbols-outlined mb-2">{item.icon}</span>
                                        <div className="font-black text-sm uppercase leading-tight italic">{item.label}</div>
                                        <div className="text-[10px] font-bold opacity-60 uppercase">{item.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Utility List */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-[#f0f0f0] border-4 border-primary rounded-3xl p-8">
                            <h3 className="text-xl font-black uppercase tracking-widest mb-6">Utility & Holder Benefits</h3>
                            <ul className="space-y-4">
                                {[
                                    { title: 'Revenue Share', desc: 'Holders receive 5% of all protocol fees distributed via staking.' },
                                    { title: 'Tiebreak Priority', desc: 'Holders get priority in round resolution ties within the same accuracy band.' },
                                    { title: 'Advanced Insights', desc: 'Unlock the "Holders View" for distribution curves and bias trends.' },
                                    { title: 'Early Reveal', desc: 'See target tokens 60s earlier than non-holders for better prep.' }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="size-6 bg-primary text-neon-green flex items-center justify-center rounded shrink-0">
                                            <span className="material-symbols-outlined text-xs">check</span>
                                        </div>
                                        <div>
                                            <div className="font-black uppercase text-xs">{item.title}</div>
                                            <p className="text-xs text-primary/60">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-primary border-4 border-primary rounded-3xl p-8 text-white">
                            <h3 className="text-xl font-black uppercase tracking-widest mb-6 text-neon-green">Trust Guardrails</h3>
                            <div className="mb-4 p-4 bg-white/5 rounded-xl text-[10px] italic text-neon-purple leading-relaxed">
                                &quot;Holding $CROWD unlocks better information and recognition. Accuracy still decides winners.&quot;
                            </div>
                            <ul className="space-y-4">
                                {[
                                    'Does NOT improve prediction accuracy',
                                    'Does NOT guarantee wins',
                                    'Does NOT auto-enter rounds',
                                    'Does NOT increase payouts'
                                ].map((text, i) => (
                                    <li key={i} className="flex gap-4 items-center">
                                        <span className="material-symbols-outlined text-neon-purple text-sm">cancel</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Tokenomics;
