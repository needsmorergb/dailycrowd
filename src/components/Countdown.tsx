'use client'

import { useState, useEffect } from 'react'

interface CountdownProps {
    targetDate: Date | string
    onComplete?: () => void
}

export default function Countdown({ targetDate, onComplete }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        hours: number
        minutes: number
        seconds: number
        isLocked: boolean
    }>({ hours: 0, minutes: 0, seconds: 0, isLocked: false })

    useEffect(() => {
        const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate

        const calculateTimeLeft = () => {
            const now = new Date()
            const diff = target.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isLocked: true })
                onComplete?.()
                return
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeLeft({ hours, minutes, seconds, isLocked: false })
        }

        calculateTimeLeft()
        const interval = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(interval)
    }, [targetDate, onComplete])

    if (timeLeft.isLocked) {
        return (
            <div className="p-4 bg-destructive/10 rounded-xl text-center border border-destructive/20">
                <span className="text-destructive font-bold uppercase tracking-wider text-sm">Entries Locked</span>
            </div>
        )
    }

    return (
        <div className="p-6 text-center">
            <span className="block text-sm text-muted-foreground mb-4 uppercase tracking-widest">Time Remaining</span>
            <div className="flex justify-center items-center gap-4">
                <div className="flex flex-col items-center p-3 bg-secondary/10 rounded-lg min-w-[80px]">
                    <span className="text-4xl font-black font-mono text-secondary">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] text-muted-foreground uppercase mt-1">Hours</span>
                </div>
                <span className="text-2xl text-muted-foreground/30">:</span>
                <div className="flex flex-col items-center p-3 bg-secondary/10 rounded-lg min-w-[80px]">
                    <span className="text-4xl font-black font-mono text-secondary">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] text-muted-foreground uppercase mt-1">Mins</span>
                </div>
                <span className="text-2xl text-muted-foreground/30">:</span>
                <div className="flex flex-col items-center p-3 bg-secondary/10 rounded-lg min-w-[80px]">
                    <span className="text-4xl font-black font-mono text-secondary">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] text-muted-foreground uppercase mt-1">Secs</span>
                </div>
            </div>
        </div>
    )
}
