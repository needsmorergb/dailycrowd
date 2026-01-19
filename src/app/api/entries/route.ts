import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateEntryNumber } from '@/lib/game'
import { checkUserAccess } from '@/lib/whop'

// POST /api/entries - Submit an entry
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Please sign in to submit an entry' },
                { status: 401 }
            )
        }

        const userId = (session.user as any).id
        const body = await request.json()
        const { contestId, number } = body

        // Validate the number
        const validation = validateEntryNumber(number)
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            )
        }

        // Get the contest
        const contest = await prisma.contest.findUnique({
            where: { id: contestId }
        })

        if (!contest) {
            return NextResponse.json(
                { success: false, error: 'Contest not found' },
                { status: 404 }
            )
        }

        // Check if contest is still open
        if (contest.status !== 'open') {
            return NextResponse.json(
                { success: false, error: 'This contest is no longer accepting entries' },
                { status: 400 }
            )
        }

        // Check if past lock time
        if (new Date() >= contest.locksAt) {
            // Auto-update status to locked
            await prisma.contest.update({
                where: { id: contestId },
                data: { status: 'locked' }
            })

            return NextResponse.json(
                { success: false, error: 'Entries are now locked for this contest' },
                { status: 400 }
            )
        }

        // Check Whop access (skip in demo mode if WHOP_API_KEY not set)
        if (process.env.WHOP_API_KEY) {
            const access = await checkUserAccess(userId, contest.contestDate)
            if (!access.hasAccess) {
                return NextResponse.json(
                    { success: false, error: access.message || 'Access required' },
                    { status: 403 }
                )
            }
        }

        // Check for existing entry
        const existingEntry = await prisma.entry.findUnique({
            where: {
                contestId_userId: {
                    contestId,
                    userId
                }
            }
        })

        if (existingEntry) {
            return NextResponse.json(
                { success: false, error: 'You have already submitted an entry for this contest' },
                { status: 400 }
            )
        }

        // Create the entry
        const entry = await prisma.entry.create({
            data: {
                contestId,
                userId,
                number: Math.round(number)
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                id: entry.id,
                number: entry.number,
                createdAt: entry.createdAt
            }
        })
    } catch (error) {
        console.error('Error submitting entry:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to submit entry' },
            { status: 500 }
        )
    }
}

// GET /api/entries?contestId=xxx - Get user's entry for a contest
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const userId = (session.user as any).id
        const { searchParams } = new URL(request.url)
        const contestId = searchParams.get('contestId')

        if (!contestId) {
            return NextResponse.json(
                { success: false, error: 'Contest ID required' },
                { status: 400 }
            )
        }

        const entry = await prisma.entry.findUnique({
            where: {
                contestId_userId: {
                    contestId,
                    userId
                }
            }
        })

        return NextResponse.json({ success: true, data: entry })
    } catch (error) {
        console.error('Error fetching entry:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch entry' },
            { status: 500 }
        )
    }
}
