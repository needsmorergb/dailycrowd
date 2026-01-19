'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Countdown from '@/components/Countdown'
import EntryForm from '@/components/EntryForm'
import { formatDate, formatLockTime } from '@/lib/utils'

interface Contest {
    id: string
    contestDate: string
    status: string
    locksAt: string
}

interface UserEntry {
    id: string
    number: number
    createdAt: string
}

export default function TodayPage() {
    const { data: session, status: authStatus } = useSession()
    const [contest, setContest] = useState<Contest | null>(null)
    const [userEntry, setUserEntry] = useState<UserEntry | null>(null)
    const [loading, setLoading] = useState(true)
    const [isLocked, setIsLocked] = useState(false)

    useEffect(() => {
        fetchTodayContest()
    }, [session])

    const fetchTodayContest = async () => {
        try {
            // Get today's contest
            const res = await fetch('/api/contests?limit=1&status=open')
            const data = await res.json()

            if (data.success && data.data.length > 0) {
                const todayContest = data.data[0]
                setContest(todayContest)
                setIsLocked(new Date() >= new Date(todayContest.locksAt))

                // Get user's entry if logged in
                if (session?.user) {
                    const entryRes = await fetch(`/api/entries?contestId=${todayContest.id}`)
                    const entryData = await entryRes.json()
                    if (entryData.success && entryData.data) {
                        setUserEntry(entryData.data)
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching contest:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEntrySuccess = (entry: { number: number; createdAt: string }) => {
        setUserEntry({
            id: 'new',
            number: entry.number,
            createdAt: entry.createdAt
        })
    }

    const handleCountdownComplete = () => {
        setIsLocked(true)
    }

    if (loading || authStatus === 'loading') {
        return (
            <div className="container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading today's contest...
                </div>
            </div>
        )
    }

    if (!contest) {
        return (
            <div className="container content-narrow">
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2>No Contest Available</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Today's contest hasn't been created yet. Check back soon!
                    </p>
                </div>
            </div>
        )
    }

    // Not signed in
    if (!session?.user) {
        return (
            <div className="container content-narrow">
                <div className="page-header" style={{ textAlign: 'center' }}>
                    <h1 className="page-title">Today's Contest</h1>
                    <p className="page-subtitle">{formatDate(contest.contestDate)}</p>
                </div>

                <div className="card" style={{ marginBottom: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Pick a number from
                        </p>
                        <p style={{ fontSize: '2rem', fontWeight: 700 }}>
                            1 – 100
                        </p>
                    </div>

                    <Countdown
                        targetDate={contest.locksAt}
                        onComplete={handleCountdownComplete}
                    />

                    <p style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        marginTop: '8px'
                    }}>
                        Locks at {formatLockTime(new Date(contest.locksAt))}
                    </p>
                </div>

                <div className="paywall">
                    <div className="paywall-icon">🔒</div>
                    <h2 className="paywall-title">Sign In to Play</h2>
                    <p className="paywall-text">
                        Create an account and unlock access to submit your entry.
                    </p>
                    <Link href="/account" className="btn btn-primary">
                        Sign In
                    </Link>
                </div>
            </div>
        )
    }

    // Already submitted
    if (userEntry) {
        return (
            <div className="container content-narrow">
                <div className="page-header" style={{ textAlign: 'center' }}>
                    <h1 className="page-title">Today's Contest</h1>
                    <p className="page-subtitle">{formatDate(contest.contestDate)}</p>
                </div>

                <div className="entry-confirmation">
                    <div className="entry-confirmation-icon">✓</div>
                    <h2 className="entry-confirmation-title">Entry Submitted!</h2>
                    <div className="entry-confirmation-number">{userEntry.number}</div>
                    <p className="entry-confirmation-time">
                        Submitted at {new Date(userEntry.createdAt).toLocaleTimeString()}
                    </p>
                </div>

                <div className="card" style={{ marginTop: '24px' }}>
                    {isLocked || contest.status !== 'open' ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{
                                color: 'var(--warning)',
                                fontWeight: 600,
                                marginBottom: '8px'
                            }}>
                                Entries are now locked
                            </p>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {contest.status === 'settled'
                                    ? 'Results have been posted!'
                                    : 'Results will be posted soon.'
                                }
                            </p>
                            <Link
                                href={`/results/${contest.contestDate.split('T')[0]}`}
                                className="btn btn-secondary"
                                style={{ marginTop: '16px' }}
                            >
                                View Results
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Countdown
                                targetDate={contest.locksAt}
                                onComplete={handleCountdownComplete}
                            />
                            <p style={{
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontSize: '0.875rem',
                                marginTop: '8px'
                            }}>
                                Entries lock at {formatLockTime(new Date(contest.locksAt))}
                            </p>
                        </>
                    )}
                </div>
            </div>
        )
    }

    // Contest is locked
    if (isLocked || contest.status !== 'open') {
        return (
            <div className="container content-narrow">
                <div className="page-header" style={{ textAlign: 'center' }}>
                    <h1 className="page-title">Today's Contest</h1>
                    <p className="page-subtitle">{formatDate(contest.contestDate)}</p>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                    <div className="countdown locked">
                        <span className="countdown-label">Entries Locked</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>
                        {contest.status === 'settled'
                            ? 'Results have been posted!'
                            : 'You missed today\'s contest. Results will be posted soon.'
                        }
                    </p>
                    <Link
                        href={`/results/${contest.contestDate.split('T')[0]}`}
                        className="btn btn-secondary"
                        style={{ marginTop: '16px' }}
                    >
                        View Results
                    </Link>
                </div>
            </div>
        )
    }

    // Ready to submit
    return (
        <div className="container content-narrow">
            <div className="page-header" style={{ textAlign: 'center' }}>
                <h1 className="page-title">Today's Contest</h1>
                <p className="page-subtitle">{formatDate(contest.contestDate)}</p>
            </div>

            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Pick a number from
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>
                        1 – 100
                    </p>
                </div>

                <Countdown
                    targetDate={contest.locksAt}
                    onComplete={handleCountdownComplete}
                />

                <p style={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    marginTop: '8px',
                    marginBottom: '24px'
                }}>
                    Locks at {formatLockTime(new Date(contest.locksAt))}
                </p>

                <EntryForm
                    contestId={contest.id}
                    onSuccess={handleEntrySuccess}
                />
            </div>

            <div style={{
                textAlign: 'center',
                marginTop: '24px',
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius)',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem'
            }}>
                💡 Tip: The winning number is the one closest to what everyone else picks.
                Think about what the median might be!
            </div>
        </div>
    )
}
