import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CROWD | The Memecoin Oracle',
  description: 'Predict ROI. Win SOL. The first specialized prediction market for pump.fun bonding curves.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className={`${jakarta.variable} ${spaceMono.variable} font-display min-h-screen bg-background text-foreground antialiased selection:bg-accent selection:text-primary`}>
        <Providers>
          <div className="relative min-h-screen flex flex-col grid-bg">
            <Header />
            <main className="flex-grow container max-w-[1600px] mx-auto px-4 md:px-10 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
