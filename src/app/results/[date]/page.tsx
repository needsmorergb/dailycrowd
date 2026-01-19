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
            <div className="container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading contest details...
                </div>
            </div>
        )
    }

    if (!contest) {
        return (
            <div className="container content-narrow">
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2>Contest Not Found</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        No contest exists for this date.
                    </p>
                    <Link href="/results" className="btn btn-secondary" style={{ marginTop: '16px' }}>
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
            <div className="container content-narrow">
                <Link href="/results" style={{
                    color: 'var(--text-secondary)',
                    display: 'inline-block',
                    marginBottom: '16px'
                }}>
                    ← Back to Results
                </Link>

                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <h1 className="page-title">{formatDate(contestDate)}</h1>
                        <span
                            className="contest-status"
                            style={{ backgroundColor: status.color }}
                        >
                            {status.text}
                        </span>
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <p style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</p>
                    <h2>Results Pending</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
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
        <div className="container content-narrow">
            <Link href="/results" style={{
                color: 'var(--text-secondary)',
                display: 'inline-block',
                marginBottom: '16px'
            }}>
                ← Back to Results
            </Link>

            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 className="page-title">{formatDate(contestDate)}</h1>
                    <span
                        className="contest-status"
                        style={{ backgroundColor: status.color }}
                    >
                        {status.text}
                    </span>
                </div>
            </div>

            {/* Winner Display */}
            <div className="winner-display">
                <div className="winner-label">🏆 Winning Number</div>
                <div className="winner-number">{result.winnerEntryNumber}</div>
                <p className="winner-details">
                    Closest to the median of {result.median}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{result.median}</div>
                    <div className="stat-label">Median</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{result.mean.toFixed(1)}</div>
                    <div className="stat-label">Mean</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{result.mode}</div>
                    <div className="stat-label">Mode</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{result.min}</div>
                    <div className="stat-label">Min</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{result.max}</div>
                    <div className="stat-label">Max</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{result.totalEntries}</div>
                    <div className="stat-label">Entries</div>
                </div>
            </div>

            {/* Distribution Chart */}
            <div className="card">
                <h3 style={{ marginBottom: '16px' }}>Entry Distribution</h3>
                <DistributionChart
                    distribution={distribution}
                    median={result.median}
                    winnerNumber={result.winnerEntryNumber}
                />
            </div>

            {/* Tie-breaker explanation */}
            <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '12px' }}>How the Winner Was Selected</h3>
                <ol style={{
                    paddingLeft: '20px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9375rem'
                }}>
                    <li style={{ marginBottom: '8px' }}>
                        The median of all entries was calculated: <strong>{result.median}</strong>
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                        Entries were ranked by distance to the median
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                        For ties: entries that didn't exceed the median were preferred
                    </li>
                    <li>
                        For remaining ties: earlier submissions won
                    </li>
                </ol>
            </div>

            {/* Data transparency note */}
            <div style={{
                textAlign: 'center',
                marginTop: '24px',
                padding: '16px',
                color: 'var(--text-muted)',
                fontSize: '0.75rem'
            }}>
                🔒 Results computed from {result.totalEntries} valid submissions recorded by the platform.
            </div>
        </div>
    )
}
