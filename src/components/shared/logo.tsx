export function AppLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      width={size}
      height={size}
    >
      {/* Pyramid body */}
      <path d="M256 180 L420 420 L92 420 Z" stroke="#D4690E" strokeWidth="14" fill="none" strokeLinejoin="round" />
      {/* Inner pyramid subtle line */}
      <path d="M256 230 L370 400 L142 400 Z" stroke="#D4690E" strokeWidth="6" fill="none" strokeLinejoin="round" opacity="0.3" />
      {/* EGP Pound symbol inside pyramid */}
      <text x="256" y="370" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="80" fill="#D4690E">£</text>
      {/* Eye shape */}
      <path d="M196 100 Q256 50 316 100 Q256 150 196 100 Z" stroke="#D4690E" strokeWidth="10" fill="none" strokeLinejoin="round" />
      {/* Pupil */}
      <circle cx="256" cy="100" r="18" fill="#D4690E" />
      {/* Inner pupil highlight */}
      <circle cx="250" cy="95" r="5" fill="white" />
      {/* Rays from eye */}
      <line x1="256" y1="130" x2="256" y2="155" stroke="#D4690E" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <line x1="220" y1="125" x2="210" y2="148" stroke="#D4690E" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <line x1="292" y1="125" x2="302" y2="148" stroke="#D4690E" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
