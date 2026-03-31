"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollarIcon, RubyShield } from "./MythicIcons";
import { Trophy, User, ShieldCheck, Heart, ArrowUpRight, PlusCircle, Sparkles, Crown } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface MythicDashboardProps {
  profile: any;
}

export function MythicDashboard({ profile }: MythicDashboardProps) {
  const luxuryPetImg = PlaceHolderImages.find(img => img.id === 'luxury-pet');
  const avatarImg = PlaceHolderImages.find(img => img.id === 'member-avatar');
  const isLegendary = profile.status === 'LEGENDARY';

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 animate-in fade-in duration-1000">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h2 className={`text-3xl md:text-4xl font-bold font-headline mb-2 uppercase tracking-tight ${isLegendary ? 'gold-gradient-text' : 'animate-text-ruby-glow'}`}>
            {isLegendary ? 'STATUS LENDÁRIO ATIVADO' : 'BEM-VINDO À ELITE'}
          </h2>
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Badge variant="outline" className={`border-primary/50 bg-primary/10 text-primary py-1 px-3 flex items-center gap-2 rounded-full font-bold tracking-wider ${isLegendary ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500' : ''}`}>
              {isLegendary ? <Crown className="w-4 h-4" /> : <CollarIcon className="w-4 h-4" />}
              {isLegendary ? 'MEMBRO LENDÁRIO' : 'STATUS MÍTICO'}
            </Badge>
            <span className="text-zinc-500 text-xs uppercase tracking-widest">ID: {profile.rank}923-B</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-full px-6 gap-2">
            <PlusCircle className="w-4 h-4" />
            Cadastrar Pet
          </Button>
          <div className={`w-12 h-12 rounded-full overflow-hidden border-2 shadow-[0_0_15px_rgba(var(--primary),0.3)] ${isLegendary ? 'border-yellow-500 shadow-yellow-500/20' : 'border-primary/50'}`}>
            <Image 
              src={avatarImg?.imageUrl || ''} 
              alt="Avatar" 
              width={48} 
              height={48} 
              className="object-cover"
              data-ai-hint="fashionable person"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Card */}
        <Card className={`md:col-span-4 bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl relative overflow-hidden group ${isLegendary ? 'border-yellow-500/20' : ''}`}>
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
            {isLegendary ? <Crown className="w-12 h-12 text-primary" /> : <RubyShield className="w-12 h-12 text-primary" />}
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-primary" />
              Perfil do Membro
            </CardTitle>
            <CardDescription className="text-zinc-500">Dados da filiação exclusiva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-black/50 border border-zinc-800/50">
              <div className="text-sm space-y-1">
                <p className="text-zinc-500 uppercase text-[10px] tracking-widest">Nome do Titular</p>
                <p className="font-semibold text-lg">{profile.name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/50 border border-zinc-800/50">
                <p className="text-zinc-500 uppercase text-[10px] tracking-widest mb-1">Membro Desde</p>
                <p className="font-bold">FEV 2024</p>
              </div>
              <div className="p-4 rounded-xl bg-black/50 border border-zinc-800/50">
                <p className="text-zinc-500 uppercase text-[10px] tracking-widest mb-1">Acessos</p>
                <p className={`font-bold ${isLegendary ? 'text-yellow-500' : ''}`}>ILIMITADO</p>
              </div>
            </div>

            <Button className={`w-full font-bold transition-all ${isLegendary ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-white text-black hover:bg-zinc-200'}`}>
              EDITAR PERFIL PÚBLICO
            </Button>
          </CardContent>
        </Card>

        {/* Pet Monitoring & Status */}
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={`bg-zinc-900/40 border-zinc-800/50 overflow-hidden group ${isLegendary ? 'border-yellow-500/20' : ''}`}>
            <div className="h-48 relative overflow-hidden">
               <Image 
                src={luxuryPetImg?.imageUrl || ''} 
                alt="Luxury Pet" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                data-ai-hint="luxury dog"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
              <Badge className={`absolute bottom-4 left-4 border-none font-bold uppercase tracking-tighter ${isLegendary ? 'bg-yellow-500 text-black' : 'bg-primary text-white'}`}>
                {isLegendary ? 'LEGENDARY GOLD' : 'VIP MYTHIC'}
              </Badge>
            </div>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Heart className={`w-5 h-5 ${isLegendary ? 'text-yellow-500 fill-yellow-500' : 'text-primary fill-primary'}`} />
                Monitoramento Real
              </h3>
              <p className="text-zinc-400 text-sm">
                Acompanhe os sinais vitais e o bem-estar do seu companheiro com nossa tecnologia exclusiva integrada.
              </p>
              <Button 
                asChild
                className={`w-full h-12 font-bold transition-all group ${isLegendary ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-primary hover:bg-accent text-white'}`}
              >
                <a href="https://example.com/mundo-pet" target="_blank" rel="noopener noreferrer">
                  {isLegendary ? 'Acessar Painel Gold' : 'Monitorar Saúde 🐾'}
                  <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className={`bg-zinc-900/40 border-zinc-800/50 relative overflow-hidden ${isLegendary ? 'border-yellow-500/20' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className={`w-5 h-5 ${isLegendary ? 'text-yellow-500' : 'text-primary'}`} />
                Ranking Global
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Thor (Doberman)", points: "12,450", rank: 1 },
                { name: "Luna (Persa)", points: "10,200", rank: 2 },
                { name: "Zeus (Husky)", points: "9,800", rank: 3 }
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg bg-black/30 border border-zinc-800/30 ${isLegendary && i === 0 ? 'border-yellow-500/30' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? (isLegendary ? 'bg-yellow-500/20 text-yellow-500' : 'bg-primary/20 text-primary') : 'bg-zinc-800 text-zinc-400'}`}>
                      {item.rank}
                    </span>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <span className={`${isLegendary ? 'text-yellow-500' : 'text-primary'} font-bold text-xs`}>{item.points} pts</span>
                </div>
              ))}
              
              <div className="pt-4 border-t border-zinc-800 mt-4 text-center">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Sua Posição Atual</p>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-2xl font-bold ${isLegendary ? 'text-yellow-500' : 'text-white'}`}>{isLegendary ? '#1' : '#42'}</span>
                  <span className="text-zinc-400">/ 1,500</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pb-12 border-t border-zinc-900 pt-8 text-center text-zinc-600 text-xs">
        <p>&copy; 2024 HALL BLACK CLUB - TODOS OS DIREITOS RESERVADOS À ELITE {isLegendary && <span className="text-yellow-500 ml-1">GOLD</span>}</p>
      </footer>
    </div>
  );
}
