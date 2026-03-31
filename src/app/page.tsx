
"use client"

import React, { useState, useEffect } from 'react';
import { AccessGate } from '@/components/mythic/AccessGate';
import { AuthGate } from '@/components/mythic/AuthGate';
import { MythicDashboard } from '@/components/mythic/MythicDashboard';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  // Estados para o fluxo de acesso
  const [isCodeValidated, setIsCodeValidated] = useState(false);
  const [tempProfile, setTempProfile] = useState<any>(null);

  // Recupera validação do código do localStorage para persistência simples
  useEffect(() => {
    const stored = localStorage.getItem('mythic_access_granted');
    if (stored) {
      const parsed = JSON.parse(stored);
      setIsCodeValidated(true);
      setTempProfile(parsed);
    }
  }, []);

  // Referência memoizada para o documento do usuário
  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  // Hook de tempo real para o perfil do usuário
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

  // Prioriza dados do Firestore, senão usa o perfil temporário da validação do código
  const activeProfile = userProfileData || (user ? {
    ...tempProfile,
    id: user.uid,
    email: user.email,
    name: user.displayName || tempProfile?.name
  } : tempProfile);

  const themeClass = activeProfile?.theme === 'legendary' 
    ? 'theme-legendary' 
    : activeProfile?.theme === 'amber' 
    ? 'theme-amber' 
    : '';

  return (
    <main className={`min-h-screen bg-black ${themeClass}`}>
      {!isCodeValidated ? (
        <AccessGate onSuccess={handleCodeSuccess} />
      ) : !user ? (
        <AuthGate theme={activeProfile?.theme} tempProfile={tempProfile} />
      ) : (
        <MythicDashboard profile={activeProfile} />
      )}
    </main>
  );
}
