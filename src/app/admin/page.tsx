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
        // In a real implementation, this would fetch entries and generate CSV
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
            <div className="container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading...
                </div>
            </div>
        )
    }

    if (!session?.user) {
        return (
            <div className="container">
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2>Admin Access Required</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Please sign in to access the admin dashboard.
                    </p>
                </div>
            </div>
        )
    }

    // Note: In production, check user.role === 'admin'
    // For demo purposes, allow any logged-in user

    return (
        <div className="container">
            <div className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Manage contests and view submissions</p>
            </div>

            {message && (
                <div className={`message message-${message.type}`} style={{ marginBottom: '24px' }}>
                    {message.text}
                </div>
            )}

            <div className="admin-grid">
                {/* Create Contest */}
                <div className="admin-section">
                    <h2 className="admin-section-title">Create Contest</h2>
                    <form onSubmit={handleCreateContest}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                Contest Date
                            </label>
                            <input
                                type="date"
                                value={contestDate}
                                onChange={(e) => setContestDate(e.target.value)}
                                className="auth-input"
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                Lock Time (PT)
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    value={lockHour}
                                    onChange={(e) => setLockHour(e.target.value)}
                                    className="auth-input"
                                    style={{ flex: 1 }}
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                                    ))}
                                </select>
                                <select
                                    value={lockMinute}
                                    onChange={(e) => setLockMinute(e.target.value)}
                                    className="auth-input"
                                    style={{ flex: 1 }}
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
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={creating || !contestDate}
                        >
                            {creating ? 'Creating...' : 'Create Contest'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                        <button
                            onClick={triggerCron}
                            className="btn btn-secondary"
                            style={{ width: '100%' }}
                        >
                            Run Daily Cron Job
                        </button>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px' }}>
                            Auto-creates today/tomorrow contests and locks expired ones
                        </p>
                    </div>
                </div>

                {/* Contest List */}
                <div className="admin-section" style={{ gridColumn: 'span 2' }}>
                    <h2 className="admin-section-title">Contests</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Entries</th>
                                <th>Winner</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contests.map(contest => (
                                <tr key={contest.id}>
                                    <td>{formatDate(contest.contestDate)}</td>
                                    <td>
                                        <span
                                            className="contest-status"
                                            style={{
                                                backgroundColor:
                                                    contest.status === 'open' ? '#22c55e' :
                                                        contest.status === 'locked' ? '#eab308' :
                                                            '#3b82f6'
                                            }}
                                        >
                                            {contest.status}
                                        </span>
                                    </td>
                                    <td>{contest._count?.entries || 0}</td>
                                    <td>
                                        {contest.result?.winnerEntryNumber || '—'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {contest.status === 'locked' && !contest.result && (
                                                <button
                                                    onClick={() => handleSettle(contest.id)}
                                                    className="btn btn-success"
                                                    style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                                                    disabled={settling === contest.id}
                                                >
                                                    {settling === contest.id ? 'Settling...' : 'Settle'}
                                                </button>
                                            )}
                                            {contest.result && (
                                                <button
                                                    onClick={() => handleExportCSV(contest)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '4px 12px', fontSize: '0.75rem' }}
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
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                        No contests yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
