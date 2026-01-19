'use client'

import { useState } from 'react'

interface EntryFormProps {
    contestId: string
    onSuccess?: (entry: { number: number; createdAt: string }) => void
    disabled?: boolean
}

export default function EntryForm({ contestId, onSuccess, disabled }: EntryFormProps) {
    const [number, setNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const numValue = parseInt(number, 10)

        if (isNaN(numValue) || numValue < 1 || numValue > 100) {
            setError('Please enter a number between 1 and 100')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contestId, number: numValue })
            })

            const data = await response.json()

            if (!data.success) {
                setError(data.error || 'Failed to submit entry')
                setLoading(false)
                return
            }

            onSuccess?.(data.data)
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="entry-form">
            <div className="entry-input-group">
                <label htmlFor="number" className="entry-label">
                    Your number (1-100)
                </label>
                <input
                    type="number"
                    id="number"
                    min="1"
                    max="100"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Enter your prediction"
                    className="entry-input"
                    disabled={disabled || loading}
                />
            </div>

            {error && <p className="entry-error">{error}</p>}

            <button
                type="submit"
                className="entry-submit"
                disabled={disabled || loading || !number}
            >
                {loading ? 'Submitting...' : 'Submit Entry'}
            </button>
        </form>
    )
}
