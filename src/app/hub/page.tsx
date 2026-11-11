
"use client"

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { EliteHub } from '@/components/mythic/EliteHub';
import { EliteLoader } from '@/components/mythic/EliteLoader';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

/**
 * @fileOverview Hub Central - A "Sala de Comando" oficial do Sovereign Founders Club.
 * Sincronizado com um atraso proposital para imersão de elite.
 */

export default function HubPage() {
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
        <p className="text-zinc-600 text-xs uppercase tracking-widest max-w-xs mb-8">Autentique-se para acessar o Hub Central.</p>
        <Link href="/" className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Voltar ao Portal</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <EliteHub profile={profile} />
    </main>
  );
}
