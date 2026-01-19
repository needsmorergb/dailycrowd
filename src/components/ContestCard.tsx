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

    const content = (
        <div className="contest-card">
            <div className="contest-card-header">
                <h3 className="contest-date">{formatDate(date)}</h3>
                <span
                    className="contest-status"
                    style={{ backgroundColor: statusDisplay.color }}
                >
                    {statusDisplay.text}
                </span>
            </div>

            <div className="contest-card-body">
                <p className="contest-range">Range: 1 – 100</p>
                {entriesCount !== undefined && (
                    <p className="contest-entries">{entriesCount} entries</p>
                )}
            </div>
        </div>
    )

    if (showLink) {
        return (
            <Link href={`/results/${dateSlug}`} className="contest-card-link">
                {content}
            </Link>
        )
    }

    return content
}
