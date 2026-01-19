import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-background py-12">
            <div className="container flex flex-col items-center gap-6 text-center">
                <Link href="/" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <span className="font-bold tracking-widest text-white">CROWD</span>
                </Link>

                <div className="flex gap-6 text-sm text-muted-foreground">
                    <Link href="/rules" className="hover:text-white transition-colors">Rules</Link>
                    <Link href="/results" className="hover:text-white transition-colors">Past Results</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                </div>

                <div className="text-xs text-muted-foreground/50">
                    &copy; {new Date().getFullYear()} Daily Crowd. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
