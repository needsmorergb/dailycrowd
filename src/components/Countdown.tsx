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
            <div className="countdown locked">
                <span className="countdown-label">Entries Locked</span>
            </div>
        )
    }

    return (
        <div className="countdown">
            <span className="countdown-label">Time remaining</span>
            <div className="countdown-timer">
                <div className="countdown-unit">
                    <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="countdown-unit-label">hrs</span>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-unit">
                    <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="countdown-unit-label">min</span>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-unit">
                    <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="countdown-unit-label">sec</span>
                </div>
            </div>
        </div>
    )
}
