'use client'

import { useEffect, useState } from 'react'
import ContestCard from '@/components/ContestCard'

interface Contest {
    id: string
    contestDate: string
    status: string
    locksAt: string
    _count?: {
        entries: number
    }
}

export default function ResultsPage() {
    const [contests, setContests] = useState<Contest[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchContests()
    }, [])

    const fetchContests = async () => {
        try {
            const res = await fetch('/api/contests?limit=30')
            const data = await res.json()

            if (data.success) {
                setContests(data.data)
            }
        } catch (error) {
            console.error('Error fetching contests:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading results...
                </div>
            </div>
        )
    }

    return (
        <div className="container content-narrow">
            <div className="page-header">
                <h1 className="page-title">Past Results</h1>
                <p className="page-subtitle">View winners and statistics from previous contests</p>
            </div>

            {contests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        No contests yet. Check back after the first contest settles!
                    </p>
                </div>
            ) : (
                <div className="contest-list">
                    {contests.map(contest => (
                        <ContestCard
                            key={contest.id}
                            id={contest.id}
                            contestDate={contest.contestDate}
                            status={contest.status}
                            locksAt={contest.locksAt}
                            entriesCount={contest._count?.entries}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
