'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

interface Contest {
    id: string
    contestDate: string
    status: string
    locksAt: string
    _count?: {
        entries: number
    }
    result?: {
        winnerEntryNumber: number
        totalEntries: number
    }
}

export default function AdminPage() {
    const { data: session, status: authStatus } = useSession()
    const router = useRouter()

    const [contests, setContests] = useState<Contest[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [settling, setSettling] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Form state
    const [contestDate, setContestDate] = useState('')
    const [lockHour, setLockHour] = useState('19')
    const [lockMinute, setLockMinute] = useState('00')

    useEffect(() => {
        if (authStatus === 'authenticated') {
            fetchContests()
        }
    }, [authStatus])

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

    const handleCreateContest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!contestDate) return

        setCreating(true)
        setMessage(null)

        try {
            const date = new Date(contestDate)
            date.setHours(parseInt(lockHour), parseInt(lockMinute), 0, 0)

            const res = await fetch('/api/contests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contestDate: contestDate,
                    locksAt: date.toISOString()
                })
            })

            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Contest created successfully!' })
                setContestDate('')
                fetchContests()
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to create contest' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' })
        } finally {
            setCreating(false)
        }
    }

    const handleSettle = async (contestId: string) => {
        if (!confirm('Are you sure you want to settle this contest? This cannot be undone.')) {
            return
        }

        setSettling(contestId)
        setMessage(null)

        try {
            const res = await fetch('/api/settle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contestId })
            })

            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Contest settled successfully!' })
                fetchContests()
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to settle contest' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error' })
        } finally {
            setSettling(null)
        }
    }

    const handleExportCSV = (contest: Contest) => {
        const csv = `Contest Date,Status,Entries,Winner\n${contest.contestDate},${contest.status},${contest._count?.entries || 0},${contest.result?.winnerEntryNumber || 'N/A'}`
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `contest-${contest.contestDate.split('T')[0]}.csv`
        a.click()
    }

    const triggerCron = async () => {
        try {
            const res = await fetch('/api/cron', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                setMessage({ type: 'success', text: `Cron completed: ${data.data.lockedContests} locked, today: ${data.data.createdToday}, tomorrow: ${data.data.createdTomorrow}` })
                fetchContests()
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Cron failed' })
        }
    }

    if (authStatus === 'loading' || loading) {
        return (
            <div className="container flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!session?.user) {
        return (
            <div className="container max-w-md py-20">
                <div className="glass-card p-8 text-center rounded-2xl">
                    <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
                    <p className="text-muted-foreground">Please sign in to access the admin dashboard.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container max-w-6xl py-12">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage contests and view submissions</p>
                </div>
                <button
                    onClick={triggerCron}
                    className="btn btn-secondary text-xs"
                >
                    Run Daily Cron
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-8 ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Create Contest */}
                <div className="glass-card p-6 rounded-2xl h-fit">
                    <h2 className="text-xl font-bold mb-6">Create Contest</h2>
                    <form onSubmit={handleCreateContest} className="space-y-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">Contest Date</label>
                            <input
                                type="date"
                                value={contestDate}
                                onChange={(e) => setContestDate(e.target.value)}
                                className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">Lock Time (PT)</label>
                            <div className="flex gap-2">
                                <select
                                    value={lockHour}
                                    onChange={(e) => setLockHour(e.target.value)}
                                    className="flex-1 bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                    ))}
                                </select>
                                <select
                                    value={lockMinute}
                                    onChange={(e) => setLockMinute(e.target.value)}
                                    className="flex-1 bg-background border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                >
                                    <option value="00">00</option>
                                    <option value="15">15</option>
                                    <option value="30">30</option>
                                    <option value="45">45</option>
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={creating || !contestDate}
                        >
                            {creating ? 'Creating...' : 'Create Contest'}
                        </button>
                    </form>
                </div>

                {/* Contest List */}
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl overflow-hidden">
                    <h2 className="text-xl font-bold mb-6">Recent Contests</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-muted-foreground text-sm uppercase">
                                    <th className="pb-4 font-medium">Date</th>
                                    <th className="pb-4 font-medium">Status</th>
                                    <th className="pb-4 font-medium">Entries</th>
                                    <th className="pb-4 font-medium">Winner</th>
                                    <th className="pb-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {contests.map(contest => (
                                    <tr key={contest.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-4 font-bold">{formatDate(contest.contestDate)}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${contest.status === 'open' ? 'bg-green-500/20 text-green-500' :
                                                    contest.status === 'locked' ? 'bg-yellow-500/20 text-yellow-500' :
                                                        'bg-blue-500/20 text-blue-500'
                                                }`}>
                                                {contest.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-muted-foreground">{contest._count?.entries || 0}</td>
                                        <td className="py-4 text-muted-foreground font-mono">
                                            {contest.result?.winnerEntryNumber || '—'}
                                        </td>
                                        <td className="py-4">
                                            <div className="flex gap-2">
                                                {contest.status === 'locked' && !contest.result && (
                                                    <button
                                                        onClick={() => handleSettle(contest.id)}
                                                        className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold transition-colors disabled:opacity-50"
                                                        disabled={settling === contest.id}
                                                    >
                                                        {settling === contest.id ? '...' : 'Settle'}
                                                    </button>
                                                )}
                                                {contest.result && (
                                                    <button
                                                        onClick={() => handleExportCSV(contest)}
                                                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
                                                    >
                                                        CSV
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {contests.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                            No contests yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
