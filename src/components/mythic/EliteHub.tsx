
"use client"

import React, { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, BookOpen, Users, Terminal, 
  MessageSquare, ChevronRight, Zap
} from "lucide-react";
import Link from 'next/link';
import { HighCouncil } from './HighCouncil';
import { TheVault } from './TheVault';
import { RankBadge } from './MythicIcons';
import { calculateRankByTime, getRankLabel, getThemeClass } from '@/lib/rank-utils';
import { cn } from '@/lib/utils';
import { TopHeader } from './TopHeader';

interface EliteHubProps {
  profile: any;
}

/**
 * @fileOverview Elite Hub - A Única Sala de Comando Sovereign Founders Club.
 * Dashboard central unificado que integra todos os módulos de elite.
 */

export function EliteHub({ profile }: EliteHubProps) {
  const [activeTab, setActiveTab] = useState<'vault' | 'council'>('vault');
  
  const currentRank = useMemo(() => {
    return calculateRankByTime(profile.registrationDateTime, profile.status);
  }, [profile.registrationDateTime, profile.status]);

  const themeClass = getThemeClass(currentRank);
  const themeColor = 'text-primary';

  return (
    <div className={cn("min-h-screen bg-black text-white selection:bg-primary/30 relative transition-colors duration-700 pb-32", themeClass)}>
      
      {/* CABEÇALHO SUPERIOR FIXO */}
      <TopHeader profile={profile} />

      {/* DOCK DE NAVEGAÇÃO UNIFICADO (BASE) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-[90%] max-w-lg pointer-events-auto">
        <div className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-900 rounded-[2.5rem] h-20 flex items-center justify-around px-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {[
            { id: 'vault', icon: BookOpen, label: 'Cofre', type: 'tab' },
            { id: 'council', icon: Users, label: 'Conselho', type: 'tab' },
            { id: 'lounge', icon: MessageSquare, label: 'Room', type: 'link', href: '/lounge' },
            { id: 'advisor', icon: Terminal, label: 'IA', type: 'link', href: '/advisor' }
          ].map((item) => (
            item.type === 'tab' ? (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-90",
                  activeTab === item.id ? themeColor : 'text-zinc-600'
                )}
              >
                <item.icon className={cn("w-5 h-5 md:w-6 md:h-6", activeTab === item.id ? "scale-110 drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "scale-100")} />
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                {activeTab === item.id && (
                  <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            ) : (
              <Link
                key={item.id}
                href={item.href!}
                className="flex flex-col items-center gap-1.5 text-zinc-600 hover:text-primary transition-all active:scale-90"
              >
                <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            )
          ))}
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 space-y-12 relative z-10">
        
        {/* HEADER DE PRESTÍGIO */}
        <section className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 border-b border-zinc-900/50 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-4 text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-3 text-zinc-600">
               <ShieldCheck className={cn("w-3.5 h-3.5", themeColor)} />
               <span className="text-[9px] font-black uppercase tracking-[0.5em]">Sala de Comando Ativa</span>
             </div>
             <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none">
               Bem-vindo, {profile.name.split(' ')[0]}
             </h2>
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Badge variant="outline" className={cn("py-1 px-4 text-[8px] font-black tracking-widest rounded-full bg-zinc-950/50 border-zinc-800", themeColor)}>
                  {getRankLabel(currentRank)}
                </Badge>
                <div className="h-1 w-1 rounded-full bg-zinc-800" />
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">#{profile.memberNumber?.toString().padStart(2, '0')} FOUNDER</span>
             </div>
          </div>
          <div className="scale-75 md:scale-100 origin-center md:origin-right">
             <RankBadge status={currentRank} id={profile.id} size="md" />
          </div>
        </section>

        {/* ÁREA DE CONTEÚDO DINÂMICO UNIFICADO */}
        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {activeTab === 'vault' && <TheVault profile={{ ...profile, status: currentRank }} />}
          {activeTab === 'council' && <HighCouncil profile={profile} />}
        </div>
      </main>

      <footer className="mt-20 py-20 text-center opacity-10">
        <p className="text-[8px] font-black uppercase tracking-[1.5em] text-zinc-400">
          Sovereign Founders Central Dashboard v5.0
        </p>
      </footer>
    </div>
  );
}
