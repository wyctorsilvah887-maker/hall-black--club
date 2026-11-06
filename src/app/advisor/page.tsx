
"use client"

import React from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';
import { BlackAdvisor } from '@/components/mythic/BlackAdvisor';
import { ArrowLeft, ShieldCheck, Terminal } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Página Dedicada do Black Advisor.
 * Oferece uma interface imersiva para consultoria de linhagem e geração de imagens.
 */

export default function AdvisorPage() {
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
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Acesso Negado</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest max-w-xs mb-8">Autentique-se para acessar o Advisor.</p>
        <Link href="/" className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Voltar ao Portal</Link>
      </div>
    );
  }

  const currentRank = calculateRankByTime(profile.registrationDateTime, profile.status);
  const themeClass = getThemeClass(currentRank);

  return (
    <main className={cn("min-h-screen bg-black text-white selection:bg-primary/30 pb-20", themeClass)}>
      <div className="max-w-5xl mx-auto px-6 pt-10 md:pt-20 space-y-10">
        
        {/* HEADER DE ELITE */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zinc-900 pb-12">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
              <ArrowLeft className="w-4 h-4" /> Hub de Elite
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Terminal className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Black Advisor</h1>
                <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-bold">Terminal de Consultoria Imersiva</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Link Neural Ativo</div>
          </div>
        </header>

        {/* ÁREA DO AGENTE */}
        <div className="bg-zinc-950/20 border border-zinc-900/50 rounded-[3rem] p-6 md:p-10 shadow-2xl backdrop-blur-sm">
          <BlackAdvisor profile={{ ...profile, status: currentRank }} />
        </div>

        <footer className="pt-10 text-center opacity-10 pointer-events-none">
          <p className="text-[8px] font-black uppercase tracking-[1em]">Hall Black Intelligence Core v4.0</p>
        </footer>
      </div>
    </main>
  );
}
