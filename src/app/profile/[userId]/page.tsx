
"use client"

import React, { use } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Gem, ShieldCheck, Trophy, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from 'next/link';
import { CollarIcon } from '@/components/mythic/MythicIcons';

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default function PublicProfilePage({ params }: ProfilePageProps) {
  const { userId } = use(params);
  const db = useFirestore();
  
  const userRef = React.useMemo(() => {
    if (!db || !userId) return null;
    return doc(db, 'users', userId);
  }, [db, userId]);

  const { data: profile, isLoading } = useDoc(userRef);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-zinc-800 mb-6" />
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Identidade Não Encontrada</h1>
        <p className="text-zinc-500 text-xs uppercase tracking-widest max-w-xs mb-8">Esta credencial não existe em nossos registros de elite.</p>
        <Button asChild variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white rounded-full">
          <Link href="/">Voltar ao Início</Link>
        </Button>
      </div>
    );
  }

  if (!profile.isPublicProfile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <ShieldCheck className="w-16 h-16 text-primary mb-6 animate-pulse" />
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Perfil Restrito</h1>
        <p className="text-zinc-500 text-xs uppercase tracking-widest max-w-xs mb-8">Este membro optou por manter suas credenciais sob sigilo místico.</p>
        <Button asChild variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white rounded-full">
          <Link href="/">Voltar ao Início</Link>
        </Button>
      </div>
    );
  }

  const isLegendary = profile.status === 'LEGENDARY';
  const isAmber = profile.status === 'AMBER';
  const themeClass = isLegendary ? 'theme-legendary' : isAmber ? 'theme-amber' : '';

  const getStatusBadge = () => {
    if (isLegendary) return { text: 'ACREDITAÇÃO LENDÁRIA', icon: <Crown className="w-4 h-4" />, style: 'border-yellow-500/50 bg-yellow-500/20 text-yellow-500 animate-gold-glow' };
    if (isAmber) return { text: 'STATUS LEGENDÁRIO', icon: <Gem className="w-4 h-4" />, style: 'border-orange-500/50 bg-orange-500/20 text-orange-500 animate-amber-glow' };
    return { text: 'MEMBRO MÍTICO', icon: <CollarIcon className="w-4 h-4" />, style: 'border-primary/50 bg-primary/10 text-primary' };
  };

  const badgeInfo = getStatusBadge();

  return (
    <main className={`min-h-screen bg-black text-white selection:bg-primary selection:text-white ${themeClass}`}>
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.3em]">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-900 pb-12">
          <div className="space-y-2">
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-bold">Membro Verificado</p>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">{profile.name}</h1>
          </div>
          <Badge variant="outline" className={`py-3 px-6 flex items-center gap-3 rounded-full font-black tracking-[0.15em] text-xs w-fit ${badgeInfo.style}`}>
            {badgeInfo.icon}
            {badgeInfo.text}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-xl p-6 md:p-8 space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                Dados de Influência
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="flex justify-between items-end p-4 rounded-xl bg-black/40 border border-zinc-800/30">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Ranking Global</span>
                <span className={`text-3xl font-black italic ${isLegendary ? 'gold-gradient-text' : isAmber ? 'amber-gradient-text' : 'text-white'}`}>
                  #{profile.rankingScore || 42}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-zinc-800/30">
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Desde</span>
                <span className="text-xs font-mono font-bold text-zinc-300">
                  {new Date(profile.registrationDateTime).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-xl p-6 md:p-8 flex flex-col justify-center items-center text-center space-y-4">
            <Trophy className={`w-12 h-12 mb-2 ${isLegendary ? 'text-yellow-500 animate-gold-glow' : isAmber ? 'text-orange-500 animate-amber-glow' : 'text-primary'}`} />
            <h3 className="text-lg font-black uppercase tracking-tighter">Status de Elite</h3>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed max-w-xs">
              Membro certificado com acesso total às funcionalidades de monitoramento biométrico e eventos exclusivos Hall Black.
            </p>
          </Card>
        </div>

        <footer className="pt-20 text-center opacity-30">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-8 bg-zinc-800" />
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <div className="h-px w-8 bg-zinc-800" />
          </div>
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-light">
            HALL BLACK CLUB SECURE PROFILE
          </p>
        </footer>
      </div>
    </main>
  );
}
