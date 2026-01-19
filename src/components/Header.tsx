'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
    const { data: session, status } = useSession()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="relative w-8 h-8">
                        {/* Fallback to emoji if image fails, but try image first. 
                            Since we copied logo.png, we assume it's there. 
                            Using a simple img tag for simplicity or Next Image if configured. 
                            Let's use the Emoji + Text for now as a safe fallback if logo.png caching is weird, 
                            but apply the new styles. 
                         */}
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-bold text-xl tracking-widest text-white">CROWD</span>
                </Link>

                <nav className="flex items-center gap-6">
                    <Link href="/today" className="text-sm font-medium text-muted-foreground transition-colors hover:text-white">
                        TODAY
                    </Link>
                    <Link href="/results" className="text-sm font-medium text-muted-foreground transition-colors hover:text-white">
                        RESULTS
                    </Link>
                    <Link href="/rules" className="text-sm font-medium text-muted-foreground transition-colors hover:text-white">
                        RULES
                    </Link>

                    {status === 'loading' ? (
                        <span className="text-sm text-muted-foreground">...</span>
                    ) : session ? (
                        <div className="flex items-center gap-4">
                            <Link href="/account" className="hidden sm:block text-sm font-medium text-white hover:text-primary">
                                {session.user?.name || 'Account'}
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="text-xs border border-white/20 rounded-md px-3 py-1.5 text-muted-foreground hover:bg-white/5 hover:text-white transition-all"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/account" className="btn btn-primary text-sm px-5 py-2 h-auto rounded-lg shadow-none">
                            Sign In
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}
