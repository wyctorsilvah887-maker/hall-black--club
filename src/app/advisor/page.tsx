
"use client"

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';
import { BlackAdvisor } from '@/components/mythic/BlackAdvisor';
import { ShieldCheck, Terminal } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { EliteLoader } from '@/components/mythic/EliteLoader';

/**
 * @fileOverview Terminal Dedicado do Sovereign AI.
 * Sincronizado com atraso proposital para imersão de elite.
 * O cabeçalho global e o botão de voltar foram removidos para experiência 100% full screen.
 */

export default function AdvisorPage() {
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
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Acesso Negado</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest max-w-xs mb-8">Autentique-se para acessar o Sovereign AI.</p>
        <Link href="/hub" className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Voltar ao Hub</Link>
      </div>
    );
  }

  const currentRank = calculateRankByTime(profile.registrationDateTime, profile.status);
  const themeClass = getThemeClass(currentRank);

  return (
    <main className={cn("fixed inset-0 bg-black text-white selection:bg-primary/30 flex flex-col overflow-hidden", themeClass)}>
      
      {/* O cabeçalho global TopHeader e o botão de voltar foram removidos para tela 100% cheia */}

      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 overflow-hidden">
        
        <div className="flex items-center justify-between gap-4 mb-6 px-4 pt-8 md:pt-12">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Sovereign AI</h1>
              <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold">Protocolo de Auditoria Digital</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-zinc-950/50 p-2 md:p-3 rounded-xl border border-zinc-900">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <div className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Canal Criptografado</div>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-zinc-950/20 border-t border-x border-zinc-900/50 rounded-t-[2.5rem] md:rounded-t-[3.5rem] p-4 md:p-8 shadow-2xl backdrop-blur-sm flex flex-col overflow-hidden">
          <BlackAdvisor profile={{ ...profile, status: currentRank }} />
        </div>
      </div>
    </main>
  );
}
