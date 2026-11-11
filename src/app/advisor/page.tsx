
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
 * Sincronizado com o padrão visual do Black Room para imersão 100% full screen.
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
      
      <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto overflow-hidden relative">
        
        <div className="pt-8 md:pt-12 px-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-tight">Sovereign AI</h1>
              <p className="text-[7px] text-zinc-600 uppercase tracking-widest font-bold">Protocolo de Auditoria</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-zinc-950/50 p-2 px-4 rounded-full border border-zinc-900">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <div className="text-[7px] font-black uppercase tracking-widest text-zinc-400">Link Criptografado</div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <BlackAdvisor profile={{ ...profile, status: currentRank }} />
        </div>
      </div>
    </main>
  );
}
