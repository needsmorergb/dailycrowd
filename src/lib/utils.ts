import { format, parseISO } from 'date-fns'
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'

export const DEFAULT_TIMEZONE = process.env.DEFAULT_TIMEZONE || 'America/Los_Angeles'
export const DEFAULT_LOCK_HOUR = parseInt(process.env.DEFAULT_LOCK_HOUR || '19', 10)

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'MMM d, yyyy')
}

/**
 * Format a date for URL slugs (YYYY-MM-DD)
 */
export function formatDateSlug(date: Date): string {
    return format(date, 'yyyy-MM-dd')
}

/**
 * Parse a date slug back to Date
 */
export function parseDateSlug(slug: string): Date {
    return parseISO(slug)
}

/**
 * Get today's date at midnight in the default timezone
 */
export function getTodayInTimezone(): Date {
    const now = new Date()
    const zonedNow = toZonedTime(now, DEFAULT_TIMEZONE)
    zonedNow.setHours(0, 0, 0, 0)
    return zonedNow
}

/**
 * Get the lock time for a given date
 */
export function getLockTime(contestDate: Date): Date {
    const lockTime = new Date(contestDate)
    lockTime.setHours(DEFAULT_LOCK_HOUR, 0, 0, 0)
    return lockTime
}

/**
 * Get opens time for a given date (midnight)
 */
export function getOpensTime(contestDate: Date): Date {
    const opensTime = new Date(contestDate)
    opensTime.setHours(0, 0, 0, 0)
    return opensTime
}

/**
 * Check if a contest is currently locked
 */
export function isContestLocked(locksAt: Date): boolean {
    return new Date() >= locksAt
}

/**
 * Format time remaining until lock
 */
export function formatTimeRemaining(locksAt: Date): string {
    const now = new Date()
    const diff = locksAt.getTime() - now.getTime()

    if (diff <= 0) return 'Locked'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
}

/**
 * Format lock time for display
 */
export function formatLockTime(locksAt: Date): string {
    return formatInTimeZone(locksAt, DEFAULT_TIMEZONE, 'h:mm a z')
}

/**
 * Get contest status display text
 */
export function getStatusDisplay(status: string): { text: string; color: string } {
    switch (status) {
        case 'open':
            return { text: 'Open', color: '#22c55e' }
        case 'locked':
            return { text: 'Locked', color: '#eab308' }
        case 'settled':
            return { text: 'Settled', color: '#3b82f6' }
        default:
            return { text: status, color: '#6b7280' }
    }
}
