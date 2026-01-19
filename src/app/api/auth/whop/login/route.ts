import { auth } from '@/lib/auth'
import { getWhopOAuthUrl } from '@/lib/whop'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
    const session = await auth()

    if (!session?.user) {
        return redirect('/account?error=unauthorized')
    }

    // Determine redirect URI based on environment
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = req.headers.get('host')
    const redirectUri = `${protocol}://${host}/api/auth/whop/callback`

    const url = getWhopOAuthUrl(redirectUri)
    return redirect(url)
}
