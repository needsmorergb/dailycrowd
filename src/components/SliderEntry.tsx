'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function SliderEntry() {
    const { connected } = useWallet()
    const [value, setValue] = useState(2)

    return (
        <div className="glass-card neon-border rounded-2xl p-8">
            {/* Badge */}
            <div className="mb-4">
                <span className="badge">
                    <span className="badge-dot"></span>
                    ACTIVE ORACLE ROUND
                </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                PREDICT THE<br />
                <span className="text-primary italic">NEXT MOON.</span>
            </h1>

            <p className="text-muted-foreground mb-8 text-sm">
                The crowd is the ultimate alpha. Predict the 1-hour ROI of the next
                <span className="text-primary font-bold"> pump.fun </span>
                bonding curve break. Closest win takes the SOL pot.
            </p>

            {/* Slider Section */}
            <div className="bg-muted rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Predict ROI %</span>
                    <span className="text-5xl font-black text-primary font-mono">{value}x</span>
                </div>

                {/* Custom Slider */}
                <div className="relative py-4">
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={value}
                        onChange={(e) => setValue(parseInt(e.target.value))}
                        className="slider w-full cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #c8ff00 0%, #c8ff00 ${value}%, #1f2937 ${value}%, #1f2937 100%)`
                        }}
                    />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1x</span>
                    <span>50x</span>
                    <span>100x</span>
                </div>
            </div>

            {/* CTA Button */}
            {connected ? (
                <button className="btn btn-primary text-lg w-full justify-center">
                    STAKE PREDICTION →
                </button>
            ) : (
                <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">Connect wallet to stake $5 in SOL</p>
                    <WalletMultiButton className="!w-full !justify-center !bg-primary !text-background !h-12 !rounded-xl !font-bold" />
                </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center mt-4 uppercase tracking-widest opacity-50">
                Transparently settled on Solana
            </p>
        </div>
    )
}
