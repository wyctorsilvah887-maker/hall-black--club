
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
  
  // Paleta de cores baseada na descrição de luxo
  const primaryColor = isLegendary ? '#FFD700' : isAmber ? '#F59E0B' : '#8B0000';
  const secondaryColor = isLegendary ? '#B8860B' : isAmber ? '#D97706' : '#2A0000';
  const textColor = isLegendary || isAmber ? '#4B3621' : '#FFFFFF';
  const labelText = isLegendary ? 'LENDÁRIO' : isAmber ? 'LEGENDÁRIO' : 'MÍTICO';

  return (
    <div className={`relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-1000 ${className}`}>
      <svg width="260" height="120" viewBox="0 0 260 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_25px_rgba(0,0,0,0.9)]">
        <defs>
          <linearGradient id="metalGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="50%" stopColor="#FFF2AC" />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          
          <linearGradient id="wingGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.4" />
          </linearGradient>

          <filter id="volumetricGlow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* ASAS MAJESTOSAS - Lado Esquerdo (Detalhamento Intricado) */}
        <g className="animate-pulse" style={{ animationDuration: '5s' }}>
          {/* Camada Superior da Asa */}
          <path d="M110 45 Q70 10 30 40 L20 35 Q60 5 110 35 Z" fill="url(#metalGold)" stroke={secondaryColor} strokeWidth="0.5" />
          {/* Penas do Meio */}
          <path d="M100 55 Q60 25 35 55 L25 50 Q55 20 100 45 Z" fill="url(#wingGlow)" stroke={secondaryColor} strokeWidth="0.5" />
          {/* Penas Inferiores */}
          <path d="M90 65 Q50 40 40 70 L30 65 Q45 30 90 55 Z" fill="url(#wingGlow)" stroke={secondaryColor} strokeWidth="0.5" />
        </g>

        {/* ASAS MAJESTOSAS - Lado Direito (Espelhamento) */}
        <g className="animate-pulse" style={{ animationDuration: '5s' }}>
          <path d="M150 45 Q190 10 230 40 L240 35 Q200 5 150 35 Z" fill="url(#metalGold)" stroke={secondaryColor} strokeWidth="0.5" />
          <path d="M160 55 Q200 25 225 55 L235 50 Q205 20 160 45 Z" fill="url(#wingGlow)" stroke={secondaryColor} strokeWidth="0.5" />
          <path d="M170 65 Q210 40 220 70 L230 65 Q215 30 170 55 Z" fill="url(#wingGlow)" stroke={secondaryColor} strokeWidth="0.5" />
        </g>

        {/* ESTRUTURA CENTRAL DO ESCUDO (Multi-tiered Gold) */}
        <path d="M75 35 L185 35 L195 55 L130 95 L65 55 Z" fill="url(#metalGold)" stroke={secondaryColor} strokeWidth="2" filter="url(#volumetricGlow)" />
        
        {/* Camada de Profundidade Interna */}
        <path d="M82 40 L178 40 L186 53 L130 88 L74 53 Z" fill="rgba(0,0,0,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />

        {/* PLACA CONVEXA CENTRAL (Onde o nome é gravado) */}
        <path d="M85 46 C95 42, 165 42, 175 46 L180 62 C170 66, 90 66, 80 62 Z" fill="url(#metalGold)" filter="url(#volumetricGlow)" />
        
        {/* TEXTO ENGRAVED - Tipografia de Autoridade */}
        <text x="130" y="56" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="12" fill={textColor} textAnchor="middle" style={{ letterSpacing: '2px', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{labelText}</text>
        <text x="130" y="68" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="6" fill={textColor} opacity="0.8" textAnchor="middle" style={{ letterSpacing: '4px' }}>STATUS ESPECIAL</text>
        
        {/* DETALHES DE BRILHO E ACABAMENTO */}
        <path d="M120 88 L130 95 L140 88" stroke="#FFF" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <circle cx="130" cy="35" r="3" fill="#FFF" opacity="0.2" />
      </svg>
    </div>
  );
};
