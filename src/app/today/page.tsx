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
            <div className="container flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!contest) {
        return (
            <div className="container max-w-2xl py-20 text-center">
                <div className="glass-card p-12 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-2">No Contest Available</h2>
                    <p className="text-muted-foreground">
                        Today's contest hasn't been created yet. Check back soon!
                    </p>
                </div>
            </div>
        )
    }

    const HeaderSection = () => (
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-white">TODAY'S CONTEST</h1>
            <p className="text-lg text-secondary font-medium tracking-wide">{formatDate(contest.contestDate)}</p>
        </div>
    )

    // Not signed in
    if (!session?.user) {
        return (
            <div className="container max-w-lg py-20">
                <HeaderSection />

                <div className="glass-card p-1 rounded-2xl mb-8">
                    <div className="bg-background/50 rounded-[14px] p-8">
                        <div className="text-center mb-8">
                            <p className="text-muted-foreground mb-2 text-sm uppercase tracking-widest">Pick a number from</p>
                            <p className="text-5xl font-black text-white">1 – 100</p>
                        </div>

                        <Countdown
                            targetDate={contest.locksAt}
                            onComplete={handleCountdownComplete}
                        />

                        <p className="text-center text-xs text-muted-foreground mt-4">
                            Locks at {formatLockTime(new Date(contest.locksAt))}
                        </p>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-2xl text-center border-primary/20 bg-primary/5">
                    <div className="text-3xl mb-4">🔒</div>
                    <h2 className="text-xl font-bold mb-2">Sign In to Play</h2>
                    <p className="text-muted-foreground mb-6">
                        Create an account and unlock access to submit your entry.
                    </p>
                    <Link href="/account" className="btn btn-primary w-full">
                        Sign In
                    </Link>
                </div>
            </div>
        )
    }

    // Already submitted
    if (userEntry) {
        return (
            <div className="container max-w-lg py-20">
                <HeaderSection />

                <div className="p-8 bg-success/10 border border-success/20 rounded-2xl text-center mb-8">
                    <div className="text-4xl mb-4 text-success">✓</div>
                    <h2 className="text-xl font-bold mb-2 text-white">Entry Submitted!</h2>
                    <div className="text-6xl font-black text-success my-4">{userEntry.number}</div>
                    <p className="text-xs text-muted-foreground">
                        Submitted at {new Date(userEntry.createdAt).toLocaleTimeString()}
                    </p>
                </div>

                <div className="glass-card p-8 rounded-2xl text-center">
                    {isLocked || contest.status !== 'open' ? (
                        <div>
                            <p className="text-warning font-bold mb-2">Entries are now locked</p>
                            <p className="text-muted-foreground mb-6">
                                {contest.status === 'settled'
                                    ? 'Results have been posted!'
                                    : 'Results will be posted soon.'
                                }
                            </p>
                            <Link
                                href={`/results/${contest.contestDate.split('T')[0]}`}
                                className="btn btn-secondary w-full"
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
                            <p className="text-center text-xs text-muted-foreground mt-4">
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
            <div className="container max-w-lg py-20">
                <HeaderSection />

                <div className="glass-card p-8 rounded-2xl text-center">
                    <div className="p-4 bg-destructive/10 rounded-xl mb-4 border border-destructive/20">
                        <span className="text-destructive font-bold uppercase tracking-wider">Entries Locked</span>
                    </div>

                    <p className="text-muted-foreground mb-6">
                        {contest.status === 'settled'
                            ? 'Results have been posted!'
                            : 'You missed today\'s contest. Results will be posted soon.'
                        }
                    </p>
                    <Link
                        href={`/results/${contest.contestDate.split('T')[0]}`}
                        className="btn btn-secondary w-full"
                    >
                        View Results
                    </Link>
                </div>
            </div>
        )
    }

    // Ready to submit
    return (
        <div className="container max-w-lg py-20">
            <HeaderSection />

            <div className="glass-card neon-border p-8 rounded-2xl">
                <div className="text-center mb-8">
                    <p className="text-muted-foreground mb-2 text-sm uppercase tracking-widest">Pick a number from</p>
                    <p className="text-5xl font-black text-white">1 – 100</p>
                </div>

                <Countdown
                    targetDate={contest.locksAt}
                    onComplete={handleCountdownComplete}
                />

                <p className="text-center text-xs text-muted-foreground mt-2 mb-8">
                    Locks at {formatLockTime(new Date(contest.locksAt))}
                </p>

                <EntryForm
                    contestId={contest.id}
                    onSuccess={handleEntrySuccess}
                />
            </div>

            <div className="mt-8 p-4 bg-white/5 rounded-xl text-center text-sm text-muted-foreground border border-white/5">
                💡 Tip: The winning number is the one closest to what everyone else picks.
                Think about what the median might be!
            </div>
        </div>
    )
}
