import { NextRequest, NextResponse } from 'next/server'
import { verifyWhopWebhook } from '@/lib/whop'

// Whop sends various events. We primarily care about membership updates.
export async function POST(req: NextRequest) {
    const signature = req.headers.get('whop-signature') || ''
    const body = await req.text()

    // Verify webhook signature
    // Note: In development/demo specific verification might be loose
    if (!verifyWhopWebhook(body, signature)) {
        console.error('Invalid Whop webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    try {
        const event = JSON.parse(body)
        console.log('Received Whop event:', event.type, event.data?.id)

        // TODO: Handle specific events like 'membership.gone_active' or 'membership.gone_inactive'
        // For now, we rely on checking API on-demand for accuracy, so we just log this.
        // In a high-scale app, we would cache the membership status in our DB here.

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Error processing webhook:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
