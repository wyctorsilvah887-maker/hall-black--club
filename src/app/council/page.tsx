
"use client"

import React from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';
import { HighCouncil } from '@/components/mythic/HighCouncil';
import { ArrowLeft, Users, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TopHeader } from '@/components/mythic/TopHeader';
import { EliteLoader } from '@/components/mythic/EliteLoader';

/**
 * @fileOverview Página Dedicada do Alto Conselho.
 */

export default function CouncilPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  if (isUserLoading || isProfileLoading) {
    return <EliteLoader />;
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-zinc-900 mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Acesso Negado</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest max-w-xs mb-8">Autentique-se para acessar o Conselho.</p>
        <Link href="/" className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Voltar ao Portal</Link>
      </div>
    );
  }

  const currentRank = calculateRankByTime(profile.registrationDateTime, profile.status);
  const themeClass = getThemeClass(currentRank);

  return (
    <main className={cn("min-h-screen bg-black text-white selection:bg-primary/30 flex flex-col", themeClass)}>
      
      <TopHeader profile={profile} />

      <div className="absolute top-24 left-6 z-50">
        <Link href="/hub" className="p-3 bg-black/40 backdrop-blur-xl border border-zinc-900 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 pt-32 pb-20 space-y-12">
        <div className="flex items-center gap-4 border-b border-zinc-900 pb-8">
           <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Users className="w-6 h-6 text-amber-500" />
           </div>
           <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Conselho Sovereign</h1>
              <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold">Hierarquia e Protocolos</p>
           </div>
        </div>

        <HighCouncil profile={profile} />
      </div>

      <footer className="py-12 text-center opacity-10">
        <p className="text-[8px] font-black uppercase tracking-[1.5em]">Council Identity Protocol</p>
      </footer>
    </main>
  );
}
