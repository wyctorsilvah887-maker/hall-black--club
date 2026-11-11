
"use client"

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';
import { CouncilLounge } from '@/components/mythic/CouncilLounge';
import { ArrowLeft, MessageSquare, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { EliteLoader } from '@/components/mythic/EliteLoader';

/**
 * @fileOverview Página do Black Room - Sovereign Founders Club.
 * Sincronizado com atraso proposital para imersão de elite.
 * Ocultamos o cabeçalho para que o chat ocupe a tela inteira (100% full screen).
 */

export default function LoungePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [isForcedLoading, setIsForcedLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsForcedLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  if (isUserLoading || isProfileLoading || isForcedLoading) {
    return <EliteLoader />;
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-zinc-900 mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Acesso Restrito</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest max-w-xs mb-8">Autentique-se para entrar no Black Room.</p>
        <Link href="/hub" className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Voltar ao Hub</Link>
      </div>
    );
  }

  const currentRank = calculateRankByTime(profile.registrationDateTime, profile.status);
  const themeClass = getThemeClass(currentRank);

  return (
    <main className={cn("fixed inset-0 bg-black text-white selection:bg-primary/30 flex flex-col overflow-hidden", themeClass)}>
      
      {/* O cabeçalho TopHeader foi removido conforme solicitado para tela 100% cheia */}

      <div className="absolute top-6 left-6 z-50 hidden md:flex">
        <Link href="/hub" className="p-3 bg-black/40 backdrop-blur-xl border border-zinc-900 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90 shadow-2xl">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto overflow-hidden relative">
        <div className="pt-8 md:pt-12 px-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
               <MessageSquare className="w-4 h-4 text-primary" />
             </div>
             <div>
               <h1 className="text-xl font-black uppercase tracking-tighter leading-tight">Black Room</h1>
               <p className="text-[7px] text-zinc-600 uppercase tracking-widest font-bold">Rede Segura</p>
             </div>
          </div>
          <div className="flex items-center gap-2 bg-zinc-950/50 p-2 px-4 rounded-full border border-zinc-900">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             <div className="text-[7px] font-black uppercase tracking-widest text-zinc-400">Canal Ativo</div>
          </div>
        </div>
        <CouncilLounge profile={profile} />
      </div>
    </main>
  );
}
