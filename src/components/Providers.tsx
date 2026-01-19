'use client'

import { SessionProvider } from 'next-auth/react'
import { SolanaProvider } from './SolanaProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SolanaProvider>
            <SessionProvider>
                {children}
            </SessionProvider>
        </SolanaProvider>
    )
}
