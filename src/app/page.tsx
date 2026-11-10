"use client"

import React, { useState, useEffect } from 'react';
import { AuthGate } from '@/components/mythic/AuthGate';
import { EliteHub } from '@/components/mythic/EliteHub';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';
import { EliteLoader } from '@/components/mythic/EliteLoader';

/**
 * @fileOverview Página principal do Sovereign Founders Club.
 * Gerencia o fluxo de acesso e renderiza o Elite Hub para membros autenticados.
 */

export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
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

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: userProfileData, isLoading: isProfileLoading } = useDoc(userRef);

  if (isUserLoading || (user && isProfileLoading)) {
    return <EliteLoader />;
  }

  // Se o usuário está logado, mostra o Hub
  if (user) {
    const activeProfile = userProfileData || {
      ...tempProfile,
      id: user.uid,
      email: user.email,
      name: user.displayName || tempProfile?.name || 'Membro Elite'
    };

    const currentRank = calculateRankByTime(activeProfile.registrationDateTime, activeProfile.status);
    const themeClass = getThemeClass(currentRank);

    return (
      <main className={`min-h-screen bg-black ${themeClass}`}>
        <EliteHub profile={activeProfile} />
      </main>
    );
  }

  // Se não está logado, mostra diretamente a tela de Auth (Login/Cadastro)
  const currentRank = calculateRankByTime(tempProfile?.registrationDateTime, tempProfile?.status);
  const themeClass = getThemeClass(currentRank);

  return (
    <main className={`min-h-screen bg-black ${themeClass}`}>
      <AuthGate theme={tempProfile?.theme} tempProfile={tempProfile} />
    </main>
  );
}