"use client"

import React from 'react';
import { Crown, User, Zap } from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';

/**
 * @fileOverview Cabeçalho Superior de Elite - Hall Black Club.
 * Configurado como 'fixed' para visibilidade absoluta.
 * Suporta Safe Area Insets para dispositivos móveis (PWA).
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
        <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <Crown className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black uppercase tracking-tighter text-white leading-none">
              Hall <span className="text-primary">Black</span>
            </h1>
            <p className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Elite Identity</p>
          </div>
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