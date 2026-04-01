import React from 'react';
import { cn } from '@/lib/utils';

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

interface RankBadgeProps {
  status?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export const RankBadge = ({ status, className, size = 'md', id }: RankBadgeProps) => {
  const isLegendary = status === 'LEGENDARY';
  const isAmber = status === 'AMBER';
  const isMythic = status === 'MYTHIC' || !status;
  
  const scale = size === 'sm' ? 'scale-[0.6]' : size === 'lg' ? 'scale-125' : 'scale-100';

  // Configuração de cores baseada no status
  const colors = {
    primary: isLegendary ? '#FFD700' : isAmber ? '#F59E0B' : '#ff1a1a',
    secondary: isLegendary ? '#B8860B' : isAmber ? '#D97706' : '#660000',
    vibrant: isLegendary ? '#FFF2AC' : isAmber ? '#fbbf24' : '#ff4d4d',
    deep: isLegendary ? '#bf953f' : isAmber ? '#d97706' : '#b30000',
    aura: isLegendary ? 'rgba(255,215,0,0.2)' : isAmber ? 'rgba(245,158,11,0.2)' : 'rgba(255,0,0,0.3)',
  };

  const labelText = isLegendary ? 'LENDÁRIO' : isAmber ? 'LEGENDÁRIO' : 'MÍTICO';
  const starsCount = isMythic ? 6 : 5;
  const displayId = id ? `HB-${id.slice(0, 5).toUpperCase()}` : 'HB-XXXXX';

  return (
    <div className={cn("relative flex items-center justify-center select-none pointer-events-none transition-transform duration-700", scale, className)}>
      {/* Pulsating Aura */}
      <div 
        className="absolute inset-0 blur-[50px] rounded-full animate-pulse" 
        style={{ backgroundColor: colors.aura }}
      />
      
      <svg 
        width="260" 
        height="100" 
        viewBox="0 0 260 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
      >
        <defs>
          {/* Metal Gradiente */}
          <linearGradient id="metal-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="30%" stopColor={colors.vibrant} />
            <stop offset="50%" stopColor={colors.deep} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>

          {/* Cromo Negro Profundo */}
          <linearGradient id="dark-chrome-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#444" />
            <stop offset="50%" stopColor="#111" />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>

          {/* Brilho do Texto */}
          <linearGradient id="text-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="50%" stopColor={isMythic ? '#ffcccc' : '#fff2ac'} />
            <stop offset="100%" stopColor={colors.primary} />
          </linearGradient>

          {/* Máscara de Brilho Metálico (Sweep) */}
          <linearGradient id="sweep-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="40%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.9" />
            <stop offset="60%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <mask id="text-flash-mask">
            <text 
              x="130" 
              y="58" 
              textAnchor="middle" 
              fill="white"
              style={{ 
                fontFamily: 'system-ui, sans-serif', 
                fontWeight: '900', 
                fontSize: '22px', 
                letterSpacing: '4px'
              }}
            >
              {labelText}
            </text>
          </mask>
        </defs>

        {/* Estrutura Alada Metálica */}
        <g opacity="1">
          <path d="M70 45 L20 25 L45 50 L15 40 L40 55 L10 60 L70 65 Z" fill="url(#metal-gradient)" stroke={colors.secondary} strokeWidth="1" />
          <path d="M190 45 L240 25 L215 50 L245 40 L220 55 L250 60 L190 65 Z" fill="url(#metal-gradient)" stroke={colors.secondary} strokeWidth="1" />
        </g>

        {/* Banner Central (Corpo) */}
        <path d="M60 35 L200 35 L215 70 L45 70 Z" fill="url(#dark-chrome-gradient)" stroke="#000" strokeWidth="2" />
        <path d="M65 38 L195 38 L208 67 L52 67 Z" fill="none" stroke="url(#metal-gradient)" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Ponta Inferior V */}
        <path d="M100 65 L130 95 L160 65 Z" fill="url(#dark-chrome-gradient)" stroke="url(#metal-gradient)" strokeWidth="2" />

        {/* Texto de Rank */}
        <text 
          x="130" 
          y="58" 
          textAnchor="middle" 
          fill="url(#text-gradient)" 
          style={{ 
            fontFamily: 'system-ui, sans-serif', 
            fontWeight: '900', 
            fontSize: '22px', 
            letterSpacing: '4px',
            filter: `drop-shadow(0 0 10px ${colors.aura})`
          }}
        >
          {labelText}
        </text>

        {/* Numeração do Usuário */}
        <text 
          x="130" 
          y="74" 
          textAnchor="middle" 
          fill={colors.primary} 
          style={{ 
            fontFamily: 'monospace', 
            fontWeight: 'bold', 
            fontSize: '8px', 
            letterSpacing: '2px',
            opacity: 0.8
          }}
        >
          {displayId}
        </text>

        {/* EFEITO FLASH Sweep */}
        <g mask="url(#text-flash-mask)">
            <rect 
              x="0" 
              y="35" 
              width="260" 
              height="35" 
              fill="url(#sweep-gradient)" 
              className="mythic-shine-sweep"
            />
        </g>

        {/* Estrelas de Rank */}
        <g transform={`translate(${130 - (starsCount * 6)}, 84)`}>
            {Array.from({ length: starsCount }).map((_, i) => (
                <path 
                  key={i} 
                  className="animate-star-fill-loop"
                  style={{ 
                    paddingTop: '4px',
                    animationDelay: `${i * 0.4}s`,
                    color: colors.primary
                  }}
                  d={`M${i * 12} 0 L${i * 12 + 2} 4 L${i * 12 + 7} 4 L${i * 12 + 3} 7 L${i * 12 + 5} 12 L${i * 12} 9 L${i * 12 - 5} 12 L${i * 12 - 3} 7 L${i * 12 - 7} 4 L${i * 12 - 2} 4 Z`} 
                  stroke="currentColor" 
                  strokeWidth="0.5"
                />
            ))}
        </g>
      </svg>
    </div>
  );
};
