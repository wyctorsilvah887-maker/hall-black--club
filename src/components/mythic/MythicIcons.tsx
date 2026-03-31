
import React from 'react';

export const CollarIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 10a7 7 0 0 1 14 0c0 4-4 7-7 7s-7-3-7-7Z" />
    <path d="M12 17v4" />
    <circle cx="12" cy="21" r="1" />
    <path d="M3 10a9 9 0 0 1 18 0" />
  </svg>
);

export const RubyShield = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" 
      fill="currentColor" 
      fillOpacity="0.2"
      stroke="currentColor" 
      strokeWidth="2" 
    />
    <path 
      d="M12 8l2 4h4l-3 2 1 4-4-2-4 2 1-4-3-2h4l2-4z" 
      fill="currentColor"
    />
  </svg>
);
