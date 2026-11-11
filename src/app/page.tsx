
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { EliteLoader } from '@/components/mythic/EliteLoader';
import { AuthGate } from '@/components/mythic/AuthGate';
import { Button } from "@/components/ui/button";
import { ShieldCheck, ChevronRight, BookOpen, Terminal, MessageSquare, Trophy, Zap, ArrowRight, Lock } from "lucide-react";
import NextImage from 'next/image';
import Link from 'next/link';

/**
 * @fileOverview Landing Page Oficial - Sovereign Founders Club.
 * Porta de entrada luxuosa para o ecossistema de elite, otimizada para mobile.
 */

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [tempProfile, setTempProfile] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mythic_access_granted');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTempProfile(parsed);
        setShowAuth(true);
      } catch (e) {
        localStorage.removeItem('mythic_access_granted');
      }
    }
  }, []);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/hub');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return <EliteLoader />;
  }

  if (showAuth) {
    return (
      <main className="min-h-screen bg-black relative animate-in fade-in duration-1000">
        <div className="absolute top-6 left-6 z-[60]">
          <button 
            onClick={() => setShowAuth(false)} 
            className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-[9px] font-black uppercase tracking-[0.3em]"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Retornar
          </button>
        </div>
        <AuthGate theme={tempProfile?.theme} tempProfile={tempProfile} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary/30 overflow-x-hidden font-body">
      
      {/* HERO SECTION CINEMATOGRÁFICA */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-primary/10 rounded-full blur-[100px] md:blur-[180px] animate-pulse" />
        </div>

        <div className="relative z-10 max-w-5xl space-y-10 md:space-y-16 animate-in fade-in zoom-in duration-1000">
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <NextImage 
              src="/logo-sfc.gif" 
              alt="Sovereign Founders Club" 
              width={500} 
              height={150} 
              className="w-64 md:w-[550px] h-auto object-contain"
              unoptimized
              priority
            />
            <div className="h-px w-16 md:w-24 bg-zinc-900" />
            <p className="text-[8px] md:text-xs font-black uppercase tracking-[0.8em] md:tracking-[1em] text-zinc-600 ml-2 md:ml-4">
              Protocolo Apex v2026.12
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <h1 className="text-4xl md:text-9xl font-black tracking-tighter uppercase leading-[0.9] text-white">
              O Ápice do <br />
              <span className="text-primary">Poder Digital</span>
            </h1>
            <p className="text-[10px] md:text-xl text-zinc-500 font-bold max-w-2xl mx-auto uppercase tracking-[0.15em] md:tracking-[0.2em] leading-relaxed px-4">
              O ecossistema definitivo para fundadores, estrategistas e visionários. Onde a linhagem de elite encontra a inteligência artificial de escala.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-4 md:pt-6">
            <Button 
              onClick={() => setShowAuth(true)}
              className="h-14 md:h-20 w-full sm:w-auto px-10 md:px-16 bg-primary hover:bg-accent text-white font-black uppercase tracking-[0.4em] text-[9px] md:text-xs rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-95 group"
            >
              Garantir Vaga <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => document.getElementById('pillars')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-14 md:h-20 w-full sm:w-auto px-10 md:px-16 border-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-950 font-black uppercase tracking-[0.4em] text-[9px] md:text-xs rounded-2xl transition-all"
            >
              Explorar Protocolos
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-20 animate-bounce">
           <span className="text-[7px] font-black uppercase tracking-[0.5em] vertical-text">Scroll</span>
           <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
      </section>

      {/* PILLARS SECTION */}
      <section id="pillars" className="py-24 md:py-40 px-6 md:px-12 border-t border-zinc-900/50 relative">
        <div className="max-w-7xl mx-auto space-y-32 md:space-y-40">
          
          {/* THE VAULT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 md:space-y-10 order-2 lg:order-1">
              <div className="inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20">
                <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-7xl font-black uppercase tracking-tighter leading-none">O Cofre de <br /><span className="text-primary">Estratégia</span></h2>
              <p className="text-zinc-500 text-xs md:text-lg font-bold leading-relaxed uppercase tracking-widest italic">
                Acesso imediato a protocolos de escala, modelos de SaaS de alta margem e engenharia financeira reservados aos detentores das chaves Sovereign.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {["SaaS & Recorrência", "Arquitetura High-Ticket", "Equity & Protection", "Growth Exponencial"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-950/50 p-4 rounded-xl border border-zinc-900">
                    <Zap className="w-3 h-3 text-primary" /> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-video lg:aspect-[4/3] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-zinc-900 shadow-2xl order-1 lg:order-2 group">
               <NextImage src="https://picsum.photos/seed/vault-landing/1200/900" fill className="object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="The Vault" data-ai-hint="luxury safe" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <Lock className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
               </div>
            </div>
          </div>

          {/* SOVEREIGN IA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-video lg:aspect-[4/3] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-zinc-900 shadow-2xl group">
               <NextImage src="https://picsum.photos/seed/ia-landing/1200/900" fill className="object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="Sovereign IA" data-ai-hint="futuristic server" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <Terminal className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
               </div>
            </div>
            <div className="space-y-8 md:space-y-10">
              <div className="inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20">
                <Terminal className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-7xl font-black uppercase tracking-tighter leading-none">Terminal <br /><span className="text-primary">Advisor IA</span></h2>
              <p className="text-zinc-500 text-xs md:text-lg font-bold leading-relaxed uppercase tracking-widest italic">
                Auditoria de negócios em tempo real. Uma inteligência sem filtros para dissecar seu projeto e prover rotas de escala sem precedentes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {["Análise Estratégica", "Link Neural Ativo", "Auditoria de Escala", "Suporte Decisório"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-950/50 p-4 rounded-xl border border-zinc-900">
                    <Zap className="w-3 h-3 text-primary" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BLACK ROOM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 md:space-y-10 order-2 lg:order-1">
              <div className="inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20">
                <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-7xl font-black uppercase tracking-tighter leading-none">Black Room <br /><span className="text-primary">Networking</span></h2>
              <p className="text-zinc-500 text-xs md:text-lg font-bold leading-relaxed uppercase tracking-widest italic">
                Onde o networking de verdade acontece. Uma rede segura e criptografada para conexões místicas entre fundadores de alto escalão.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {["Rede Segura", "Membros Verificados", "Negócios de Elite", "Sigilo Absoluto"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-950/50 p-4 rounded-xl border border-zinc-900">
                    <Zap className="w-3 h-3 text-primary" /> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-video lg:aspect-[4/3] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-zinc-900 shadow-2xl group order-1 lg:order-2">
               <NextImage src="https://picsum.photos/seed/room-landing/1200/900" fill className="object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="Black Room" data-ai-hint="luxury lounge" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* CALL TO ACTION FINAL */}
      <section className="py-40 md:py-60 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 blur-[120px] md:blur-[180px] rounded-full scale-150 animate-pulse" />
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16 relative z-10">
          <div className="flex flex-col items-center gap-6 md:gap-8">
            <Trophy className="w-16 h-16 md:w-20 md:h-20 text-primary drop-shadow-[0_0_30px_rgba(var(--primary),0.5)]" />
            <h2 className="text-4xl md:text-[8rem] font-black uppercase tracking-tighter leading-none text-white">Ascenda à <br /> Linhagem</h2>
            <p className="text-zinc-500 text-[10px] md:text-2xl font-black uppercase tracking-[0.3em] md:tracking-[0.4em] max-w-3xl mx-auto leading-relaxed">
              Protocolo de acesso liberado. <br /> Assinatura de elite por apenas <span className="text-white">R$ 10,90/mês</span>.
            </p>
          </div>
          
          <Button 
            onClick={() => setShowAuth(true)}
            className="h-16 md:h-24 w-full sm:w-auto px-12 md:px-24 bg-primary hover:bg-accent text-white font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-[9px] md:text-sm rounded-2xl shadow-[0_20px_60px_rgba(var(--primary),0.2)] md:shadow-[0_30px_70px_rgba(var(--primary),0.3)] transition-all active:scale-95 group"
          >
            Garantir Vaga <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-3 transition-transform duration-500" />
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-8 md:pt-12 opacity-30">
             <div className="flex items-center gap-2 md:gap-3">
               <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-primary" />
               <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Acreditação Digital</span>
             </div>
             <div className="flex items-center gap-2 md:gap-3">
               <Lock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
               <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Identidade Blindada</span>
             </div>
          </div>
        </div>
      </section>

      {/* FOOTER LUXUOSO */}
      <footer className="py-16 md:py-24 border-t border-zinc-900/50 bg-zinc-950/20 backdrop-blur-3xl text-center space-y-8 md:space-y-12">
        <div className="flex flex-col items-center gap-4 md:gap-6 px-6">
          <NextImage 
            src="/logo-sfc.gif" 
            alt="Sovereign Founders Club" 
            width={240} 
            height={70} 
            className="h-10 md:h-12 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
            unoptimized
          />
          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[1em] md:tracking-[1.2em] text-zinc-700 leading-relaxed">Sovereign Founders Identity System • MMXXVI</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 gap-y-4 px-6">
           <button onClick={() => setShowAuth(true)} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Portal de Acesso</button>
           <button onClick={() => document.getElementById('pillars')?.scrollIntoView({ behavior: 'smooth' })} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Explorar Ecossistema</button>
           <Link href="/staff" className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Terminal do Alto Conselho</Link>
        </div>

        <div className="pt-8 md:pt-12 flex flex-col items-center gap-2">
           <div className="h-[1px] md:h-[2px] w-10 md:w-12 bg-primary/20" />
           <p className="text-[6px] md:text-[7px] font-black text-zinc-800 uppercase tracking-[0.5em]">Exclusive Membership Protocol</p>
        </div>
      </footer>
    </main>
  );
}
