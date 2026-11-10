
"use client"

import React from 'react';
import { Crown, User } from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';

/**
 * @fileOverview Cabeçalho Superior de Elite - Hall Black Club.
 * Configurado como 'fixed' para visibilidade absoluta em navegadores.
 * Oculta-se automaticamente em modo PWA (standalone) via CSS.
 */

export function TopHeader({ profile }: { profile: any }) {
  const currentRank = calculateRankByTime(profile?.registrationDateTime, profile?.status);
  const themeClass = getThemeClass(currentRank);

  return (
    <header className={cn(
      "pwa-header-hide fixed top-0 left-0 right-0 z-[60] w-full bg-black/80 backdrop-blur-2xl border-b border-zinc-900/50 h-16 md:h-20 flex items-center justify-between px-6 transition-all duration-500 shrink-0",
      themeClass
    )}>
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

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Protocolo v2026.12</p>
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
    </header>
  );
}
