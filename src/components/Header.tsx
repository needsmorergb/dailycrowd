'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
    const { data: session } = useSession()

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-muted">
            <div className="container max-w-6xl flex items-center justify-between py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">C</span>
                    </div>
                    <span className="font-bold text-lg">CROWD</span>
                    <span className="text-xs text-muted-foreground hidden sm:block">DAILY CONSENSUS</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-6">
                    <Link href="/rules" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Rules
                    </Link>
                    <Link href="/results" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Results
                    </Link>
                    <Link href="/today" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        My Entries
                    </Link>

                    {session?.user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/account" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                Account
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="btn btn-secondary text-xs py-2 px-4"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/account" className="btn btn-primary text-xs py-2 px-4">
                            Sign in with Whop
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}
