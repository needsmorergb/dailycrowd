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
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="mb-6">
                <label htmlFor="number" className="block text-sm text-muted-foreground mb-2 text-center uppercase tracking-wider">
                    Your number (1-100)
                </label>
                <input
                    type="number"
                    id="number"
                    min="1"
                    max="100"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="50"
                    className="w-full text-center text-4xl font-black bg-background border-2 border-white/10 rounded-xl py-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-white/5"
                    disabled={disabled || loading}
                />
            </div>

            {error && <p className="text-destructive text-sm text-center mb-4 bg-destructive/10 p-2 rounded">{error}</p>}

            <button
                type="submit"
                className="w-full py-4 text-lg font-bold text-white bg-primary rounded-xl hover:bg-primary/90 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                disabled={disabled || loading || !number}
            >
                {loading ? 'Submitting...' : 'Submit Entry'}
            </button>
        </form>
    )
}
