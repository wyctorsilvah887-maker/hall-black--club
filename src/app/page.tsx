"use client"

import React, { useState } from 'react';
import { AccessGate } from '@/components/mythic/AccessGate';
import { MythicDashboard } from '@/components/mythic/MythicDashboard';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const handleAccessGranted = (profile: any) => {
    setUserProfile(profile);
    setIsAuthenticated(true);
  };

  const themeClass = userProfile?.theme === 'legendary' 
    ? 'theme-legendary' 
    : userProfile?.theme === 'amber' 
    ? 'theme-amber' 
    : '';

  return (
    <main className={`min-h-screen bg-black ${themeClass}`}>
      {!isAuthenticated ? (
        <AccessGate onSuccess={handleAccessGranted} />
      ) : (
        <MythicDashboard profile={userProfile} />
      )}
    </main>
  );
}
