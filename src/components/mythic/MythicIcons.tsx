
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

export const RankBadge = ({ status, className }: { status?: string, className?: string }) => {
  const isLegendary = status === 'LEGENDARY';
  const isAmber = status === 'AMBER';
  
  // Cores dinâmicas baseadas no status
  const primaryColor = isLegendary ? '#FFD700' : isAmber ? '#F59E0B' : '#8B0000';
  const secondaryColor = isLegendary ? '#B8860B' : isAmber ? '#D97706' : '#000000';
  const textColor = isLegendary ? '#4B3621' : isAmber ? '#4B3621' : '#FFFFFF';
  const labelText = isLegendary ? 'LENDÁRIO' : isAmber ? 'LEGENDÁRIO' : 'MÍTICO';

  return (
    <div className={`relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-1000 ${className}`}>
      <svg width="220" height="100" viewBox="0 0 220 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
        {/* Definições de Gradientes para Metal Realista */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="50%" stopColor="#FFF2AC" />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="50%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Asas Spread - Esquerda */}
        <path d="M100 40 Q70 20 40 40 L30 35 Q60 10 100 30 Z" fill="url(#wingGradient)" stroke={secondaryColor} strokeWidth="0.5" />
        <path d="M90 45 Q60 25 35 45 L25 40 Q50 15 90 35 Z" fill="url(#wingGradient)" stroke={secondaryColor} strokeWidth="0.5" />
        
        {/* Asas Spread - Direita */}
        <path d="M120 40 Q150 20 180 40 L190 35 Q160 10 120 30 Z" fill="url(#wingGradient)" stroke={secondaryColor} strokeWidth="0.5" />
        <path d="M130 45 Q160 25 185 45 L195 40 Q170 15 130 35 Z" fill="url(#wingGradient)" stroke={secondaryColor} strokeWidth="0.5" />

        {/* Estrutura Central - Multi-tiered Shield */}
        <path d="M60 30 L160 30 L170 50 L110 85 L50 50 Z" fill="url(#goldGradient)" stroke={secondaryColor} strokeWidth="1" />
        <path d="M65 35 L155 35 L162 48 L110 78 L58 48 Z" fill="rgba(0,0,0,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />

        {/* Placa Convexa Central */}
        <path d="M70 42 C80 38, 140 38, 150 42 L155 58 C145 62, 75 62, 65 58 Z" fill="url(#goldGradient)" filter="url(#glow)" />
        
        {/* Textos Engraved */}
        <text x="110" y="52" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" fill={textColor} textAnchor="middle" style={{ letterSpacing: '1px' }}>{labelText}</text>
        <text x="110" y="65" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="5" fill={textColor} opacity="0.8" textAnchor="middle" style={{ letterSpacing: '2px' }}>STATUS ESPECIAL</text>
        
        {/* Detalhe de Brilho Inferior */}
        <path d="M100 80 L110 85 L120 80" stroke="#FFF" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      </svg>
    </div>
  );
};
