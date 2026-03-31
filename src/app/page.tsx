
"use client"

import React, { useState, useEffect } from 'react';
import { AccessGate } from '@/components/mythic/AccessGate';
import { AuthGate } from '@/components/mythic/AuthGate';
import { MythicDashboard } from '@/components/mythic/MythicDashboard';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  // Estados para o fluxo de acesso
  const [isCodeValidated, setIsCodeValidated] = useState(false);
  const [tempProfile, setTempProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Recupera validação do código do localStorage para persistência simples
  useEffect(() => {
    const stored = localStorage.getItem('mythic_access_granted');
    if (stored) {
      const parsed = JSON.parse(stored);
      setIsCodeValidated(true);
      setTempProfile(parsed);
    }
  }, []);

  // Quando o usuário está logado, tentamos buscar o perfil dele no Firestore
  // Se não existir, usamos o perfil temporário gerado pelo código
  useEffect(() => {
    async function loadProfile() {
      if (user && db) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        } else if (tempProfile) {
          // Se o usuário acabou de logar e não tem perfil, usamos os dados do código
          setUserProfile({
            ...tempProfile,
            email: user.email,
            id: user.uid,
            name: user.displayName || tempProfile.name
          });
        }
      }
    }
    loadProfile();
  }, [user, db, tempProfile]);

  const handleCodeSuccess = (profile: any) => {
    localStorage.setItem('mythic_access_granted', JSON.stringify(profile));
    setTempProfile(profile);
    setIsCodeValidated(true);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
      </div>
    );
  }

  const activeProfile = userProfile || tempProfile;
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
