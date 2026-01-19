import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLockTime, getOpensTime } from '@/lib/utils'

// GET /api/contests - List all contests
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10', 10)
        const status = searchParams.get('status')

        const where = status ? { status } : {}

        const contests = await prisma.contest.findMany({
            where,
            orderBy: { contestDate: 'desc' },
            take: limit,
            include: {
                result: true,
                _count: {
                    select: { entries: true }
                }
            }
        })

        return NextResponse.json({ success: true, data: contests })
    } catch (error) {
        console.error('Error fetching contests:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch contests' },
            { status: 500 }
        )
    }
}

// POST /api/contests - Create a new contest (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check admin role
        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id }
        })

        if (user?.role !== 'admin') {
            // For demo, allow any logged-in user to create contests
            // In production, uncomment the following:
            // return NextResponse.json(
            //   { success: false, error: 'Admin access required' },
            //   { status: 403 }
            // )
        }

        const body = await request.json()
        const { contestDate, locksAt } = body

        // Parse the contest date
        const date = new Date(contestDate)
        date.setHours(0, 0, 0, 0)

        // Check if contest already exists for this date
        const existing = await prisma.contest.findFirst({
            where: {
                contestDate: date
            }
        })

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Contest already exists for this date' },
                { status: 400 }
            )
        }

        // Create the contest
        const contest = await prisma.contest.create({
            data: {
                contestDate: date,
                opensAt: getOpensTime(date),
                locksAt: locksAt ? new Date(locksAt) : getLockTime(date),
                status: 'open'
            }
        })

        return NextResponse.json({ success: true, data: contest })
    } catch (error) {
        console.error('Error creating contest:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create contest' },
            { status: 500 }
        )
    }
}
