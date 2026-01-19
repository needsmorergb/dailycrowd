'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AccountPage() {
    const { data: session, status } = useSession()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleDemoSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        await signIn('credentials', { email, redirect: false })
        setLoading(false)
    }

    if (status === 'loading') {
        return (
            <div className="container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading...
                </div>
            </div>
        )
    }

    // Signed in view
    if (session?.user) {
        const user = session.user as any

        return (
            <div className="container">
                <div className="auth-container">
                    <div className="auth-card">
                        <h1 className="auth-title">Your Account</h1>

                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                {user.name || user.email}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {user.email}
                            </p>
                        </div>

                        {/* Whop Status */}
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Membership Status</h3>
                            {user.whopUserId ? (
                                <div className="message message-success">
                                    ✓ Whop account connected
                                </div>
                            ) : (
                                <>
                                    <div className="message message-info">
                                        Connect your Whop account to access contests
                                    </div>
                                    <a
                                        href="/api/auth/whop/login"
                                        className="btn btn-primary"
                                        style={{ width: '100%', marginTop: '12px' }}
                                    >
                                        Connect Whop Account
                                    </a>
                                </>
                            )}
                        </div>

                        {/* User Stats (placeholder) */}
                        <div className="user-stats">
                            <div className="user-stat">
                                <div className="user-stat-value">0</div>
                                <div className="user-stat-label">Entries</div>
                            </div>
                            <div className="user-stat">
                                <div className="user-stat-value">0</div>
                                <div className="user-stat-label">Wins</div>
                            </div>
                            <div className="user-stat">
                                <div className="user-stat-value">0</div>
                                <div className="user-stat-label">Streak</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <Link href="/today" className="btn btn-primary" style={{ flex: 1 }}>
                                Play Today
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Sign in view
    return (
        <div className="container">
            <div className="auth-container">
                <div className="auth-card">
                    <h1 className="auth-title">Sign In</h1>

                    <button
                        onClick={() => signIn('google')}
                        className="btn btn-secondary"
                        style={{ width: '100%', marginBottom: '16px' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="auth-divider">or</div>

                    <form onSubmit={handleDemoSignIn} className="auth-form">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            required
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !email}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Signing in...' : 'Continue with Email (Demo)'}
                        </button>
                    </form>

                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        marginTop: '16px'
                    }}>
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}
