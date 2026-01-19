import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <span className="logo-icon">👁️</span>
                    <span>CROWD</span>
                </div>

                <nav className="footer-nav">
                    <Link href="/rules">Rules</Link>
                    <Link href="/results">Past Results</Link>
                    <a
                        href="https://whop.com"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Powered by Whop
                    </a>
                </nav>

                <p className="footer-copy">
                    © {new Date().getFullYear()} CROWD. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
