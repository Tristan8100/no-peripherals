export const Crosshair = ({ className = '', opacity = 0.3 }: { className?: string; opacity?: number }) => (
  <svg
    viewBox="0 0 200 200"
    className={`absolute ${className}`}
    style={{ opacity }}
  >
    <circle cx="100" cy="100" r="80" fill="none" stroke="#8B0000" strokeWidth="1" />
    <circle cx="100" cy="100" r="60" fill="none" stroke="#8B0000" strokeWidth="1" />
    <circle cx="100" cy="100" r="40" fill="none" stroke="#8B0000" strokeWidth="1" />
    <line x1="100" y1="20" x2="100" y2="180" stroke="#8B0000" strokeWidth="1" />
    <line x1="20" y1="100" x2="180" y2="100" stroke="#8B0000" strokeWidth="1" />
    <circle cx="100" cy="100" r="5" fill="#8B0000" />
  </svg>
);

export const TargetBracket = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`absolute ${className}`}>
    {/* Top-left */}
    <path d="M 10 10 L 30 10 L 30 30" fill="none" stroke="#8B0000" strokeWidth="1.5" />
    {/* Top-right */}
    <path d="M 90 10 L 70 10 L 70 30" fill="none" stroke="#8B0000" strokeWidth="1.5" />
    {/* Bottom-left */}
    <path d="M 10 90 L 30 90 L 30 70" fill="none" stroke="#8B0000" strokeWidth="1.5" />
    {/* Bottom-right */}
    <path d="M 90 90 L 70 90 L 70 70" fill="none" stroke="#8B0000" strokeWidth="1.5" />
  </svg>
);

export const RecordingDot = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`animate-pulse ${className}`}>
    <circle cx="12" cy="12" r="8" fill="#8B0000" />
  </svg>
);

export const CornerBrackets = () => (
  <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full pointer-events-none">
    {/* Top-left */}
    <path d="M 20 20 L 60 20 M 20 20 L 20 60" fill="none" stroke="#8B0000" strokeWidth="1.5" opacity="0.3" />
    {/* Top-right */}
    <path d="M 280 20 L 240 20 M 280 20 L 280 60" fill="none" stroke="#8B0000" strokeWidth="1.5" opacity="0.3" />
    {/* Bottom-left */}
    <path d="M 20 280 L 60 280 M 20 280 L 20 240" fill="none" stroke="#8B0000" strokeWidth="1.5" opacity="0.3" />
    {/* Bottom-right */}
    <path d="M 280 280 L 240 280 M 280 280 L 280 240" fill="none" stroke="#8B0000" strokeWidth="1.5" opacity="0.3" />
  </svg>
);

export const VignetteMask = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 400 300" className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}>
    <defs>
      <radialGradient id="vignetteGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style={{ stopColor: '#000000', stopOpacity: 0 }} />
        <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0.4 }} />
      </radialGradient>
    </defs>
    <rect width="400" height="300" fill="url(#vignetteGradient)" />
  </svg>
);

export const ScrollingHexCode = ({ delay = 0 }: { delay?: number }) => (
  <div className="text-xs font-mono text-red-900 opacity-20 whitespace-nowrap">
    <style>{`
      @keyframes scroll-hex {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }
      .hex-scroll {
        animation: scroll-hex 8s linear infinite;
        animation-delay: ${delay}s;
      }
    `}</style>
    <div className="hex-scroll">
      0x8B0000_2B3B60_0A0A0A_FFFFFF_3D3D3D_FF0000
    </div>
  </div>
);

export const FloatingDataString = ({ label, value, className = '' }: { label: string; value: string; className?: string }) => (
  <div className={`absolute font-mono text-xs text-red-900 opacity-50 ${className}`}>
    <div>{label}</div>
    <div className="font-bold">{value}</div>
  </div>
);
