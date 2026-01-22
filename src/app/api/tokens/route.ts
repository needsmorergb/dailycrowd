import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');

    try {
        if (source === 'pump') {
            const response = await fetch('https://frontend-api.pump.fun/coins/latest?limit=50&offset=0', {
                cache: 'no-store'
            });
            if (!response.ok) return NextResponse.json({ error: 'Pump.fun fetch failed' }, { status: 500 });
            return NextResponse.json(await response.json());
        }

        // Default: Dexscreener
        const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112', {
            next: { revalidate: 30 }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Dexscreener fetch failed' }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
