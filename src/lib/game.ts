import { Entry } from '@prisma/client'

/**
 * Calculate the median from an array of numbers
 */
export function calculateMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0

    const sorted = [...numbers].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
        // Even count: average of two middle numbers (can be .5)
        return (sorted[mid - 1] + sorted[mid]) / 2
    }
    return sorted[mid]
}

/**
 * Calculate mean (average) from an array of numbers
 */
export function calculateMean(numbers: number[]): number {
    if (numbers.length === 0) return 0
    const sum = numbers.reduce((a, b) => a + b, 0)
    return sum / numbers.length
}

/**
 * Calculate mode (most frequent number) from an array of numbers
 */
export function calculateMode(numbers: number[]): number {
    if (numbers.length === 0) return 0

    const freq = new Map<number, number>()
    numbers.forEach(n => freq.set(n, (freq.get(n) || 0) + 1))

    let maxFreq = 0
    let mode = numbers[0]

    freq.forEach((count, num) => {
        if (count > maxFreq) {
            maxFreq = count
            mode = num
        }
    })

    return mode
}

/**
 * Get distribution counts for numbers 1-100
 */
export function getDistribution(numbers: number[]): Record<number, number> {
    const distribution: Record<number, number> = {}

    // Initialize all numbers 1-100 with 0
    for (let i = 1; i <= 100; i++) {
        distribution[i] = 0
    }

    // Count occurrences
    numbers.forEach(n => {
        if (n >= 1 && n <= 100) {
            distribution[n]++
        }
    })

    return distribution
}

/**
 * Select winner(s) from entries based on median
 * 
 * Rules:
 * 1. Entry with smallest absolute difference to median
 * 2. Tie-breaker #1: Closest without going over the median
 * 3. Tie-breaker #2: Earliest timestamp
 */
export function selectWinner(entries: Entry[], median: number): Entry | null {
    if (entries.length === 0) return null

    const sortedEntries = [...entries].sort((a, b) => {
        const distA = Math.abs(a.number - median)
        const distB = Math.abs(b.number - median)

        // Primary: smallest distance to median
        if (distA !== distB) return distA - distB

        // Tie-breaker #1: closest without going over
        // "Over" means > median (if median is .5, over means > median)
        const overA = a.number > median
        const overB = b.number > median
        if (overA !== overB) return overA ? 1 : -1

        // Tie-breaker #2: earliest timestamp
        return a.createdAt.getTime() - b.createdAt.getTime()
    })

    return sortedEntries[0]
}

/**
 * Compute all stats for a contest settlement
 */
export function computeContestStats(entries: Entry[]) {
    const numbers = entries.map(e => e.number)
    const sorted = [...numbers].sort((a, b) => a - b)

    const median = calculateMedian(numbers)
    const mean = calculateMean(numbers)
    const mode = calculateMode(numbers)
    const min = sorted[0] || 0
    const max = sorted[sorted.length - 1] || 0
    const distribution = getDistribution(numbers)
    const winner = selectWinner(entries, median)

    return {
        median,
        mean,
        mode,
        min,
        max,
        totalEntries: entries.length,
        distribution,
        winner,
        winnerEntryNumber: winner?.number || 0,
        winnerTime: winner?.createdAt || new Date()
    }
}

/**
 * Validate entry number
 */
export function validateEntryNumber(number: number): { valid: boolean; error?: string } {
    if (!Number.isInteger(number)) {
        return { valid: false, error: 'Number must be an integer' }
    }
    if (number < 1 || number > 100) {
        return { valid: false, error: 'Number must be between 1 and 100' }
    }
    return { valid: true }
}
