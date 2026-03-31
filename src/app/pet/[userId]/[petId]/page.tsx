
"use client"

import React, { use } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, ShieldAlert, User, MapPin, ShieldCheck, Phone, ChevronRight } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { CollarIcon } from '@/components/mythic/MythicIcons';

interface PetPageProps {
  params: Promise<{ userId: string; petId: string }>;
}

export default function PetProfilePage({ params }: PetPageProps) {
  const { userId, petId } = use(params);
  const db = useFirestore();
  
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

  return (
    <main className={`min-h-screen bg-black text-white selection:bg-primary selection:text-white pb-12 ${themeClass}`}>
      <div className="max-w-3xl mx-auto px-5 pt-8 md:pt-16 space-y-10">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-[9px] font-bold uppercase tracking-[0.4em]">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Início
        </Link>

        {/* Header Compacto Premium */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className={`relative w-40 h-40 md:w-56 md:h-56 rounded-[2rem] overflow-hidden border shadow-2xl transition-transform duration-700
            ${isLegendary ? 'border-yellow-500 animate-gold-glow' : isAmber ? 'border-orange-500 animate-amber-glow' : 'border-primary animate-ruby-glow'}`}>
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

        {/* Informações Estruturadas em Cards Menores */}
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
             <Card className="bg-zinc-950/40 border-zinc-900/50 backdrop-blur-2xl p-5 md:p-6 rounded-3xl flex items-center justify-between">
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
                  <div className="flex items-center justify-end gap-2 text-zinc-600">
                    <Phone className={`w-3 h-3 ${themeColorClass}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Emergência</span>
                  </div>
                  <p className="font-mono text-zinc-300 text-xs font-bold">{owner.emergencyContact || 'S/N'}</p>
                </div>
             </Card>

             <Card className="bg-zinc-950/40 border-zinc-900/50 backdrop-blur-2xl p-4 rounded-3xl flex items-center gap-4">
                <div className={`p-2 rounded-xl bg-black border ${themeBorderClass}`}>
                  <ShieldCheck className={`w-5 h-5 ${themeColorClass} animate-pulse`} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-white">Segurança Ativa</h3>
                  <p className="text-[8px] text-zinc-600 uppercase tracking-widest">Protocolo Hall Black v2.0</p>
                </div>
             </Card>
          </div>
        </div>

        {/* Selo de Autenticidade */}
        <div className="pt-8 flex flex-col items-center text-center">
           <CollarIcon className="w-8 h-8 text-zinc-900 mb-4" />
           <p className="text-[8px] text-zinc-700 uppercase tracking-[0.6em] font-medium max-w-[200px] leading-relaxed">
             ESTE DOCUMENTO DIGITAL CERTIFICA A IDENTIDADE DE ELITE DO ANIMAL NO ECOSSISTEMA HALL BLACK.
           </p>
        </div>

        <footer className="pt-12 text-center">
          <p className="text-[8px] text-zinc-800 uppercase tracking-[0.5em] font-black">
            HALL BLACK PET IDENTITY PROTOCOL © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}
