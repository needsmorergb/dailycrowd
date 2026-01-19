import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exchangeWhopCode } from '@/lib/whop'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
    const session = await auth()

    if (!session?.user) {
        return redirect('/account?error=unauthorized')
    }

    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
        return redirect('/account?error=no_code')
    }

    // Determine redirect URI (must match the login one)
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = req.headers.get('host')
    const redirectUri = `${protocol}://${host}/api/auth/whop/callback`

    const whopData = await exchangeWhopCode(code, redirectUri)

    if (!whopData) {
        return redirect('/account?error=exchange_failed')
    }

    // Update user with Whop ID
    await prisma.user.update({
        where: { id: session.user.id },
        data: { whopUserId: whopData.whopUserId }
    })

    return redirect('/account?success=whop_connected')
}
