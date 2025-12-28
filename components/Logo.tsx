import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'color' | 'white' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = "", variant = 'color' }) => {
  // Colors based on variant
  const strokeColor = variant === 'white' ? '#ffffff' : variant === 'dark' ? '#1e293b' : 'url(#logo_gradient)';
  const fillColor = variant === 'white' ? 'rgba(255,255,255,0.1)' : variant === 'dark' ? 'rgba(30,41,59,0.1)' : 'url(#logo_gradient_soft)';
  const dotColor = variant === 'color' ? '#3b82f6' : 'currentColor';

  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo_gradient" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" /> {/* blue-600 */}
          <stop offset="100%" stopColor="#7c3aed" /> {/* violet-600 */}
        </linearGradient>
        <linearGradient id="logo_gradient_soft" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.1" /> 
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" /> 
        </linearGradient>
      </defs>

      {/* Main Shield Shape */}
      <path 
        d="M50 92C50 92 88 78 88 50V22L50 8L12 22V50C12 78 50 92 50 92Z" 
        fill={fillColor}
        stroke={strokeColor} 
        strokeWidth="6"
        strokeLinejoin="round"
      />
      
      {/* Inner "Mind" Curve (Smile/Calmness) */}
      <path 
        d="M32 52C32 52 38 65 50 65C62 65 68 52 68 52" 
        stroke={strokeColor} 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Mind Dot / Spark */}
      <circle cx="50" cy="38" r="7" fill={dotColor} />
    </svg>
  );
};

export default Logo;