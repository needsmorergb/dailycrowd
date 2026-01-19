'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
    const { data: session, status } = useSession()

    return (
        <header className="header">
            <div className="header-container">
                <Link href="/" className="header-logo">
                    <span className="logo-icon">👁️</span>
                    <span className="logo-text">CROWD</span>
                </Link>

                <nav className="header-nav">
                    <Link href="/today" className="nav-link">Today</Link>
                    <Link href="/results" className="nav-link">Results</Link>
                    <Link href="/rules" className="nav-link">Rules</Link>

                    {status === 'loading' ? (
                        <span className="nav-link">Loading...</span>
                    ) : session ? (
                        <div className="nav-user">
                            <Link href="/account" className="nav-link nav-user-link">
                                {session.user?.name || session.user?.email}
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="nav-link nav-signout"
                            >
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <Link href="/account" className="nav-link nav-signin">
                            Sign in
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}
