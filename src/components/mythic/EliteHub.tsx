"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, Crown, Gem, BookOpen, Users, Terminal, 
  Settings, LogOut, ExternalLink, ChevronRight, 
  Cpu, Lock, Search, History
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { collection, doc, query, where, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { BlackAdvisor } from './BlackAdvisor';
import { HighCouncil } from './HighCouncil';
import { TheVault } from './TheVault';
import { RankBadge } from './MythicIcons';

interface EliteHubProps {
  profile: any;
}

export function EliteHub({ profile }: EliteHubProps) {
  const [activeTab, setActiveTab] = useState<'vault' | 'council' | 'advisor'>('vault');
  const auth = useAuth();
  
  const isLegendary = profile.status === 'LEGENDARY';
  const isAmber = profile.status === 'AMBER';
  const themeColor = isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary';

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-x-hidden">
      {/* NAVEGAÇÃO LATERAL MINIMALISTA (DESKTOP) / INFERIOR (MOBILE) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-zinc-900 md:top-0 md:bottom-auto md:h-20 md:border-t-0 md:border-b">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-4">
            <Cpu className={themeColor} />
            <h1 className="text-xl font-black uppercase tracking-tighter">Hall Black Hub</h1>
          </div>
          
          <div className="flex-1 flex justify-center gap-8 md:gap-12">
            {[
              { id: 'vault', icon: BookOpen, label: 'O Cofre' },
              { id: 'council', icon: Users, label: 'Conselho' },
              { id: 'advisor', icon: Terminal, label: 'Advisor' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col md:flex-row items-center gap-2 py-4 md:py-0 transition-all group
                  ${activeTab === tab.id ? themeColor : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                <tab.icon className="w-5 h-5 group-active:scale-90 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
             <Link href="/settings" className="p-2 text-zinc-600 hover:text-white transition-colors">
               <Settings className="w-5 h-5" />
             </Link>
             <button onClick={() => signOut(auth)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-32 md:pt-32 md:pb-12 space-y-12 relative z-10">
        {/* CABEÇALHO DE PRESTÍGIO */}
        <section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-zinc-900 pb-12">
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-zinc-500">
               <ShieldCheck className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em]">Identidade Verificada</span>
             </div>
             <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-none">
               {profile.name}
             </h2>
             <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-zinc-800 bg-zinc-950/50 text-zinc-500 py-1 px-4 text-[9px] font-black tracking-widest rounded-full">
                  # {profile.memberNumber?.toString().padStart(2, '0') || 'XX'} / 60
                </Badge>
                <div className="h-px w-8 bg-zinc-900" />
                <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">
                  Pedigree Score: {profile.pedigreeScore || '1.0'}
                </span>
             </div>
          </div>
          <div className="scale-75 md:scale-100 origin-left md:origin-right">
             <RankBadge status={profile.status} id={profile.id} size="md" />
          </div>
        </section>

        {/* ÁREA DE CONTEÚDO DINÂMICO */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {activeTab === 'vault' && <TheVault profile={profile} />}
          {activeTab === 'council' && <HighCouncil profile={profile} />}
          {activeTab === 'advisor' && <BlackAdvisor profile={profile} />}
        </div>
      </main>

      {/* MARCA D'ÁGUA LATERAL DE PROTOCOLO */}
      <footer className="fixed top-1/2 -right-16 md:-right-20 -translate-y-1/2 hidden md:block opacity-10 pointer-events-none rotate-180 z-0">
        <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[1.2em] vertical-text text-zinc-400">
          Hall Black Elite Protocol v2.0
        </p>
      </footer>
    </div>
  );
}
