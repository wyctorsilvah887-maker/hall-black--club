
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollarIcon, RubyShield } from "./MythicIcons";
import { Trophy, User, ShieldCheck, Heart, ArrowUpRight, PlusCircle, Sparkles, Crown, Gem, Phone, LogOut, Settings, ExternalLink } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useCollection, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { collection } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MythicDashboardProps {
  profile: any;
}

export function MythicDashboard({ profile }: MythicDashboardProps) {
  const db = useFirestore();
  const auth = useAuth();
  const luxuryPetImg = PlaceHolderImages.find(img => img.id === 'luxury-pet');
  
  // Busca a coleção de usuários para contar o registro
  const usersQuery = useMemoFirebase(() => {
    return collection(db, 'users');
  }, [db]);
  
  const { data: usersData } = useCollection(usersQuery);
  const userCount = usersData?.length || 0;
  const formattedRegistration = userCount.toString().padStart(3, '0');

  const isLegendary = profile.status === 'LEGENDARY';
  const isAmber = profile.status === 'AMBER';

  const getTitleText = () => {
    if (isLegendary) return 'HALL BLACK LENDÁRIO';
    if (isAmber) return 'HALL BLACK LEGENDÁRIO';
    return 'HALL BLACK';
  };

  const getStatusBadge = () => {
    if (isLegendary) return { text: 'ACREDITAÇÃO LENDÁRIA', icon: <Crown className="w-3 h-3 md:w-4 md:h-4" />, style: 'border-yellow-500/50 bg-yellow-500/20 text-yellow-500 animate-gold-glow' };
    if (isAmber) return { text: 'STATUS LEGENDÁRIO', icon: <Gem className="w-3 h-3 md:w-4 md:h-4" />, style: 'border-orange-500/50 bg-orange-500/20 text-orange-500 animate-amber-glow' };
    return { text: 'MEMBRO MÍTICO', icon: <CollarIcon className="w-3 h-3 md:w-4 md:h-4" />, style: 'border-primary/50 bg-primary/10 text-primary' };
  };

  const badgeInfo = getStatusBadge();

  return (
    <div className={`min-h-screen bg-black text-white animate-in fade-in duration-1000 overflow-x-hidden`}>
      {/* CABEÇALHO SUPERIOR STICKY */}
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <h2 className={`text-base sm:text-xl md:text-2xl font-black font-headline uppercase tracking-tighter 
              ${isLegendary ? 'gold-gradient-text' : isAmber ? 'amber-gradient-text' : 'text-primary'}`}>
              {getTitleText()}
            </h2>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-4 w-px bg-zinc-800 mx-1" />
              <span className="text-zinc-500 text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-bold">
                REGISTRO: #{formattedRegistration}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="outline" 
              size="sm"
              className="hidden xs:flex h-9 rounded-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 px-4 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Novo Pet</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center border-2 transition-all bg-zinc-900/80 outline-none
                  ${isLegendary ? 'border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]' : 
                    isAmber ? 'border-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 
                    'border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)] hover:shadow-[0_0_15px_rgba(var(--primary),0.4)]'}`}>
                  <User className={`w-4 h-4 md:w-5 md:h-5 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-300">
                <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-zinc-500 px-3 pt-3">Conta Elite</DropdownMenuLabel>
                <div className="px-3 pb-3">
                  <p className="font-bold text-sm text-white truncate">{profile.name}</p>
                  <p className={`text-[9px] font-black uppercase tracking-tighter ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`}>
                    {badgeInfo.text}
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer py-2.5">
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Editar Perfil Público</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer py-2.5">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Ver Perfil Público</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem 
                  onClick={() => signOut(auth)}
                  className="focus:bg-red-950/30 focus:text-red-500 text-red-600 cursor-pointer py-2.5"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Encerrar Sessão</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:space-y-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8 md:pb-12">
          <div className="space-y-1">
            <p className="text-zinc-500 text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-bold">Bem-vindo ao Elite</p>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight uppercase leading-none">{profile.name}</h1>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={`py-2 px-5 flex items-center gap-2 rounded-full font-bold tracking-widest text-[10px] md:text-xs w-fit ${badgeInfo.style}`}>
              {badgeInfo.icon}
              {badgeInfo.text}
            </Badge>
            <span className="sm:hidden text-zinc-500 text-[8px] uppercase tracking-[0.2em] font-bold ml-1">
              REGISTRO: #{formattedRegistration}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Profile Card */}
          <Card className={`md:col-span-4 bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl relative overflow-hidden group 
            ${isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : ''}`}>
            <div className={`absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-30 transition-opacity rotate-12 pointer-events-none
              ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`}>
              {isLegendary ? <Crown className="w-16 h-16 md:w-24 md:h-24" /> : isAmber ? <Gem className="w-16 h-16 md:w-24 md:h-24" /> : <RubyShield className="w-16 h-16 md:w-24 md:h-24" />}
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg md:text-xl tracking-tight">
                <ShieldCheck className={`w-4 h-4 md:w-5 md:h-5 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                Credencial de Membro
              </CardTitle>
              <CardDescription className="text-zinc-500 uppercase text-[9px] md:text-[10px] tracking-widest">Identificação Criptografada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-4 p-4 md:p-5 rounded-xl bg-black/60 border border-zinc-800/50">
                <div className="text-sm space-y-0.5">
                  <p className="text-zinc-500 uppercase text-[8px] md:text-[10px] tracking-widest font-semibold">Titular da Conta</p>
                  <p className="font-bold text-lg md:text-xl break-words">{profile.name}</p>
                </div>
              </div>

              {profile.emergencyContact && (
                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-black/40 border border-zinc-800/30">
                  <Phone className={`w-4 h-4 flex-shrink-0 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                  <div className="text-sm">
                    <p className="text-zinc-500 uppercase text-[8px] md:text-[9px] tracking-widest font-semibold">Contato Emergencial</p>
                    <p className="font-mono text-white text-xs sm:text-sm">{profile.emergencyContact}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 md:p-4 rounded-xl bg-black/60 border border-zinc-800/50">
                  <p className="text-zinc-500 uppercase text-[8px] md:text-[10px] tracking-widest mb-1">Status Rede</p>
                  <p className={`font-bold text-xs sm:text-sm ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`}>VERIFICADO</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-black/60 border border-zinc-800/50">
                  <p className="text-zinc-500 uppercase text-[8px] md:text-[10px] tracking-widest mb-1">Influência</p>
                  <p className="font-bold text-white text-xs sm:text-sm">MÍTICA</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pet Monitoring & Status */}
          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Card className={`bg-zinc-900/40 border-zinc-800/50 overflow-hidden group relative ${isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : ''}`}>
              <div className="h-48 md:h-56 relative overflow-hidden">
                 <Image 
                  src={luxuryPetImg?.imageUrl || ''} 
                  alt="Luxury Pet" 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  data-ai-hint="luxury dog"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 flex flex-col gap-1">
                  <Badge className={`border-none font-bold uppercase tracking-tighter text-[8px] md:text-[10px] h-5 md:h-6 px-2 
                    ${isLegendary ? 'bg-yellow-500 text-black' : isAmber ? 'bg-orange-500 text-black' : 'bg-primary text-white'}`}>
                    {isLegendary ? 'OURO LENDÁRIO' : isAmber ? 'LEGENDÁRIO' : 'VIP MÍTICO'}
                  </Badge>
                  <span className="text-white font-bold text-lg md:text-xl tracking-tighter uppercase">Thor</span>
                </div>
              </div>
              <CardContent className="p-5 md:p-6 space-y-3 md:space-y-4">
                <h3 className="text-base md:text-lg font-bold flex items-center gap-2 uppercase">
                  <Heart className={`w-4 h-4 md:w-5 md:h-5 animate-pulse ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                  Sinais Vitais Pet
                </h3>
                <p className="text-zinc-400 text-[11px] md:text-xs leading-relaxed">
                  Monitoramento biométrico de alta precisão exclusivo para membros da elite Hall Black.
                </p>
                <Button 
                  asChild
                  className={`w-full h-11 md:h-12 text-xs font-bold transition-all group overflow-hidden relative 
                    ${isLegendary ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 
                      isAmber ? 'bg-orange-500 hover:bg-orange-400 text-black' : 
                      'bg-primary hover:bg-accent text-white'}`}
                >
                  <a href="https://example.com/mundo-pet" target="_blank" rel="noopener noreferrer">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLegendary || isAmber ? 'CONEXÃO LEGENDÁRIA' : 'MONITORAR AGORA'}
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className={`bg-zinc-900/40 border-zinc-800/50 relative overflow-hidden ${isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : ''}`}>
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl tracking-tight uppercase">
                  <Trophy className={`w-4 h-4 md:w-5 md:h-5 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                  Hall da Fama
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {[
                  { name: "Thor (Doberman)", points: "12,450", rank: 1 },
                  { name: "Luna (Persa)", points: "10,200", rank: 2 },
                  { name: "Zeus (Husky)", points: "9,800", rank: 3 }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl bg-black/40 border border-zinc-800/30 transition-all hover:bg-black/60 
                    ${(isLegendary || isAmber) && i === 0 ? (isLegendary ? 'border-yellow-500/30' : 'border-orange-500/30') : ''}`}>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black 
                        ${i === 0 ? 
                          (isLegendary ? 'bg-yellow-500 text-black' : 
                           isAmber ? 'bg-orange-500 text-black' : 
                           'bg-primary text-white') : 
                          'bg-zinc-800 text-zinc-400'}`}>
                        {item.rank}
                      </span>
                      <span className="font-semibold text-xs sm:text-sm tracking-tight truncate max-w-[100px] xs:max-w-none">{item.name}</span>
                    </div>
                    <span className={`${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'} font-black text-[10px] sm:text-xs`}>{item.points} PTS</span>
                  </div>
                ))}
                
                <div className="pt-4 md:pt-6 border-t border-zinc-800/50 mt-2 md:mt-4 text-center">
                  <p className="text-[8px] md:text-[9px] text-zinc-500 uppercase tracking-[0.3em] mb-2 md:mb-3">Ranking Atual</p>
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <span className={`text-3xl md:text-4xl font-black italic ${isLegendary ? 'gold-gradient-text' : isAmber ? 'amber-gradient-text' : 'text-white'}`}>
                      {isLegendary || isAmber ? '#1' : '#42'}
                    </span>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-zinc-400 text-[10px] md:text-xs font-bold">TOP</span>
                      <span className="text-zinc-600 text-[8px] md:text-[10px]">GLOBAL</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-12 md:mt-20 pb-12 md:pb-16 border-t border-zinc-900 pt-8 md:pt-10 text-center">
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
          <div className="h-px w-6 md:w-8 bg-zinc-800" />
          <Crown className={`w-3 h-3 md:w-4 md:h-4 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
          <div className="h-px w-6 md:w-8 bg-zinc-800" />
        </div>
        <p className="text-zinc-600 text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-light px-4">
          &copy; 2024 HALL BLACK CLUB - EXCLUSIVIDADE {isLegendary ? 'LENDÁRIA' : isAmber ? 'LEGENDÁRIA' : 'MÍTICA'}
        </p>
      </footer>
    </div>
  );
}
