"use client"

import React, { useState, useEffect } from 'react';
import { AccessGate } from '@/components/mythic/AccessGate';
import { AuthGate } from '@/components/mythic/AuthGate';
import { EliteHub } from '@/components/mythic/EliteHub';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';

/**
 * @fileOverview Página principal do Hall Black Club.
 * Gerencia o fluxo de acesso e renderiza o Elite Hub para membros autenticados.
 */

export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  const [isCodeValidated, setIsCodeValidated] = useState(false);
  const [tempProfile, setTempProfile] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mythic_access_granted');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIsCodeValidated(true);
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

  const handleCodeSuccess = (profile: any) => {
    localStorage.setItem('mythic_access_granted', JSON.stringify(profile));
    setTempProfile(profile);
    setIsCodeValidated(true);
  };

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
      </div>
    );
  }

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

  if (isCodeValidated) {
    const currentRank = calculateRankByTime(tempProfile?.registrationDateTime, tempProfile?.status);
    const themeClass = getThemeClass(currentRank);

    return (
      <main className={`min-h-screen bg-black ${themeClass}`}>
        <AuthGate theme={tempProfile?.theme} tempProfile={tempProfile} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <AccessGate onSuccess={handleCodeSuccess} />
    </main>
  );
}