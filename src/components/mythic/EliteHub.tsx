
"use client"

import React, { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, BookOpen, Users, Terminal, 
  Settings, Cpu, ExternalLink, ShieldAlert,
  ChevronRight, MessageSquare
} from "lucide-react";
import Link from 'next/link';
import { HighCouncil } from './HighCouncil';
import { TheVault } from './TheVault';
import { RankBadge } from './MythicIcons';
import { calculateRankByTime, getRankLabel, getThemeClass } from '@/lib/rank-utils';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { TopHeader } from './TopHeader';

interface EliteHubProps {
  profile: any;
}

/**
 * @fileOverview Elite Hub - Central de Comando Sovereign.
 * Navegação simplificada no Dock inferior.
 * Cabeçalho superior fixo gerencia o acesso ao perfil e exibe o Elite Score.
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 h-24 pointer-events-none">
        <div className="max-w-xl mx-auto h-full pointer-events-auto">
          <div className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-900 rounded-[2.5rem] h-full flex items-center justify-around px-6 shadow-[0_-15px_50px_rgba(0,0,0,0.9)]">
            {[
              { id: 'vault', icon: BookOpen, label: 'Cofre', type: 'tab' },
              { id: 'council', icon: Users, label: 'Conselho', type: 'tab' },
              { id: 'lounge', icon: MessageSquare, label: 'Salão', type: 'link', href: '/lounge' },
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
                  <item.icon className={cn("w-6 h-6", activeTab === item.id ? "scale-110 drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "scale-100")} />
                  <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                  {activeTab === item.id && (
                    <div className="absolute -bottom-3 w-1 h-1 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.href!}
                  className="flex flex-col items-center gap-1.5 text-zinc-600 hover:text-primary transition-all active:scale-90"
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                </Link>
              )
            ))}
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 pt-20 md:pt-28 space-y-12 relative z-10">
        
        {/* HEADER DE PRESTÍGIO */}
        {activeTab !== 'council' && (
          <section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-zinc-900 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-zinc-500">
                 <ShieldCheck className={cn("w-4 h-4", themeColor)} />
                 <span className="text-[10px] font-black uppercase tracking-[0.5em]">Identidade Verificada</span>
               </div>
               <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-none">
                 {profile.name}
               </h2>
               <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("py-1 px-4 text-[9px] font-black tracking-widest rounded-full bg-zinc-950/50 border-zinc-800", themeColor)}>
                      {getRankLabel(currentRank)}
                    </Badge>
                  </div>
                  <div className="hidden sm:block h-px w-8 bg-zinc-900" />
                  <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">
                    Status de Linhagem Ativo
                  </span>
               </div>
            </div>
            <div className="scale-75 md:scale-100 origin-left md:origin-right">
               <RankBadge status={currentRank} id={profile.id} size="md" />
            </div>
          </section>
        )}

        {/* ÁREA DE CONTEÚDO DINÂMICO */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {activeTab === 'vault' && <TheVault profile={{ ...profile, status: currentRank }} />}
          {activeTab === 'council' && <HighCouncil profile={profile} />}
        </div>
      </main>

      <footer className="mt-20 py-20 text-center opacity-10">
        <p className="text-[8px] font-black uppercase tracking-[1.5em] text-zinc-400">
          Sovereign Hub Protocol v2.0
        </p>
      </footer>
    </div>
  );
}
