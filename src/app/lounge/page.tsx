
"use client"

import React from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';
import { CouncilLounge } from '@/components/mythic/CouncilLounge';
import { ArrowLeft, MessageSquare, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Página do Salão do Conselho - Sovereign Founders Club.
 * Otimizada para tela cheia e experiência mobile nativa.
 */

export default function LoungePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-zinc-900 mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Acesso Restrito</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest max-w-xs mb-8">Autentique-se para entrar no Salão do Conselho.</p>
        <Link href="/" className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Voltar ao Portal</Link>
      </div>
    );
  }

  const currentRank = calculateRankByTime(profile.registrationDateTime, profile.status);
  const themeClass = getThemeClass(currentRank);

  return (
    <main className={cn("fixed inset-0 bg-black text-white selection:bg-primary/30 flex flex-col overflow-hidden", themeClass)}>
      {/* HEADER FIXO - ADAPTADO MOBILE */}
      <header className="flex items-center justify-between gap-4 border-b border-zinc-900/50 px-4 py-4 md:px-8 md:py-6 flex-shrink-0 bg-black/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-zinc-900/50 rounded-full transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-zinc-500" />
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-xl bg-primary/10 border border-primary/20">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-tight">Salão Elite</h1>
              <p className="text-[7px] md:text-[8px] text-zinc-600 uppercase tracking-widest font-bold">Lounge Founders</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 bg-zinc-950/50 p-1.5 md:p-2 px-3 md:px-4 rounded-full border border-zinc-900">
           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           <div className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400">Live Connection</div>
        </div>
      </header>

      {/* CHAT CONTAINER - TELA CHEIA */}
      <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto overflow-hidden relative">
        <CouncilLounge profile={profile} />
      </div>
    </main>
  );
}
