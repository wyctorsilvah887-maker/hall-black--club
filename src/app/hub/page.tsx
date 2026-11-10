
"use client"

import React from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { calculateRankByTime, getThemeClass, getRankLabel } from '@/lib/rank-utils';
import { TopHeader } from '@/components/mythic/TopHeader';
import { EliteLoader } from '@/components/mythic/EliteLoader';
import { BookOpen, Terminal, MessageSquare, Users, ShieldCheck, ChevronRight, Zap, Trophy, Medal } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { RankBadge } from '@/components/mythic/MythicIcons';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview Hub Central - A "Sala de Comando" do Sovereign Founders Club.
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
      title: 'O Cofre',
      description: 'Inteligência estratégica e modelos de SaaS.',
      icon: BookOpen,
      href: '/vault',
      color: 'text-primary',
      bg: 'bg-primary/5',
      border: 'border-primary/20'
    },
    {
      id: 'advisor',
      title: 'Sovereign IA',
      description: 'Terminal Advisor neural de negócios.',
      icon: Terminal,
      href: '/advisor',
      color: 'text-blue-500',
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20'
    },
    {
      id: 'lounge',
      title: 'Black Room',
      description: 'Rede segura de comunicação Founders.',
      icon: MessageSquare,
      href: '/lounge',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20'
    },
    {
      id: 'council',
      title: 'Alto Conselho',
      description: 'Hierarquia, ranking e protocolos oficiais.',
      icon: Users,
      href: '/council',
      color: 'text-amber-500',
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/20'
    }
  ];

  return (
    <main className={cn("min-h-screen bg-black text-white selection:bg-primary/30 pb-32 overflow-x-hidden", themeClass)}>
      
      <TopHeader profile={profile} />

      <div className="max-w-7xl mx-auto px-6 pt-28 md:pt-32 space-y-12">
        
        {/* HEADER DE PRESTÍGIO */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-zinc-900 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="flex items-center gap-3 text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Identidade Verificada</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight leading-none max-w-2xl">
                {profile.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <Badge variant="outline" className="py-1 px-4 text-[9px] font-black tracking-widest rounded-full bg-zinc-950/50 border-zinc-800 text-primary">
                    {getRankLabel(currentRank)}
                 </Badge>
                 <div className="bg-zinc-950 px-4 py-1.5 rounded-full border border-zinc-900 shadow-inner flex items-center gap-2">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs font-black text-white">{profile.eliteScore || 100} PTS</span>
                 </div>
              </div>
           </div>
           <div className="scale-75 md:scale-100">
              <RankBadge status={currentRank} id={profile.id} size="md" />
           </div>
        </section>

        {/* GRADE DE MÓDULOS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           {modules.map((mod) => (
             <Link 
               key={mod.id} 
               href={mod.href}
               className="group relative p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all duration-500 flex flex-col justify-between aspect-square overflow-hidden active:scale-95 shadow-2xl"
             >
                <div className="space-y-6">
                   <div className={cn("w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", mod.bg, mod.border)}>
                      <mod.icon className={cn("w-7 h-7 md:w-8 md:h-8", mod.color)} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black uppercase tracking-tighter">{mod.title}</h3>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        {mod.description}
                      </p>
                   </div>
                </div>
                
                <div className="flex items-center justify-between mt-8">
                   <div className="w-8 h-8 rounded-full border border-zinc-900 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
                   </div>
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">Acessar Módulo</span>
                   </div>
                </div>

                {/* Sutil brilho de fundo */}
                <div className={cn("absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity", mod.bg)} />
             </Link>
           ))}
        </section>

        {/* ESTATÍSTICAS RÁPIDAS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-1000 delay-500">
           <div className="bg-zinc-950/40 border border-zinc-900 rounded-[2rem] p-6 flex items-center gap-4 backdrop-blur-sm">
              <div className="p-3 rounded-xl bg-zinc-900">
                 <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Global Rank</p>
                 <p className="text-lg font-black text-white">#{profile.memberNumber?.toString().padStart(2, '0')} Founder</p>
              </div>
           </div>
           <div className="bg-zinc-950/40 border border-zinc-900 rounded-[2rem] p-6 flex items-center gap-4 backdrop-blur-sm">
              <div className="p-3 rounded-xl bg-zinc-900">
                 <Medal className="w-5 h-5 text-primary" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Status de Linhagem</p>
                 <p className="text-lg font-black text-white">Consolidada</p>
              </div>
           </div>
           <div className="bg-zinc-950/40 border border-zinc-900 rounded-[2rem] p-6 flex items-center gap-4 backdrop-blur-sm">
              <div className="p-3 rounded-xl bg-zinc-900">
                 <Zap className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                 <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Rede Ativa</p>
                 <p className="text-lg font-black text-white">Criptografada</p>
              </div>
           </div>
        </section>

      </div>

      <footer className="mt-20 py-20 text-center opacity-10">
        <p className="text-[8px] font-black uppercase tracking-[1.5em] text-zinc-400">
          Sovereign Hub Protocol v5.0
        </p>
      </footer>
    </main>
  );
}
