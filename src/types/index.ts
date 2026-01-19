import { User, Contest, Entry, ContestResult } from '@prisma/client'

// Extended user type with session data
export interface SessionUser {
    id: string
    email: string
    name?: string
    role: 'user' | 'admin'
    whopUserId?: string
}

// Contest with relations
export interface ContestWithEntries extends Contest {
    entries: Entry[]
    result?: ContestResult | null
}

// Contest with result for display
export interface ContestWithResult extends Contest {
    result: ContestResult | null
    _count?: {
        entries: number
    }
}

// Entry with user info (anonymized)
export interface AnonymizedEntry {
    number: number
    createdAt: Date
    isWinner: boolean
}

// Stats for display
export interface ContestStats {
    median: number
    mean: number
    mode: number
    min: number
    max: number
    totalEntries: number
    distribution: Record<number, number>
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Entry submission
export interface EntrySubmission {
    contestId: string
    number: number
}

// Contest creation (admin)
export interface ContestCreation {
    contestDate: string // YYYY-MM-DD
    locksAt?: string // ISO datetime
}

// Access check result
export interface AccessCheckResult {
    hasAccess: boolean
    accessType: 'monthly' | 'daily' | 'none'
    message?: string
}
