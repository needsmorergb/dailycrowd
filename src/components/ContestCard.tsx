import Link from 'next/link'
import { formatDate, getStatusDisplay } from '@/lib/utils'

interface ContestCardProps {
    id: string
    contestDate: Date | string
    status: string
    locksAt: Date | string
    entriesCount?: number
    showLink?: boolean
}

export default function ContestCard({
    id,
    contestDate,
    status,
    locksAt,
    entriesCount,
    showLink = true
}: ContestCardProps) {
    const date = typeof contestDate === 'string' ? new Date(contestDate) : contestDate
    const statusDisplay = getStatusDisplay(status)
    const dateSlug = date.toISOString().split('T')[0]

    // Override status color for Tailwind if needed, or use inline style for dynamic colors from utils
    // Ideally utils return tailwind classes, but returning hex is fine for inline style

    const content = (
        <div className="glass-card p-6 rounded-xl hover:bg-white/5 transition-all hover:-translate-y-1 hover:border-primary/50 group">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{formatDate(date)}</h3>
                <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase text-white shadow-sm"
                    style={{ backgroundColor: statusDisplay.color }}
                >
                    {statusDisplay.text}
                </span>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
                <p>Range: 1 – 100</p>
                {entriesCount !== undefined && (
                    <p>{entriesCount} entries</p>
                )}
            </div>
        </div>
    )

    if (showLink) {
        return (
            <Link href={`/results/${dateSlug}`} className="block">
                {content}
            </Link>
        )
    }

    return content
}
