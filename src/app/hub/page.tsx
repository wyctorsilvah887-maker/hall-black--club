
"use client"

import React from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { calculateRankByTime, getThemeClass, getRankLabel } from '@/lib/rank-utils';
import { TopHeader } from '@/components/mythic/TopHeader';
import { EliteLoader } from '@/components/mythic/EliteLoader';
import { BookOpen, Terminal, MessageSquare, Users, ShieldCheck, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview Hub Central - A "Sala de Comando" do Sovereign Founders Club.
 * Sincronizado com o design de cards premium v5.0.
 */

export default function HubPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  if (isUserLoading || isProfileLoading) {
    return <EliteLoader />;
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-zinc-900 mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Acesso Negado</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest max-w-xs mb-8">Autentique-se para acessar o Hub Central.</p>
        <Link href="/" className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Voltar ao Portal</Link>
      </div>
    );
  }

  const currentRank = calculateRankByTime(profile.registrationDateTime, profile.status);
  const themeClass = getThemeClass(currentRank);

  const modules = [
    {
      id: 'vault',
      title: 'O COFRE',
      description: 'INTELIGÊNCIA ESTRATÉGICA E MODELOS DE SAAS.',
      icon: BookOpen,
      href: '/vault',
      color: 'text-white',
      bg: 'bg-zinc-900/10',
      border: 'border-zinc-800'
    },
    {
      id: 'advisor',
      title: 'SOVEREIGN IA',
      description: 'TERMINAL ADVISOR NEURAL DE NEGÓCIOS.',
      icon: Terminal,
      href: '/advisor',
      color: 'text-blue-500',
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/10'
    },
    {
      id: 'lounge',
      title: 'BLACK ROOM',
      description: 'REDE SEGURA DE COMUNICAÇÃO FOUNDERS.',
      icon: MessageSquare,
      href: '/lounge',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/10'
    },
    {
      id: 'council',
      title: 'ALTO CONSELHO',
      description: 'HIERARQUIA E PROTOCOLOS OFICIAIS.',
      icon: Users,
      href: '/council',
      color: 'text-amber-500',
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/10'
    }
  ];

  return (
    <main className={cn("min-h-screen bg-black text-white selection:bg-primary/30 pb-20 overflow-x-hidden", themeClass)}>
      
      <TopHeader profile={profile} />

      <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-40 space-y-12">
        
        {/* BOAS-VINDAS DISCRETO */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-900/50 pb-10 opacity-80">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-600">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-[0.4em]">Protocolo de Acesso Ativo</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Bem-vindo, {profile.name.split(' ')[0]}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Badge variant="outline" className="py-0.5 px-3 text-[8px] font-black tracking-widest rounded-full bg-zinc-950/50 border-zinc-800 text-primary">
                {getRankLabel(currentRank)}
              </Badge>
              <div className="h-1 w-1 rounded-full bg-zinc-800" />
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">#{profile.memberNumber?.toString().padStart(2, '0')} FOUNDER</span>
            </div>
          </div>
          <div className="bg-zinc-950 px-5 py-2.5 rounded-2xl border border-zinc-900 shadow-inner flex items-center gap-3">
            <div className="flex flex-col items-end">
              <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Prestige Score</p>
              <p className="text-xl font-black text-white leading-none">{profile.eliteScore || 100}</p>
            </div>
            <Zap className="w-5 h-5 text-primary animate-pulse" />
          </div>
        </header>

        {/* GRADE DE MÓDULOS - DESIGN SINCRONIZADO */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
           {modules.map((mod) => (
             <Link 
               key={mod.id} 
               href={mod.href}
               className="group relative p-10 md:p-14 rounded-[3rem] bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-all duration-700 flex flex-col justify-between aspect-[1.4/1] md:aspect-auto md:min-h-[400px] overflow-hidden shadow-2xl active:scale-[0.98]"
             >
                {/* ICONE NO TOPO */}
                <div className="space-y-10">
                   <div className={cn("w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-2xl border", mod.bg, mod.border)}>
                      <mod.icon className={cn("w-10 h-10 md:w-12 md:h-12", mod.color)} />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">{mod.title}</h3>
                      <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xs">
                        {mod.description}
                      </p>
                   </div>
                </div>
                
                {/* RODAPÉ DO CARD */}
                <div className="flex items-end justify-between mt-12">
                   <div className="w-14 h-14 rounded-full border border-zinc-900 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-xl">
                      <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-white transition-colors" />
                   </div>
                   <div className="opacity-40 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-primary">Acessar Módulo</span>
                   </div>
                </div>

                {/* Sutil brilho de fundo interativo */}
                <div className={cn("absolute -bottom-20 -right-20 w-64 h-64 blur-[100px] opacity-0 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none", mod.bg)} />
                
                {/* Decoração sutil de canto */}
                <div className="absolute top-8 right-8 opacity-5">
                   <mod.icon className="w-20 h-20" />
                </div>
             </Link>
           ))}
        </section>

        {/* FOOTER DE PROTOCOLO */}
        <footer className="mt-32 py-20 text-center border-t border-zinc-900/30">
          <div className="flex items-center justify-center gap-6 mb-8 opacity-20">
             <div className="h-px w-12 bg-zinc-800" />
             <ShieldCheck className="w-4 h-4" />
             <div className="h-px w-12 bg-zinc-800" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-[2em] text-zinc-800 ml-[2em]">
            Sovereign Central Hub Protocol
          </p>
        </footer>

      </div>
    </main>
  );
}
