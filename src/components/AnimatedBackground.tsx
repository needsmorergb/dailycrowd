export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#0a0a0a]">
            {/* Grid Overlay */}
            <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                    backgroundImage: `linear-gradient(#4d4d4d 1px, transparent 1px), linear-gradient(90deg, #4d4d4d 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 100%)'
                }}
            />

            {/* Floating Orbs */}
            <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[20%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        </div>
    )
}
