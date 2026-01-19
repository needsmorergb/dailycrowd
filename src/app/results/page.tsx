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
            <div className="container flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container max-w-4xl py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black mb-2 text-white">PAST RESULTS</h1>
                <p className="text-muted-foreground">View winners and statistics from previous contests</p>
            </div>

            {contests.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-2xl">
                    <p className="text-muted-foreground">
                        No contests yet. Check back after the first contest settles!
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
