'use client'

import { useState, useEffect } from 'react'

interface LiveCountdownProps {
    lockTime?: string // e.g. "19:00" for 7pm
}

export default function LiveCountdown({ lockTime = "19:00" }: LiveCountdownProps) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date()
            const [lockHour, lockMinute] = lockTime.split(':').map(Number)

            // Create lock time for today (in local time)
            const lockDate = new Date()
            lockDate.setHours(lockHour, lockMinute, 0, 0)

            // If lock time has passed, show next day
            if (now >= lockDate) {
                lockDate.setDate(lockDate.getDate() + 1)
            }

            const diff = lockDate.getTime() - now.getTime()

            if (diff <= 0) {
                return { hours: 0, minutes: 0, seconds: 0 }
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            return { hours, minutes, seconds }
        }

        setTimeLeft(calculateTimeLeft())
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(interval)
    }, [lockTime])

    return (
        <div className="countdown-box">
            <div className="countdown-label">Round Ends In</div>
            <div className="countdown-timer">
                <div className="countdown-unit">
                    <div className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="countdown-unit-label">Hours</div>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-unit">
                    <div className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="countdown-unit-label">Mins</div>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-unit">
                    <div className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="countdown-unit-label">Secs</div>
                </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Daily drawing at 7:00 PM PT</div>
        </div>
    )
}
