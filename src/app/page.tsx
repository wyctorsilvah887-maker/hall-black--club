
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/mythic/AuthGate';
import { useUser } from '@/firebase';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';
import { EliteLoader } from '@/components/mythic/EliteLoader';

/**
 * @fileOverview Protocolo de Entrada - Gateway de Autenticação.
 * Redireciona membros autenticados para o Hub Central (/hub).
 */

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [tempProfile, setTempProfile] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mythic_access_granted');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTempProfile(parsed);
      } catch (e) {
        localStorage.removeItem('mythic_access_granted');
      }
    }
  }, []);

  // Redirecionamento automático para o Hub Central
  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/hub');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return <EliteLoader />;
  }

  const currentRank = calculateRankByTime(tempProfile?.registrationDateTime, tempProfile?.status);
  const themeClass = getThemeClass(currentRank);

  return (
    <main className={`min-h-screen bg-black ${themeClass}`}>
      <AuthGate theme={tempProfile?.theme} tempProfile={tempProfile} />
    </main>
  );
}
