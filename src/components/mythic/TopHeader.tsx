"use client"

import React from 'react';
import { User, Zap, Bell } from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';

/**
 * @fileOverview Cabeçalho Superior de Elite - Sovereign Founders Club.
 * Sincronizado para uma estética minimalista, incluindo o sino de notificações.
 * Versão otimizada com Prestige Score reduzido.
 */

export function TopHeader({ profile }: { profile: any }) {
  const { user } = useUser();
  const db = useFirestore();
  const currentRank = calculateRankByTime(profile?.registrationDateTime, profile?.status);
  const themeClass = getThemeClass(currentRank);

  // Consulta rápida para checar se há notificações não lidas
  const notifQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'notifications'),
      where('userId', 'in', [user.uid, 'global']),
      limit(5)
    );
  }, [db, user]);

  const { data: notifs } = useCollection(notifQuery);
  const hasUnread = notifs && notifs.length > 0;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[60] w-full bg-black/80 backdrop-blur-xl border-b border-zinc-900/50 flex flex-col justify-center transition-all duration-500 shrink-0",
      themeClass
    )}>
      {/* Safe Area Spacer for iOS standalone mode */}
      <div className="h-[env(safe-area-inset-top,0px)] w-full" />
      
      <div className="h-20 md:h-24 w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/hub" className="flex items-center active:scale-95 transition-transform">
            <NextImage 
              src="/logo-sfc.gif" 
              alt="Sovereign Founders Club" 
              width={340} 
              height={100} 
              className="h-14 md:h-16 w-auto object-contain"
              unoptimized
              priority
            />
          </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-4">
             <Link href="/notifications" className="relative p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-primary/50 transition-colors group">
                <Bell className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
                {hasUnread && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse border-2 border-black" />
                )}
             </Link>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-full border border-zinc-900 shadow-inner">
               <Zap className="w-2.5 h-2.5 text-primary animate-pulse" />
               <span className="text-[9px] font-black text-white tracking-tighter">
                 {profile?.eliteScore || '100'}
               </span>
            </div>
            <p className="text-[5px] font-black text-zinc-700 uppercase tracking-widest mt-0.5 mr-0.5">Prestige</p>
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
