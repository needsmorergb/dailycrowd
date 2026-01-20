import type { Metadata } from 'next'
import { Outfit, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'
import AnimatedBackground from '@/components/AnimatedBackground'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

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
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${inter.variable} font-sans min-h-screen text-foreground antialiased selection:bg-primary selection:text-black`}>
        <Providers>
          <AnimatedBackground />
          <div className="relative z-10 min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container max-w-6xl mx-auto px-4">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
