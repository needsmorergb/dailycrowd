import { prisma } from '@/lib/prisma'
import OracleTerminal from '@/components/OracleTerminal'
import { getHistoricalMedianROI } from '@/lib/pump_api'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const historicalMedian = await getHistoricalMedianROI()
    return {
      historicalMedian: historicalMedian,
      hasWinners: false, // temporarily disabled winners feed for terminal layout
      recentWinners: []
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      historicalMedian: 4.8,
      hasWinners: false,
      recentWinners: []
    }
  }
}

export default async function LandingPage() {
  const stats = await getStats()

  return (
    <div className="py-8 min-h-[calc(100vh-100px)] flex items-center justify-center">
      <OracleTerminal />
    </div>
  )
}
