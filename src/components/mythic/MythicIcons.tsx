"use client"

import React, { useId } from 'react';
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
  const reactId = useId();
  const isHallBlack = status === 'HALL_BLACK';
  const isMythic = status === 'MYTHIC';
  const isAmber = status === 'AMBER';
  const isLegendary = status === 'LEGENDARY';
  const isElite = status === 'ELITE';
  const isMaster = status === 'MASTER' || !status;
  
  const scale = size === 'sm' ? 'scale-[0.6]' : size === 'lg' ? 'scale-125' : 'scale-100';
  
  const uniqueId = id ? id.replace(/\W/g, '') : reactId.replace(/:/g, '');

  const getColors = () => {
    if (isHallBlack) return { primary: '#0a0a0a', secondary: '#000000', vibrant: '#262626', deep: '#171717', aura: 'transparent' };
    if (isMythic) return { primary: '#ff1a1a', secondary: '#660000', vibrant: '#ff4d4d', deep: '#b30000', aura: 'rgba(255,0,0,0.4)' };
    if (isAmber) return { primary: '#F59E0B', secondary: '#D97706', vibrant: '#fbbf24', deep: '#d97706', aura: 'rgba(245,158,11,0.2)' };
    if (isLegendary) return { primary: '#FFD700', secondary: '#B8860B', vibrant: '#FFF2AC', deep: '#bf953f', aura: 'rgba(255,215,0,0.2)' };
    if (isElite) return { primary: '#E5E4E2', secondary: '#71706E', vibrant: '#FFFFFF', deep: '#A9A9A9', aura: 'rgba(229, 228, 226, 0.2)' };
    return { primary: '#CD7F32', secondary: '#8B4513', vibrant: '#E3A857', deep: '#A0522D', aura: 'rgba(205, 127, 50, 0.2)' };
  };

  const colors = getColors();
  
  const labelText = isHallBlack ? 'SOVEREIGN' :
                   isMythic ? 'MÍTICO RUBI' : 
                   isAmber ? 'LEGENDÁRIO ÂMBAR' :
                   isLegendary ? 'LENDÁRIO' : 
                   isElite ? 'ELITE' : 'MESTRE';

  const starsCount = (isHallBlack || isMythic || isAmber || isLegendary) ? 5 : 3;
  
  const labelFontSize = 
    labelText === 'SOVEREIGN' ? '18px' :
    labelText === 'MÍTICO RUBI' ? '18px' : 
    labelText === 'LEGENDÁRIO ÂMBAR' ? '13px' :
    labelText === 'LENDÁRIO' ? '18px' :
    '24px';
    
  const labelYPosition = '58';

  return (
    <div className={cn("relative flex items-center justify-center select-none pointer-events-none transition-transform duration-700", scale, className)}>
      {!isHallBlack && (
        <div 
          className={cn("absolute inset-0 blur-[60px] rounded-full animate-pulse")} 
          style={{ backgroundColor: colors.aura }}
        />
      )}
      
      <svg 
        width="260" 
        height="100" 
        viewBox="0 0 260 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn("relative", !isHallBlack && "drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]")}
      >
        <defs>
          <linearGradient id={`metal-gradient-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="30%" stopColor={colors.vibrant} />
            <stop offset="50%" stopColor={colors.deep} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>

          <linearGradient id={`dark-chrome-gradient-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isHallBlack ? "#1a1a1a" : "#444"} />
            <stop offset="50%" stopColor="#000" />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>

          <linearGradient id={`text-gradient-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isHallBlack ? "#ff0000" : "#fff"} />
            <stop offset="50%" stopColor={isHallBlack ? "#000" : "#fff"} />
            <stop offset="100%" stopColor={isHallBlack ? "#4a0000" : colors.primary} />
          </linearGradient>

          <linearGradient id={`journey-gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%" spreadMethod="repeat">
            <stop offset="0%" stopColor="#CD7F32" /> 
            <stop offset="20%" stopColor="#E5E4E2" /> 
            <stop offset="40%" stopColor="#FFD700" /> 
            <stop offset="60%" stopColor="#F59E0B" /> 
            <stop offset="80%" stopColor="#ff1a1a" /> 
            <stop offset="100%" stopColor="#CD7F32" /> 
          </linearGradient>

          <linearGradient id={`sweep-gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="40%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity={isHallBlack ? "0.3" : "0.9"} />
            <stop offset="60%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <mask id={`text-flash-mask-${uniqueId}`}>
            <g>
              <text 
                x="130" 
                y={labelYPosition}
                textAnchor="middle" 
                fill="white"
                style={{ 
                  fontFamily: 'system-ui, sans-serif', 
                  fontWeight: '900', 
                  fontSize: labelFontSize, 
                  letterSpacing: '4px'
                }}
              >
                {labelText}
              </text>
            </g>
          </mask>
        </defs>

        <g opacity="1">
          <path d="M70 45 L20 25 L45 50 L15 40 L40 55 L10 60 L70 65 Z" fill={`url(#metal-gradient-${uniqueId})`} stroke={isHallBlack ? "#1a1a1a" : colors.secondary} strokeWidth="1" />
          <path d="M190 45 L240 25 L215 50 L245 40 L220 55 L250 60 L190 65 Z" fill={`url(#metal-gradient-${uniqueId})`} stroke={isHallBlack ? "#1a1a1a" : colors.secondary} strokeWidth="1" />
        </g>

        <path d="M60 35 L200 35 L215 70 L45 70 Z" fill={`url(#dark-chrome-gradient-${uniqueId})`} stroke={isHallBlack ? "#1a1a1a" : "#000"} strokeWidth="2" />
        <path d="M65 38 L195 38 L208 67 L52 67 Z" fill="none" stroke={isHallBlack ? `url(#journey-gradient-${uniqueId})` : `url(#metal-gradient-${uniqueId})`} strokeWidth={isHallBlack ? "0.5" : "1.5"} strokeOpacity={isHallBlack ? "0.2" : "0.6"} />

        <path d="M100 65 L130 95 L160 65 Z" fill={`url(#dark-chrome-gradient-${uniqueId})`} stroke={isHallBlack ? "#1a1a1a" : `url(#metal-gradient-${uniqueId})`} strokeWidth="2" />

        <g>
          <text 
            x="130" 
            y={labelYPosition}
            textAnchor="middle" 
            fill={isHallBlack ? "#fff" : `url(#text-gradient-${uniqueId})`} 
            style={{ 
              fontFamily: 'system-ui, sans-serif', 
              fontWeight: '900', 
              fontSize: labelFontSize, 
              letterSpacing: '4px',
              filter: isHallBlack ? 'none' : `drop-shadow(0 0 10px ${colors.aura})`
            }}
          >
            {labelText}
          </text>
        </g>

        <g mask={`url(#text-flash-mask-${uniqueId})`}>
            <rect 
              x="0" 
              y="35" 
              width="260" 
              height="35" 
              fill={isHallBlack ? `url(#journey-gradient-${uniqueId})` : `url(#sweep-gradient-${uniqueId})`} 
              className={isHallBlack ? "animate-hallblack-journey" : "mythic-shine-sweep"}
            />
        </g>

        <g transform={`translate(${130 - ((starsCount - 1) * 6)}, 80)`}>
            {Array.from({ length: starsCount }).map((_, i) => (
                <path 
                  key={i} 
                  className="animate-star-fill-loop"
                  style={{ 
                    animationDelay: `${i * 0.4}s`,
                    color: isHallBlack ? "#1a1a1a" : colors.primary
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
