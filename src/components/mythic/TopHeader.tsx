
"use client"

import React from 'react';
import { User, Zap } from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';

/**
 * @fileOverview Cabeçalho Superior de Elite - Sovereign Founders Club.
 * Exibe o logotipo oficial logo-sfc.gif em dimensões equilibradas e imponentes.
 */

export function TopHeader({ profile }: { profile: any }) {
  const currentRank = calculateRankByTime(profile?.registrationDateTime, profile?.status);
  const themeClass = getThemeClass(currentRank);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[60] w-full bg-black/80 backdrop-blur-2xl border-b border-zinc-900/50 flex flex-col justify-center transition-all duration-500 shrink-0",
      themeClass
    )}>
      {/* Safe Area Spacer for iOS standalone mode */}
      <div className="h-[env(safe-area-inset-top,0px)] w-full" />
      
      <div className="h-16 md:h-20 w-full flex items-center justify-between px-6">
        <Link href="/" className="flex items-center active:scale-95 transition-transform">
          <NextImage 
            src="/logo-sfc.gif" 
            alt="Sovereign Founders Club" 
            width={280} 
            height={80} 
            className="h-12 md:h-14 w-auto object-contain"
            unoptimized
            priority
          />
        </Link>

        <div className="flex items-center gap-4 md:gap-8">
          {/* ELITE SCORE DISPLAY */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-900 shadow-inner">
               <Zap className="w-3 h-3 text-primary animate-pulse" />
               <span className="text-[11px] font-black text-white tracking-tighter">
                 {profile?.eliteScore || '100'}
               </span>
            </div>
            <p className="text-[6px] font-black text-zinc-600 uppercase tracking-widest mt-1 mr-1">Elite Score</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-white uppercase tracking-tight">{profile?.name}</p>
            </div>
            <Link href="/settings" className="relative group">
              <div className="w-10 h-10 rounded-full border-2 border-zinc-800 overflow-hidden bg-zinc-950 group-hover:border-primary transition-colors shadow-2xl">
                {profile?.photo ? (
                  <NextImage src={profile.photo} alt={profile.name} width={40} height={40} className="object-cover" unoptimized />
                ) : (
                  <User className="w-full h-full p-2.5 text-zinc-800" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full shadow-lg" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
