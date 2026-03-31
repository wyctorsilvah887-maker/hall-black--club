
"use client"

import React, { useState } from 'react';
import { AccessGate } from '@/components/mythic/AccessGate';
import { MythicDashboard } from '@/components/mythic/MythicDashboard';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const handleAccessGranted = (profile: any) => {
    setUserProfile(profile);
    setIsAuthenticated(true);
  };

  return (
    <main className="min-h-screen bg-black">
      {!isAuthenticated ? (
        <AccessGate onSuccess={handleAccessGranted} />
      ) : (
        <MythicDashboard profile={userProfile} />
      )}
    </main>
  );
}
