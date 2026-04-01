
"use client"

import React, { useState, useEffect } from 'react';
import { AccessGate } from '@/components/mythic/AccessGate';
import { AuthGate } from '@/components/mythic/AuthGate';
import { MythicDashboard } from '@/components/mythic/MythicDashboard';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * @fileOverview Página principal do Hall Black Club.
 * Gerencia o fluxo de acesso: Validação de Código -> Autenticação -> Dashboard.
 */

export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  // Estados para o fluxo de acesso temporário (antes do registro/login)
  const [isCodeValidated, setIsCodeValidated] = useState(false);
  const [tempProfile, setTempProfile] = useState<any>(null);

  // Recupera validação do código do localStorage para persistência entre abas
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

  // Referência memoizada para o documento do usuário no Firestore
  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  // Hook de tempo real para o perfil do usuário logado
  const { data: userProfileData, isLoading: isProfileLoading } = useDoc(userRef);

  const handleCodeSuccess = (profile: any) => {
    localStorage.setItem('mythic_access_granted', JSON.stringify(profile));
    setTempProfile(profile);
    setIsCodeValidated(true);
  };

  // 1. Estado de Carregamento Global
  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Prioridade Máxima: Usuário Logado
  if (user) {
    const activeProfile = userProfileData || {
      ...tempProfile,
      id: user.uid,
      email: user.email,
      name: user.displayName || tempProfile?.name || 'Membro Elite'
    };

    const themeClass = activeProfile?.theme === 'legendary' 
      ? 'theme-legendary' 
      : activeProfile?.theme === 'amber' 
      ? 'theme-amber' 
      : '';

    return (
      <main className={`min-h-screen bg-black ${themeClass}`}>
        <MythicDashboard profile={activeProfile} />
      </main>
    );
  }

  // 3. Usuário validou o código mas ainda não logou/registrou
  if (isCodeValidated) {
    const themeClass = tempProfile?.theme === 'legendary' 
      ? 'theme-legendary' 
      : tempProfile?.theme === 'amber' 
      ? 'theme-amber' 
      : '';

    return (
      <main className={`min-h-screen bg-black ${themeClass}`}>
        <AuthGate theme={tempProfile?.theme} tempProfile={tempProfile} />
      </main>
    );
  }

  // 4. Estado Inicial: Portão de Acesso (Solicitação de Código)
  return (
    <main className="min-h-screen bg-black">
      <AccessGate onSuccess={handleCodeSuccess} />
    </main>
  );
}
