'use client'


import { SolanaProvider } from './SolanaProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SolanaProvider>
            {children}
        </SolanaProvider>
    )
}
