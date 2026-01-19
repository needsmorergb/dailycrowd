import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeContestStats } from '@/lib/game'

// POST /api/settle - Settle a contest (admin only)
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
            // For demo, allow any logged-in user to settle
            // In production, uncomment the following:
            // return NextResponse.json(
            //   { success: false, error: 'Admin access required' },
            //   { status: 403 }
            // )
        }

        const body = await request.json()
        const { contestId } = body

        // Get the contest with entries
        const contest = await prisma.contest.findUnique({
            where: { id: contestId },
            include: {
                entries: true,
                result: true
            }
        })

        if (!contest) {
            return NextResponse.json(
                { success: false, error: 'Contest not found' },
                { status: 404 }
            )
        }

        if (contest.result) {
            return NextResponse.json(
                { success: false, error: 'Contest has already been settled' },
                { status: 400 }
            )
        }

        if (contest.entries.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No entries to settle' },
                { status: 400 }
            )
        }

        // Compute stats and winner
        const stats = computeContestStats(contest.entries)

        if (!stats.winner) {
            return NextResponse.json(
                { success: false, error: 'Could not determine winner' },
                { status: 500 }
            )
        }

        // Create result and update contest status
        const [result] = await prisma.$transaction([
            prisma.contestResult.create({
                data: {
                    contestId,
                    median: stats.median,
                    mean: stats.mean,
                    mode: stats.mode,
                    min: stats.min,
                    max: stats.max,
                    totalEntries: stats.totalEntries,
                    winnerUserId: stats.winner.userId,
                    winnerEntryNumber: stats.winnerEntryNumber,
                    winnerTime: stats.winnerTime,
                    distribution: JSON.stringify(stats.distribution)
                }
            }),
            prisma.contest.update({
                where: { id: contestId },
                data: {
                    status: 'settled',
                    settledAt: new Date()
                }
            })
        ])

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error('Error settling contest:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to settle contest' },
            { status: 500 }
        )
    }
}
