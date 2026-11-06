"use client"

import React, { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, BookOpen, Users, Terminal, 
  Settings, LogOut, Cpu, ExternalLink, ShieldAlert,
  ChevronRight
} from "lucide-react";
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { HighCouncil } from './HighCouncil';
import { TheVault } from './TheVault';
import { RankBadge } from './MythicIcons';
import { calculateRankByTime, getRankLabel, getThemeClass } from '@/lib/rank-utils';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface EliteHubProps {
  profile: any;
}

export function EliteHub({ profile }: EliteHubProps) {
  const [activeTab, setActiveTab] = useState<'vault' | 'council'>('vault');
  const auth = useAuth();
  
  const currentRank = useMemo(() => {
    return calculateRankByTime(profile.registrationDateTime, profile.status);
  }, [profile.registrationDateTime, profile.status]);

  const themeClass = getThemeClass(currentRank);
  const themeColor = 'text-primary';

  const isAdmin = profile.role === 'admin';

  return (
    <div className={cn("min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-x-hidden transition-colors duration-700 pb-24 md:pb-0", themeClass)}>
      
      {/* NAVEGAÇÃO CENTRALIZADA (DOCK DE ELITE) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 md:pb-0 md:top-0 md:bottom-auto md:h-20 md:px-0">
        <div className="max-w-7xl mx-auto h-full">
          {/* Layout Mobile: Dock Flutuante */}
          <div className="md:hidden bg-zinc-950/80 backdrop-blur-2xl border border-zinc-900 rounded-[2.5rem] h-20 flex items-center justify-around px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
            {[
              { id: 'vault', icon: BookOpen, label: 'Cofre', type: 'tab' },
              { id: 'council', icon: Users, label: 'Conselho', type: 'tab' },
              { id: 'advisor', icon: Terminal, label: 'IA', type: 'link', href: '/advisor' },
              { id: 'settings', icon: Settings, label: 'Ajustes', type: 'link', href: '/settings' }
            ].map((item) => (
              item.type === 'tab' ? (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 transition-all duration-300",
                    activeTab === item.id ? themeColor : 'text-zinc-600'
                  )}
                >
                  <item.icon className={cn("w-6 h-6", activeTab === item.id ? "scale-110" : "scale-100")} />
                  <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                  {activeTab === item.id && (
                    <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                  )}
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={item.href!}
                  className="flex flex-col items-center gap-1 text-zinc-600 hover:text-primary transition-colors"
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                </Link>
              )
            ))}
            
            <button onClick={() => signOut(auth)} className="flex flex-col items-center gap-1 text-zinc-600 hover:text-red-500">
              <LogOut className="w-6 h-6" />
              <span className="text-[8px] font-black uppercase tracking-widest">Sair</span>
            </button>
          </div>

          {/* Layout Desktop: Barra Superior Clássica */}
          <div className="hidden md:flex h-full items-center justify-between px-6 bg-black/50 backdrop-blur-xl border-b border-zinc-900/50">
            <div className="flex items-center gap-4">
              <Cpu className={cn("w-6 h-6", themeColor)} />
              <h1 className={cn("text-xl font-black uppercase tracking-tighter", themeColor)}>Hall Black Hub</h1>
            </div>
            
            <div className="flex items-center gap-12">
              {[
                { id: 'vault', icon: BookOpen, label: 'O Cofre', type: 'tab' },
                { id: 'council', icon: Users, label: 'Conselho', type: 'tab' },
                { id: 'advisor', icon: Terminal, label: 'Advisor IA', type: 'link', href: '/advisor' }
              ].map((item) => (
                item.type === 'tab' ? (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={cn(
                      "flex items-center gap-2 py-2 transition-all group border-b-2",
                      activeTab === item.id ? cn("border-primary", themeColor) : 'border-transparent text-zinc-600 hover:text-zinc-400'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    href={item.href!}
                    className="flex items-center gap-2 py-2 text-zinc-600 hover:text-primary transition-all"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                  </Link>
                )
              ))}
            </div>

            <div className="flex items-center gap-4">
               {isAdmin && (
                 <Link href="/staff" className="p-2 text-primary hover:text-white transition-colors animate-pulse">
                   <ShieldAlert className="w-5 h-5" />
                 </Link>
               )}
               <Link href="/settings" className="p-2 text-zinc-600 hover:text-white transition-colors">
                 <Settings className="w-5 h-5" />
               </Link>
               <button onClick={() => signOut(auth)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                 <LogOut className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-12 md:pt-32 space-y-12 relative z-10">
        
        {/* CABEÇALHO DE PRESTÍGIO - OCULTO NA ABA CONSELHO */}
        {activeTab !== 'council' && (
          <>
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
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">
                        <Link href="/debug/badges" className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Ver Hierarquia
                        </Link>
                      </Button>
                    </div>
                    <div className="hidden sm:block h-px w-8 bg-zinc-900" />
                    <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">
                      Pedigree Score: {profile.pedigreeScore || '100'}
                    </span>
                 </div>
              </div>
              <div className="scale-75 md:scale-100 origin-left md:origin-right">
                 <RankBadge status={currentRank} id={profile.id} size="md" />
              </div>
            </section>

            {isAdmin && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                <Button asChild variant="outline" className="w-full h-14 md:h-16 rounded-2xl border-primary/30 bg-primary/5 text-primary font-black uppercase tracking-widest hover:bg-primary/10 group transition-all">
                  <Link href="/staff" className="flex items-center justify-center gap-3">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                    Acessar Terminal Staff
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {activeTab === 'vault' && <TheVault profile={{ ...profile, status: currentRank }} />}
          {activeTab === 'council' && <HighCouncil profile={profile} />}
        </div>
      </main>

      <footer className="fixed top-1/2 -right-16 md:-right-20 -translate-y-1/2 hidden md:block opacity-10 pointer-events-none rotate-180 z-0">
        <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[1.2em] vertical-text text-zinc-400">
          Hall Black Elite Protocol v2.0
        </p>
      </footer>
    </div>
  );
}