import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Providers from '@/components/Providers'

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CROWD Oracle React Component Design',
  description: 'Predict ROI. Win SOL.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${jetbrains.variable} font-mono bg-[#0A0A0A] text-white overflow-x-hidden selection:bg-acid-green selection:text-black`}>
        <Providers>
          {/* Scanlines Effect */}
          <div className="fixed inset-0 z-50 pointer-events-none scanlines"></div>

          <div className="relative min-h-screen flex flex-col bg-[#0A0A0A] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            <Header />
            <main className="flex-1 max-w-[1800px] mx-auto w-full">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
