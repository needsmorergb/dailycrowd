import { prisma } from './prisma'

// Whop API configuration
const WHOP_API_BASE = 'https://api.whop.com/api/v2'
const WHOP_API_KEY = process.env.WHOP_API_KEY || ''
const WHOP_MONTHLY_PRODUCT_ID = process.env.WHOP_MONTHLY_PRODUCT_ID || ''
const WHOP_DAILY_PRODUCT_ID = process.env.WHOP_DAILY_PRODUCT_ID || ''

interface WhopMembership {
    id: string
    status: 'active' | 'expired' | 'canceled' | 'past_due'
    product_id: string
    user_id: string
}

/**
 * Fetch user's Whop memberships
 */
async function fetchWhopMemberships(whopUserId: string): Promise<WhopMembership[]> {
    if (!WHOP_API_KEY) {
        console.warn('WHOP_API_KEY not configured')
        return []
    }

    try {
        const response = await fetch(`${WHOP_API_BASE}/memberships?user_id=${whopUserId}`, {
            headers: {
                'Authorization': `Bearer ${WHOP_API_KEY}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            console.error('Whop API error:', response.status)
            return []
        }

        const data = await response.json()
        return data.data || []
    } catch (error) {
        console.error('Error fetching Whop memberships:', error)
        return []
    }
}

/**
 * Check if user has an active monthly membership
 */
export async function hasActiveMonthlyMembership(whopUserId: string): Promise<boolean> {
    const memberships = await fetchWhopMemberships(whopUserId)

    return memberships.some(
        m => m.product_id === WHOP_MONTHLY_PRODUCT_ID && m.status === 'active'
    )
}

/**
 * Check if user has a daily entry pass for a specific date
 */
export async function hasDailyEntryPass(whopUserId: string, date: Date): Promise<boolean> {
    // For daily passes, we would check licenses or one-time purchases
    // This is a simplified implementation - real implementation would check Whop licenses API
    const memberships = await fetchWhopMemberships(whopUserId)

    // Check for daily product purchases
    // In a full implementation, you'd check the metadata for the specific date
    return memberships.some(
        m => m.product_id === WHOP_DAILY_PRODUCT_ID && m.status === 'active'
    )
}

/**
 * Check if a user has access to submit entries for a given date
 */
export async function checkUserAccess(userId: string, date: Date): Promise<{
    hasAccess: boolean
    accessType: 'monthly' | 'daily' | 'none'
    message?: string
}> {
    // Get user from database
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) {
        return { hasAccess: false, accessType: 'none', message: 'User not found' }
    }

    // If no Whop user ID linked, no access
    if (!user.whopUserId) {
        return {
            hasAccess: false,
            accessType: 'none',
            message: 'Connect your Whop account to participate'
        }
    }

    // Check monthly membership first
    const hasMonthly = await hasActiveMonthlyMembership(user.whopUserId)
    if (hasMonthly) {
        return { hasAccess: true, accessType: 'monthly' }
    }

    // Check daily pass
    const hasDaily = await hasDailyEntryPass(user.whopUserId, date)
    if (hasDaily) {
        return { hasAccess: true, accessType: 'daily' }
    }

    return {
        hasAccess: false,
        accessType: 'none',
        message: 'Unlock access on Whop to participate'
    }
}

/**
 * Get Whop OAuth URL for connecting accounts
 */
export function getWhopOAuthUrl(redirectUri: string): string {
    const clientId = process.env.WHOP_CLIENT_ID || ''
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'user.read memberships.read'
    })

    return `https://whop.com/oauth?${params.toString()}`
}

/**
 * Exchange OAuth code for Whop user info
 */
export async function exchangeWhopCode(code: string, redirectUri: string): Promise<{
    whopUserId: string
    email: string
} | null> {
    const clientId = process.env.WHOP_CLIENT_ID || ''
    const clientSecret = process.env.WHOP_CLIENT_SECRET || ''

    try {
        // Exchange code for token
        const tokenResponse = await fetch('https://api.whop.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        })

        if (!tokenResponse.ok) return null

        const tokenData = await tokenResponse.json()
        const accessToken = tokenData.access_token

        // Get user info
        const userResponse = await fetch('https://api.whop.com/api/v2/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        if (!userResponse.ok) return null

        const userData = await userResponse.json()

        return {
            whopUserId: userData.id,
            email: userData.email
        }
    } catch (error) {
        console.error('Error exchanging Whop code:', error)
        return null
    }
}

/**
 * Verify Whop webhook signature
 */
export function verifyWhopWebhook(payload: string, signature: string): boolean {
    const webhookSecret = process.env.WHOP_WEBHOOK_SECRET || ''

    if (!webhookSecret) {
        console.warn('WHOP_WEBHOOK_SECRET not configured')
        return false
    }

    // In production, implement proper HMAC verification
    // This is a simplified check
    return signature.length > 0
}
