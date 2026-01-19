import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'CROWD - Daily Crowd Intelligence Game',
  description: 'Predict the crowd. Not the number. Enter one number daily and win if you\'re closest to the median.',
  keywords: ['contest', 'prediction', 'median', 'daily game', 'crowd prediction'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="page-container">
            <Header />
            <main className="main-content">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
