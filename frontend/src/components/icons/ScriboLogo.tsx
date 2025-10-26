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
      {/* Clean white logo for teal background */}
      <rect
        x="10"
        y="10"
        width="180"
        height="180"
        rx="45"
        fill="#14b8a6" // matches from-teal-500 background
      />

      {/* "S" shape in white */}
      <g transform="translate(100, 100)">
        <path
          d="M -30,-40 Q -40,-25 -30,-10 Q -20,5 0,5 Q 20,5 30,20 Q 40,35 30,50"
          fill="none"
          stroke="#ffffff"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Subtle highlight for depth */}
        <path
          d="M -30,-40 Q -40,-25 -30,-10 Q -20,5 0,5 Q 20,5 30,20 Q 40,35 30,50"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Dots accent */}
        <circle cx="-35" cy="-45" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="-25" cy="-35" r="3" fill="#ffffff" opacity="0.6" />
        <circle cx="-18" cy="-25" r="2.5" fill="#ffffff" opacity="0.5" />
      </g>

      {/* Enhanced pen with better visibility */}
      <g transform="translate(130, 140) rotate(25)">
        {/* Pen body - darker for contrast */}
        <rect x="0" y="0" width="10" height="45" rx="2" fill="#f97316" />
        
        {/* Pen grip lines */}
        <line x1="1" y1="15" x2="9" y2="15" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        <line x1="1" y1="20" x2="9" y2="20" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        <line x1="1" y1="25" x2="9" y2="25" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        
        {/* Pen tip */}
        <polygon points="0,45 10,45 5,55" fill="#1f2937" />
        <polygon points="3,45 7,45 5,50" fill="#4b5563" />
        
        {/* Shine on pen */}
        <rect x="7" y="3" width="2" height="35" rx="1" fill="white" opacity="0.5" />
        
        {/* Pen cap detail */}
        <rect x="0" y="0" width="10" height="5" rx="2" fill="#dc2626" opacity="0.8" />
      </g>
    </svg>
  );
};

export default ScriboLogo;