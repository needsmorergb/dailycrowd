import { NextRequest, NextResponse } from 'next/server';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Origin': 'https://pump.fun',
    'Referer': 'https://pump.fun/'
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');

    try {
        if (source === 'pump') {
            console.log('Proxying Pump.fun fetch...');
            const response = await fetch('https://frontend-api.pump.fun/coins/latest?limit=50&offset=0', {
                headers: HEADERS,
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Pump.fun proxy failed: ${response.status} ${errorText}`);
                return NextResponse.json({ error: `Pump.fun failed: ${response.status}` }, { status: response.status });
            }

            const data = await response.json();
            return NextResponse.json(data);
        }

        // Default: Dexscreener
        console.log('Proxying Dexscreener fetch...');
        const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112', {
            headers: HEADERS,
            next: { revalidate: 30 }
        });

        if (!response.ok) {
            console.error(`Dexscreener proxy failed: ${response.status}`);
            return NextResponse.json({ error: `Dexscreener failed: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
