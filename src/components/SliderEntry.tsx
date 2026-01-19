'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SliderEntry() {
    const [value, setValue] = useState(50)

    return (
        <div className="glass-card neon-border rounded-2xl p-8">
            {/* Badge */}
            <div className="mb-4">
                <span className="badge">
                    <span className="badge-dot"></span>
                    ROUND ACTIVE
                </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                MASTER THE<br />
                <span className="text-primary italic">MEDIAN.</span>
            </h1>

            <p className="text-muted-foreground mb-8">
                Predict where the crowd lands. No algorithms, no luck
                —just pure social intelligence. The closest entry wins <span className="text-primary font-bold">$1,000</span>.
            </p>

            {/* Slider Section */}
            <div className="bg-muted rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Slide to select guess</span>
                    <span className="text-5xl font-black text-primary font-mono">{value}</span>
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
                    <span>1</span>
                    <span>50</span>
                    <span>100</span>
                </div>
            </div>

            {/* CTA Button */}
            <Link href="/today" className="btn btn-primary text-lg w-full justify-center">
                SUBMIT ENTRY →
            </Link>

            <p className="text-xs text-muted-foreground text-center mt-4">
                Sign in to lock in your number
            </p>
        </div>
    )
}
