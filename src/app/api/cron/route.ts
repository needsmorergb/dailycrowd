import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLockTime, getOpensTime } from '@/lib/utils'

// POST /api/cron - Create daily contest and lock expired ones
// This should be called by a cron job at midnight PT
export async function POST(request: NextRequest) {
    try {
        // Verify cron secret (optional security)
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const now = new Date()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 1. Lock any open contests that are past their lock time
        const lockedCount = await prisma.contest.updateMany({
            where: {
                status: 'open',
                locksAt: {
                    lte: now
                }
            },
            data: {
                status: 'locked'
            }
        })

        // 2. Create today's contest if it doesn't exist
        const existingToday = await prisma.contest.findFirst({
            where: {
                contestDate: today
            }
        })

        let createdContest = null
        if (!existingToday) {
            createdContest = await prisma.contest.create({
                data: {
                    contestDate: today,
                    opensAt: getOpensTime(today),
                    locksAt: getLockTime(today),
                    status: 'open'
                }
            })
        }

        // 3. Create tomorrow's contest in advance
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const existingTomorrow = await prisma.contest.findFirst({
            where: {
                contestDate: tomorrow
            }
        })

        let createdTomorrowContest = null
        if (!existingTomorrow) {
            createdTomorrowContest = await prisma.contest.create({
                data: {
                    contestDate: tomorrow,
                    opensAt: getOpensTime(tomorrow),
                    locksAt: getLockTime(tomorrow),
                    status: 'open'
                }
            })
        }

        return NextResponse.json({
            success: true,
            data: {
                lockedContests: lockedCount.count,
                createdToday: createdContest ? true : false,
                createdTomorrow: createdTomorrowContest ? true : false
            }
        })
    } catch (error) {
        console.error('Error in cron job:', error)
        return NextResponse.json(
            { success: false, error: 'Cron job failed' },
            { status: 500 }
        )
    }
}

// GET /api/cron - Check cron status (for debugging)
export async function GET() {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todayContest = await prisma.contest.findFirst({
            where: {
                contestDate: today
            },
            include: {
                _count: {
                    select: { entries: true }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                today: today.toISOString(),
                todayContest: todayContest ? {
                    id: todayContest.id,
                    status: todayContest.status,
                    locksAt: todayContest.locksAt,
                    entriesCount: todayContest._count.entries
                } : null
            }
        })
    } catch (error) {
        console.error('Error checking cron status:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to check status' },
            { status: 500 }
        )
    }
}
