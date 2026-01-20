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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${jakarta.variable} ${spaceMono.variable} bg-background-light dark:bg-background-dark font-display text-primary min-h-screen antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen w-full flex-col grid-bg bg-opacity-5">
            <Header />
            <main>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
