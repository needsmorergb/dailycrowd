import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-muted py-12 mt-auto">
            <div className="container max-w-6xl">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">C</span>
                            </div>
                            <span className="font-bold">CROWD</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            The daily social consensus game. Test your intuition,
                            climb the ranks, and share the rewards based on the
                            wisdom of the crowd.
                        </p>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="font-bold mb-4 text-sm">Platform</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/rules" className="hover:text-primary transition-colors">
                                    Game Rules
                                </Link>
                            </li>
                            <li>
                                <Link href="/results" className="hover:text-primary transition-colors">
                                    Results
                                </Link>
                            </li>
                            <li>
                                <Link href="/today" className="hover:text-primary transition-colors">
                                    Play Today
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="font-bold mb-4 text-sm">Connect</h4>
                        <div className="flex gap-3">
                            <a href="#" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                                💬
                            </a>
                            <a href="#" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                                ✉️
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-muted mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        © 2026 CROWD. All rights reserved. Powered by Whop.
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                        <Link href="#" className="hover:text-primary">Terms of Service</Link>
                        <Link href="#" className="hover:text-primary">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
