interface ScriboLogoProps {
  className?: string;
  size?: number;
}

const ScriboLogo = ({ className = "", size = 48 }: ScriboLogoProps) => {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        {/* Vibrant teal to cyan gradient */}
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#06b6d4", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#0891b2", stopOpacity: 1 }}
          />
        </linearGradient>

        {/* Accent gradient for pen */}
        <linearGradient id="penGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#f97316", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#ea580c", stopOpacity: 1 }}
          />
        </linearGradient>

        {/* Shadow */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.25" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background rounded square */}
      <rect
        x="10"
        y="10"
        width="180"
        height="180"
        rx="45"
        fill="url(#bgGradient)"
        filter="url(#shadow)"
      />

      {/* Creative "S" letter formed by a flowing writing path */}
      <g transform="translate(100, 100)">
        {/* Main flowing S shape with pen trail effect */}
        <path
          d="M -30,-40 Q -40,-25 -30,-10 Q -20,5 0,5 Q 20,5 30,20 Q 40,35 30,50"
          fill="none"
          stroke="white"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.95"
        />

        {/* Inner highlight on the S */}
        <path
          d="M -30,-40 Q -40,-25 -30,-10 Q -20,5 0,5 Q 20,5 30,20 Q 40,35 30,50"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Decorative dots following the curve */}
        <circle cx="-35" cy="-45" r="4" fill="white" opacity="0.8" />
        <circle cx="-25" cy="-35" r="3" fill="white" opacity="0.6" />
        <circle cx="-18" cy="-25" r="2.5" fill="white" opacity="0.5" />
      </g>

      {/* Modern stylized pen positioned at the end of the S - BIGGER AND MORE VISIBLE */}
      <g transform="translate(130, 140) rotate(25)">
        {/* Pen body with gradient - increased size */}
        <rect
          x="0"
          y="0"
          width="16"
          height="60"
          rx="3"
          fill="url(#penGradient)"
        />

        {/* Pen grip texture */}
        <line
          x1="2"
          y1="20"
          x2="14"
          y2="20"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1.5"
        />
        <line
          x1="2"
          y1="27"
          x2="14"
          y2="27"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1.5"
        />
        <line
          x1="2"
          y1="34"
          x2="14"
          y2="34"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1.5"
        />

        {/* Pen tip - bigger */}
        <polygon points="0,60 16,60 8,75" fill="#1f2937" />
        <polygon points="4,60 12,60 8,68" fill="#4b5563" />

        {/* Shine on pen */}
        <rect
          x="11"
          y="5"
          width="3"
          height="48"
          rx="1.5"
          fill="white"
          opacity="0.5"
        />

        {/* Pen cap detail */}
        <rect
          x="0"
          y="0"
          width="16"
          height="8"
          rx="3"
          fill="#dc2626"
          opacity="0.8"
        />
      </g>

      {/* Subtle sparkle effects */}
      <g opacity="0.7">
        <circle cx="60" cy="60" r="2" fill="white" />
        <circle cx="145" cy="70" r="1.5" fill="white" />
        <circle cx="70" cy="140" r="2.5" fill="white" />
      </g>
    </svg>
  );
};

export default ScriboLogo;
