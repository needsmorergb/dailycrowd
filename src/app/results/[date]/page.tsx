'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DistributionChart from '@/components/DistributionChart'
import { formatDate, getStatusDisplay } from '@/lib/utils'

interface ContestDetail {
    id: string
    contestDate: string
    status: string
    locksAt: string
    result?: {
        median: number
        mean: number
        mode: number
        min: number
        max: number
        totalEntries: number
        winnerEntryNumber: number
        winnerTime: string
        distribution: string
    }
}

export default function ContestDetailPage() {
    const params = useParams()
    const dateSlug = params.date as string

    const [contest, setContest] = useState<ContestDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [distribution, setDistribution] = useState<Record<number, number>>({})

    useEffect(() => {
        fetchContest()
    }, [dateSlug])

    const fetchContest = async () => {
        try {
            const res = await fetch(`/api/contests?limit=50`)
            const data = await res.json()

            if (data.success) {
                // Find the contest for this date
                const found = data.data.find((c: ContestDetail) =>
                    c.contestDate.split('T')[0] === dateSlug
                )

                if (found) {
                    setContest(found)

                    if (found.result?.distribution) {
                        try {
                            setDistribution(JSON.parse(found.result.distribution))
                        } catch (e) {
                            console.error('Error parsing distribution:', e)
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching contest:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!contest) {
        return (
            <div className="container max-w-2xl py-20 text-center">
                <div className="glass-card p-12 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-4">Contest Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        No contest exists for this date.
                    </p>
                    <Link href="/results" className="btn btn-secondary">
                        Back to Results
                    </Link>
                </div>
            </div>
        )
    }

    const status = getStatusDisplay(contest.status)
    const contestDate = new Date(contest.contestDate)

    // Not settled yet
    if (contest.status !== 'settled' || !contest.result) {
        return (
            <div className="container max-w-2xl py-12">
                <Link href="/results" className="text-muted-foreground hover:text-white mb-8 inline-block transition-colors">
                    ← Back to Results
                </Link>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold">{formatDate(contestDate)}</h1>
                    <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase text-white shadow-sm"
                        style={{ backgroundColor: status.color }}
                    >
                        {status.text}
                    </span>
                </div>

                <div className="glass-card p-12 text-center rounded-2xl">
                    <p className="text-6xl mb-6">⏳</p>
                    <h2 className="text-xl font-bold mb-2">Results Pending</h2>
                    <p className="text-muted-foreground">
                        {contest.status === 'open'
                            ? 'This contest is still accepting entries.'
                            : 'This contest is locked and awaiting settlement.'}
                    </p>
                </div>
            </div>
        )
    }

    // Settled - show full results
    const result = contest.result

    return (
        <div className="container max-w-4xl py-12">
            <Link href="/results" className="text-muted-foreground hover:text-white mb-8 inline-block transition-colors">
                ← Back to Results
            </Link>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
                <h1 className="text-4xl font-black text-white">{formatDate(contestDate)}</h1>
                <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase text-white shadow-sm"
                    style={{ backgroundColor: status.color }}
                >
                    {status.text}
                </span>
            </div>

            {/* Winner Display */}
            <div className="bg-gradient-hero p-[1px] rounded-2xl mb-12 shadow-2xl shadow-primary/20">
                <div className="bg-background/90 backdrop-blur rounded-[15px] p-12 text-center">
                    <div className="text-success text-sm font-bold uppercase tracking-widest mb-4">🏆 Winning Number</div>
                    <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-success to-primary mb-2">
                        {result.winnerEntryNumber}
                    </div>
                    <p className="text-muted-foreground">
                        Closest to the median of <span className="text-white font-bold">{result.median}</span>
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12">
                {[
                    { label: 'Median', value: result.median },
                    { label: 'Mean', value: result.mean.toFixed(1) },
                    { label: 'Mode', value: result.mode },
                    { label: 'Min', value: result.min },
                    { label: 'Max', value: result.max },
                    { label: 'Entries', value: result.totalEntries },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-muted-foreground uppercase">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Distribution Chart */}
            <div className="glass-card p-8 rounded-2xl mb-8">
                <h3 className="text-xl font-bold mb-6">Entry Distribution</h3>
                <DistributionChart
                    distribution={distribution}
                    median={result.median}
                    winnerNumber={result.winnerEntryNumber}
                />
            </div>

            {/* Tie-breaker explanation */}
            <div className="bg-white/5 p-8 rounded-2xl border border-white/5">
                <h3 className="font-bold mb-4">How the Winner Was Selected</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                    <li>
                        The median of all entries was calculated: <strong className="text-white">{result.median}</strong>
                    </li>
                    <li>
                        Entries were ranked by distance to the median
                    </li>
                    <li>
                        For ties: entries that didn't exceed the median were preferred
                    </li>
                    <li>
                        For remaining ties: earlier submissions won
                    </li>
                </ol>
            </div>

            {/* Data transparency note */}
            <div className="text-center mt-12 text-xs text-muted-foreground/50">
                🔒 Results computed from {result.totalEntries} valid submissions recorded by the platform.
            </div>
        </div>
    )
}
