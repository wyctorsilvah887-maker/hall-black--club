"use client"

import React, { use } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Gem, ShieldCheck, Trophy, ArrowLeft, ShieldAlert, MapPin, User, Calendar, Quote, Star } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { CollarIcon, RankBadge } from '@/components/mythic/MythicIcons';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';
import { EliteLoader } from '@/components/mythic/EliteLoader';

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default function PublicProfilePage({ params }: ProfilePageProps) {
  const { userId } = use(params);
  const db = useFirestore();
  
  const userRef = useMemoFirebase(() => {
    if (!db || !userId) return null;
    return doc(db, 'users', userId);
  }, [db, userId]);

  const { data: profile, isLoading } = useDoc(userRef);

  if (isLoading) {
    return <EliteLoader />;
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

  const currentRank = calculateRankByTime(profile.registrationDateTime, profile.status);
  const themeClass = getThemeClass(currentRank);

  const getBadgeInfo = (rank: string) => {
    switch (rank) {
      case 'HALL_BLACK': 
        return { text: 'SOVEREIGN FOUNDER', icon: <Star className="w-4 h-4" />, style: 'border-zinc-700 bg-zinc-900/50 text-white' };
      case 'MYTHIC':
        return { text: 'MEMBRO MÍTICO', icon: <CollarIcon className="w-4 h-4" />, style: 'border-primary/50 bg-primary/10 text-primary animate-ruby-glow' };
      case 'AMBER':
        return { text: 'LEGENDÁRIO ÂMBAR', icon: <Gem className="w-4 h-4" />, style: 'border-orange-500/50 bg-orange-500/20 text-orange-500 animate-amber-glow' };
      case 'LEGENDARY':
        return { text: 'ACREDITAÇÃO LENDÁRIA', icon: <Crown className="w-4 h-4" />, style: 'border-yellow-500/50 bg-yellow-500/20 text-yellow-500 animate-gold-glow' };
      default:
        return { text: 'MEMBRO ELITE', icon: <ShieldCheck className="w-4 h-4" />, style: 'border-zinc-500/50 bg-zinc-500/10 text-zinc-400' };
    }
  };

  const badgeInfo = getBadgeInfo(currentRank);

  const showBio = profile.showBio !== false;
  const showLocation = profile.showLocation !== false;
  const showJoinDate = profile.showJoinDate !== false;

  return (
    <main className={`min-h-screen bg-black text-white selection:bg-primary selection:text-white ${themeClass}`}>
      <div className="max-w-4xl mx-auto px-5 py-8 md:py-20 space-y-10 md:space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.3em]">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-zinc-900 pb-10 md:pb-12">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 shadow-2xl transition-transform hover:scale-105 duration-500 flex-shrink-0
                ${currentRank === 'HALL_BLACK' ? 'border-zinc-800' : 
                  currentRank === 'MYTHIC' ? 'border-primary animate-ruby-glow' :
                  currentRank === 'AMBER' ? 'border-orange-500 animate-amber-glow' :
                  currentRank === 'LEGENDARY' ? 'border-yellow-500 animate-gold-glow' : 'border-zinc-700'}`}>
                {profile.photo ? (
                  <Image src={profile.photo} alt={profile.name} width={160} height={160} className="object-cover w-full h-full" unoptimized />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <User className="w-12 h-12 md:w-16 md:h-16 text-zinc-800" />
                  </div>
                )}
              </div>
              <RankBadge status={currentRank} id={profile.id} size="md" className="-mt-12 scale-75 md:scale-100" />
            </div>
            
            <div className="space-y-2 text-center md:text-left">
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-bold">Membro Verificado</p>
              <h1 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none break-words max-w-full md:max-w-md">{profile.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-1">
                {showLocation && (profile.city || profile.state) && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[10px] md:text-[12px] font-black uppercase tracking-widest italic">
                      {profile.city}{profile.city && profile.state ? ', ' : ''}{profile.state}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-600">
                  <ShieldCheck className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[10px] md:text-[12px] font-black uppercase tracking-widest">IDENTIDADE CONFIRMADA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showBio && profile.bio && (
          <div className="relative group">
            <Quote className="absolute -top-4 -left-2 w-8 h-8 text-zinc-900 group-hover:text-primary/20 transition-colors" />
            <div className="bg-zinc-950/40 border border-zinc-900/50 p-6 md:p-8 rounded-[2rem] backdrop-blur-xl">
              <p className="text-zinc-400 text-sm md:text-base font-medium leading-relaxed italic">
                "{profile.bio}"
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-xl p-6 md:p-8 space-y-6 rounded-[2rem]">
            <CardHeader className="p-0">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${badgeInfo.style}`} />
                Dados da Credencial
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-black/40 border border-zinc-800/30 gap-2">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-zinc-700" />
                  <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Status de Acesso</span>
                </div>
                <Badge variant="outline" className={`py-1 px-3 rounded-full font-black tracking-widest text-[9px] ${badgeInfo.style}`}>
                  {badgeInfo.text}
                </Badge>
              </div>
              {showJoinDate && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-black/40 border border-zinc-800/30">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-zinc-700" />
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Acreditação</span>
                  </div>
                  <span className="text-[11px] md:text-xs font-mono font-bold text-zinc-300">
                    {profile.registrationDateTime ? new Date(profile.registrationDateTime).toLocaleDateString('pt-BR') : '---'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-xl p-6 md:p-8 flex flex-col justify-center items-center text-center space-y-4 rounded-[2rem]">
            <Trophy className={`w-10 h-10 md:w-12 md:h-12 mb-2 ${currentRank === 'HALL_BLACK' ? 'text-white' : currentRank === 'MYTHIC' ? 'text-primary' : currentRank === 'AMBER' ? 'text-orange-500' : 'text-yellow-500'}`} />
            <h3 className="text-base md:text-lg font-black uppercase tracking-tighter">Status de Elite</h3>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed max-w-xs">
              Membro certificado com acesso total às funcionalidades e eventos exclusivos Sovereign. Identidade verificada em rede segura.
            </p>
          </Card>
        </div>

        <footer className="pt-12 md:pt-20 text-center opacity-30">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-8 bg-zinc-800" />
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <div className="h-px w-8 bg-zinc-800" />
          </div>
          <p className="text-[8px] md:text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-light px-4">
            SOVEREIGN FOUNDERS CLUB SECURE PROFILE • IDENTIDADE PROTEGIDA
          </p>
        </footer>
      </div>
    </main>
  );
}