"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollarIcon, RubyShield } from "./MythicIcons";
import { Trophy, User, ShieldCheck, Heart, ArrowUpRight, PlusCircle, Sparkles, Crown, Gem } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface MythicDashboardProps {
  profile: any;
}

export function MythicDashboard({ profile }: MythicDashboardProps) {
  const luxuryPetImg = PlaceHolderImages.find(img => img.id === 'luxury-pet');
  const avatarImg = PlaceHolderImages.find(img => img.id === 'member-avatar');
  
  const isLegendary = profile.status === 'LEGENDARY';
  const isAmber = profile.status === 'AMBER';

  const getTitleText = () => {
    if (isLegendary) return 'SISTEMA LENDÁRIO ATIVO';
    if (isAmber) return 'SISTEMA LEGENDÁRIO ATIVO';
    return 'BEM-VINDO À ELITE';
  };

  const getStatusBadge = () => {
    if (isLegendary) return { text: 'ACREDITAÇÃO LENDÁRIA', icon: <Crown className="w-4 h-4" />, style: 'border-yellow-500/50 bg-yellow-500/20 text-yellow-500 animate-gold-glow' };
    if (isAmber) return { text: 'STATUS LEGENDÁRIO', icon: <Gem className="w-4 h-4" />, style: 'border-orange-500/50 bg-orange-500/20 text-orange-500 animate-amber-glow' };
    return { text: 'MEMBRO MÍTICO', icon: <CollarIcon className="w-4 h-4" />, style: 'border-primary/50 bg-primary/10 text-primary' };
  };

  const badgeInfo = getStatusBadge();

  return (
    <div className={`min-h-screen bg-black text-white p-4 md:p-8 animate-in fade-in duration-1000`}>
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h2 className={`text-3xl md:text-5xl font-bold font-headline mb-2 uppercase tracking-tight 
            ${isLegendary ? 'gold-gradient-text animate-text-gold-glow' : 
              isAmber ? 'amber-gradient-text animate-text-amber-glow' : 
              'animate-text-ruby-glow text-primary'}`}>
            {getTitleText()}
          </h2>
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Badge variant="outline" className={`py-1 px-4 flex items-center gap-2 rounded-full font-bold tracking-widest ${badgeInfo.style}`}>
              {badgeInfo.icon}
              {badgeInfo.text}
            </Badge>
            <span className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] ml-2">REGISTRO: #{profile.rank}923</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className={`border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-full px-6 gap-2 transition-all 
            ${isLegendary ? 'hover:border-yellow-500/50 hover:text-yellow-500' : 
              isAmber ? 'hover:border-orange-500/50 hover:text-orange-500' : 
              'hover:border-primary/50'}`}>
            <PlusCircle className="w-4 h-4" />
            Cadastrar Pet
          </Button>
          <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all 
            ${isLegendary ? 'border-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.4)]' : 
              isAmber ? 'border-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 
              'border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]'}`}>
            <Image 
              src={avatarImg?.imageUrl || ''} 
              alt="Avatar" 
              width={56} 
              height={56} 
              className="object-cover"
              data-ai-hint="fashionable person"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Card */}
        <Card className={`md:col-span-4 bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl relative overflow-hidden group 
          ${isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : ''}`}>
          <div className={`absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-30 transition-opacity rotate-12 
            ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`}>
            {isLegendary ? <Crown className="w-24 h-24" /> : isAmber ? <Gem className="w-24 h-24" /> : <RubyShield className="w-24 h-24" />}
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl tracking-tight">
              <User className={`w-5 h-5 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
              Perfil do Membro
            </CardTitle>
            <CardDescription className="text-zinc-500 uppercase text-[10px] tracking-widest">Controle de Identidade Elite</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-5 rounded-xl bg-black/60 border border-zinc-800/50">
              <div className="text-sm space-y-1">
                <p className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold">Nome do Titular</p>
                <p className="font-bold text-xl">{profile.name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/60 border border-zinc-800/50">
                <p className="text-zinc-500 uppercase text-[10px] tracking-widest mb-1">Status de Rede</p>
                <p className={`font-bold ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`}>GLOBAL</p>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-zinc-800/50">
                <p className="text-zinc-500 uppercase text-[10px] tracking-widest mb-1">Pontos Elite</p>
                <p className="font-bold text-white">2.450k</p>
              </div>
            </div>

            <Button className={`w-full h-12 font-bold transition-all duration-300 ${isLegendary ? 'bg-yellow-500 text-black hover:bg-yellow-400' : isAmber ? 'bg-orange-500 text-black hover:bg-orange-400' : 'bg-white text-black hover:bg-zinc-200'}`}>
              EDITAR PERFIL PÚBLICO
            </Button>
          </CardContent>
        </Card>

        {/* Pet Monitoring & Status */}
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className={`bg-zinc-900/40 border-zinc-800/50 overflow-hidden group relative ${isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : ''}`}>
            <div className="h-56 relative overflow-hidden">
               <Image 
                src={luxuryPetImg?.imageUrl || ''} 
                alt="Luxury Pet" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                data-ai-hint="luxury dog"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                <Badge className={`border-none font-bold uppercase tracking-tighter text-[10px] h-6 
                  ${isLegendary ? 'bg-yellow-500 text-black' : isAmber ? 'bg-orange-500 text-black' : 'bg-primary text-white'}`}>
                  {isLegendary ? 'OURO LENDÁRIO' : isAmber ? 'LEGENDÁRIO' : 'VIP MÍTICO'}
                </Badge>
                <span className="text-white font-bold text-xl tracking-tighter">THOR</span>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Heart className={`w-5 h-5 animate-pulse ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                Sinais Vitais Pet
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Monitoramento biométrico de alta precisão exclusivo para membros de nível lendário.
              </p>
              <Button 
                asChild
                className={`w-full h-12 font-bold transition-all group overflow-hidden relative 
                  ${isLegendary ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 
                    isAmber ? 'bg-orange-500 hover:bg-orange-400 text-black' : 
                    'bg-primary hover:bg-accent text-white'}`}
              >
                <a href="https://example.com/mundo-pet" target="_blank" rel="noopener noreferrer">
                  <span className="relative z-10 flex items-center justify-center">
                    {isLegendary || isAmber ? 'CONEXÃO LEGENDÁRIA' : 'MONITORAR AGORA'}
                    <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className={`bg-zinc-900/40 border-zinc-800/50 relative overflow-hidden ${isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl tracking-tight">
                <Trophy className={`w-5 h-5 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                Hall da Fama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Thor (Doberman)", points: "12,450", rank: 1 },
                { name: "Luna (Persa)", points: "10,200", rank: 2 },
                { name: "Zeus (Husky)", points: "9,800", rank: 3 }
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-xl bg-black/40 border border-zinc-800/30 transition-all hover:bg-black/60 
                  ${(isLegendary || isAmber) && i === 0 ? (isLegendary ? 'border-yellow-500/30' : 'border-orange-500/30') : ''}`}>
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black 
                      ${i === 0 ? 
                        (isLegendary ? 'bg-yellow-500 text-black' : 
                         isAmber ? 'bg-orange-500 text-black' : 
                         'bg-primary text-white') : 
                        'bg-zinc-800 text-zinc-400'}`}>
                      {item.rank}
                    </span>
                    <span className="font-semibold text-sm tracking-tight">{item.name}</span>
                  </div>
                  <span className={`${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'} font-black text-xs`}>{item.points} PTS</span>
                </div>
              ))}
              
              <div className="pt-6 border-t border-zinc-800/50 mt-4 text-center">
                <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] mb-3">Ranking Atual</p>
                <div className="flex items-center justify-center gap-3">
                  <span className={`text-4xl font-black italic ${isLegendary ? 'gold-gradient-text' : isAmber ? 'amber-gradient-text' : 'text-white'}`}>
                    {isLegendary || isAmber ? '#1' : '#42'}
                  </span>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-zinc-400 text-xs font-bold">TOP</span>
                    <span className="text-zinc-600 text-[10px]">GLOBAL</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pb-16 border-t border-zinc-900 pt-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-8 bg-zinc-800" />
          <Sparkles className={`w-4 h-4 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
          <div className="h-px w-8 bg-zinc-800" />
        </div>
        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.4em] font-light">
          &copy; 2024 HALL BLACK CLUB - EXCLUSIVIDADE {isLegendary ? 'LENDÁRIA' : isAmber ? 'LEGENDÁRIA' : 'MÍTICA'}
        </p>
      </footer>
    </div>
  );
}
