
"use client"

import React, { use, useState, useEffect } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, ShieldAlert, User, MapPin, ShieldCheck, ChevronRight, Siren, AlertCircle, MessageSquare, PhoneCall } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { CollarIcon, RankBadge } from '@/components/mythic/MythicIcons';

interface PetPageProps {
  params: Promise<{ userId: string; petId: string }>;
}

type IntroPhase = 'initial' | 'shutdown' | 'stamp' | 'fade_stamp' | 'reveal' | 'done';

export default function PetProfilePage({ params }: PetPageProps) {
  const { userId, petId } = use(params);
  const db = useFirestore();
  
  const [introPhase, setIntroPhase] = useState<IntroPhase>('initial');

  useEffect(() => {
    // Sequência de animação AAA de Alta Fidelidade com tempos de leitura estendidos
    setIntroPhase('shutdown');
    
    // 1. TV Shutdown termina em 2.5s.
    const tStamp = setTimeout(() => {
      setIntroPhase('stamp');
    }, 2600); 

    // 2. O Carimbo (stamp) ocorre. Aumentamos o tempo de exibição estática 
    // para garantir que o membro possa ler o texto "LENDÁRIO" ou "MÍTICO".
    // Agora a badge fica visível por aproximadamente 4.5 segundos.
    const tFadeStamp = setTimeout(() => {
      setIntroPhase('fade_stamp');
    }, 7500);

    // 3. O desvanecimento da badge (fade_stamp) leva 2s.
    const tReveal = setTimeout(() => {
      setIntroPhase('reveal');
    }, 9500);

    // 4. Revelação final concluída após a animação de slow-reveal (4s).
    const tDone = setTimeout(() => {
      setIntroPhase('done');
    }, 13500);

    return () => {
      clearTimeout(tStamp);
      clearTimeout(tFadeStamp);
      clearTimeout(tReveal);
      clearTimeout(tDone);
    };
  }, []);

  const petRef = React.useMemo(() => {
    if (!db || !userId || !petId) return null;
    return doc(db, 'users', userId, 'pets', petId);
  }, [db, userId, petId]);

  const ownerRef = React.useMemo(() => {
    if (!db || !userId) return null;
    return doc(db, 'users', userId);
  }, [db, userId]);

  const { data: pet, isLoading: isPetLoading } = useDoc(petRef);
  const { data: owner, isLoading: isOwnerLoading } = useDoc(ownerRef);

  if (isPetLoading || isOwnerLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-t-2 border-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!pet || !owner) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="w-12 h-12 text-zinc-900 mb-6" />
        <h1 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Protocolo Inexistente</h1>
        <p className="text-zinc-600 text-[10px] uppercase tracking-widest max-w-xs mb-8 leading-relaxed">Este registro não foi localizado em nossa rede de elite.</p>
        <Button asChild variant="outline" className="border-zinc-800 text-zinc-500 hover:text-white rounded-full h-11 px-8 text-[10px] font-black uppercase tracking-widest">
          <Link href="/">Retornar</Link>
        </Button>
      </div>
    );
  }

  const isLegendary = owner.status === 'LEGENDARY';
  const isAmber = owner.status === 'AMBER';
  const themeClass = isLegendary ? 'theme-legendary' : isAmber ? 'theme-amber' : '';
  const themeColorClass = isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary';
  const themeBorderClass = isLegendary ? 'border-yellow-500/30' : isAmber ? 'border-orange-500/30' : 'border-primary/30';

  const isSOSActive = pet.isEmergencyActive;
  
  const cleanPhone = owner.emergencyContact?.replace(/\D/g, '') || '';
  const whatsappUrl = `https://wa.me/${cleanPhone}`;
  const telUrl = `tel:${cleanPhone}`;

  return (
    <main className={`min-h-screen bg-black text-white selection:bg-primary selection:text-white pb-12 overflow-x-hidden relative ${themeClass}`}>
      {/* OVERLAY DE ANIMAÇÃO ELITE */}
      {introPhase !== 'done' && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-1000 ${introPhase === 'reveal' ? 'opacity-0' : 'opacity-100'}`}>
          {/* Shutdown da TV */}
          {introPhase === 'shutdown' && (
            <div className="w-full h-full bg-white animate-tv-shutdown" />
          )}

          {/* Carimbo da Badge no Escuro - Com tempo de leitura ampliado */}
          {(introPhase === 'stamp' || introPhase === 'fade_stamp') && (
            <div className={`flex flex-col items-center gap-8 ${introPhase === 'stamp' ? 'animate-badge-stamp' : 'animate-badge-fade-out'}`}>
              <RankBadge status={owner.status} size="lg" className="drop-shadow-[0_0_50px_rgba(var(--primary),0.6)]" />
              <div className="space-y-2 text-center">
                <p className={`text-[12px] font-black uppercase tracking-[0.8em] ${themeColorClass} animate-pulse`}>Autenticação Confirmada</p>
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic opacity-50">Protocolo de Elite Hall Black</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL COM REVELAÇÃO LENTA */}
      <div className={`relative z-10 ${(introPhase === 'reveal' || introPhase === 'done') ? 'animate-slow-reveal' : 'opacity-0'}`}>
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] opacity-20" />
        </div>

        <div className="max-w-3xl mx-auto px-5 pt-8 md:pt-16 space-y-10 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-[9px] font-bold uppercase tracking-[0.4em]">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Início
          </Link>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div className={`relative w-40 h-40 md:w-56 md:h-56 rounded-[2rem] overflow-hidden border shadow-2xl transition-all duration-700
                ${isSOSActive ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]' : isLegendary ? 'border-yellow-500 animate-gold-glow' : isAmber ? 'border-orange-500 animate-amber-glow' : 'border-primary animate-ruby-glow'}`}>
                
                {pet.photo ? (
                  <Image 
                    src={pet.photo} 
                    alt={pet.name} 
                    fill 
                    className="object-cover" 
                    priority 
                    unoptimized 
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-zinc-900" />
                  </div>
                )}
                {isSOSActive && (
                  <div className="absolute top-4 right-4 z-30 bg-red-600 p-2 rounded-xl animate-pulse">
                    <Siren className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              {/* Badge abaixo da foto */}
              <RankBadge status={owner.status} className="-mt-14 scale-75 md:scale-100 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="h-px w-4 bg-zinc-800" />
                <p className="text-zinc-500 text-[9px] uppercase tracking-[0.6em] font-black">Linhagem de Elite</p>
                <span className="h-px w-4 bg-zinc-800" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">{pet.name}</h1>
              <div className="flex justify-center gap-2 pt-1">
                <Badge variant="outline" className="py-1 px-3 rounded-full border-zinc-900 bg-zinc-950 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                  {pet.species}
                </Badge>
                <Badge variant="outline" className={`py-1 px-3 rounded-full font-black uppercase tracking-widest text-[9px] bg-primary/5 ${themeBorderClass} ${themeColorClass}`}>
                  IDENTIDADE VERIFICADA
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-zinc-950/40 border-zinc-900/50 backdrop-blur-2xl p-5 md:p-6 rounded-3xl group overflow-hidden relative">
               <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <User className={`w-24 h-24 ${themeColorClass}`} />
               </div>
               <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2">
                    <User className={`w-3 h-3 ${themeColorClass}`} />
                    Guardião
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-0 space-y-4">
                  <div className="space-y-1">
                    <p className="text-white font-black text-xl uppercase tracking-tight">{owner.name}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${themeColorClass}`}>
                      {owner.status === 'LEGENDARY' ? 'PLATINUM LENDÁRIO' : owner.status === 'AMBER' ? 'RUBI LEGENDÁRIO' : 'MEMBRO MÍTICO'}
                    </p>
                  </div>
                  <Button asChild variant="ghost" className="p-0 h-auto text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white flex items-center gap-1 group/btn">
                    <Link href={`/profile/${owner.id}`}>
                      Ver Perfil Completo <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
               </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
               <Card className={`bg-zinc-950/40 border-zinc-900/50 backdrop-blur-2xl p-5 md:p-6 rounded-3xl flex items-center justify-between transition-all duration-500
                 ${isSOSActive ? 'border-red-600/50 bg-red-950/10' : ''}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <MapPin className={`w-3 h-3 ${themeColorClass}`} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Procedência</span>
                    </div>
                    <p className="text-white font-black text-xs uppercase tracking-tight">
                      {owner.city ? `${owner.city}, ${owner.state || ''}` : 'LOCALIZAÇÃO RESTRITA'}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-zinc-900/50" />
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Siren className={`w-3 h-3 ${isSOSActive ? 'text-red-500 animate-pulse' : 'text-zinc-800'}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isSOSActive ? 'text-red-500' : 'text-zinc-600'}`}>
                        {isSOSActive ? 'Emergência Ativa' : 'SOS Privado'}
                      </span>
                    </div>
                    {!isSOSActive && (
                      <p className="text-[9px] font-bold text-zinc-800 uppercase italic">Protegido</p>
                    )}
                  </div>
               </Card>

               <Card className={`bg-zinc-950/40 border-zinc-900/50 backdrop-blur-2xl p-4 rounded-3xl flex items-center gap-4 transition-colors
                 ${isSOSActive ? 'border-red-600/30' : ''}`}>
                  <div className={`p-2 rounded-xl bg-black border ${isSOSActive ? 'border-red-600' : themeBorderClass}`}>
                    {isSOSActive ? (
                      <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
                    ) : (
                      <ShieldCheck className={`w-5 h-5 ${themeColorClass} opacity-50`} />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className={`text-[9px] font-black uppercase tracking-widest ${isSOSActive ? 'text-red-500' : 'text-white'}`}>
                      {isSOSActive ? 'ALERTA DE SEGURANÇA' : 'Segurança Ativa'}
                    </h3>
                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest">Protocolo Hall Black v2.0</p>
                  </div>
               </Card>
            </div>
          </div>

          {isSOSActive && (
            <Card className="bg-red-950/10 border-red-600/30 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-red-500 font-black text-2xl uppercase tracking-tighter italic">PET ENCONTRA-SE PERDIDO</h2>
                <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold max-w-sm mx-auto leading-relaxed">
                  ESTE ANIMAL FAZ PARTE DA REDE HALL BLACK. POR FAVOR, AJUDE-O A VOLTAR PARA CASA USANDO OS CANAIS DE CONTATO ABAIXO.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl group">
                  <a href={telUrl} className="flex items-center justify-center gap-2">
                    <PhoneCall className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Lugar para o Dono
                  </a>
                </Button>
                <Button asChild className="flex-1 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl group">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </Card>
          )}

          <div className="pt-8 flex flex-col items-center text-center">
             <CollarIcon className="w-8 h-8 text-zinc-900 mb-4" />
             <p className="text-[8px] text-zinc-700 uppercase tracking-[0.6em] font-medium max-w-[200px] leading-relaxed">
               ESTE DOCUMENTO DIGITAL CERTIFICA A IDENTIDADE DE ELITE DO ANIMAL NO ECOSSISTEMA HALL BLACK.
             </p>
          </div>

          <footer className="pt-12 text-center opacity-30">
            <p className="text-[8px] text-zinc-800 uppercase tracking-[0.5em] font-black">
              HALL BLACK PET IDENTITY PROTOCOL © {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
