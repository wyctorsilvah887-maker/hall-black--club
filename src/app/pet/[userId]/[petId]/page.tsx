"use client"

import React, { use } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, ShieldAlert, User, MapPin, Sparkles, ShieldCheck } from "lucide-react";
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
        <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!pet || !owner) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-zinc-800 mb-6" />
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Identidade Não Encontrada</h1>
        <p className="text-zinc-500 text-xs uppercase tracking-widest max-w-xs mb-8">Este pet não possui credenciais ativas no Hall Black.</p>
        <Button asChild variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white rounded-full">
          <Link href="/">Voltar ao Início</Link>
        </Button>
      </div>
    );
  }

  const isLegendary = owner.status === 'LEGENDARY';
  const isAmber = owner.status === 'AMBER';
  const themeClass = isLegendary ? 'theme-legendary' : isAmber ? 'theme-amber' : '';

  return (
    <main className={`min-h-screen bg-black text-white selection:bg-primary selection:text-white ${themeClass}`}>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 space-y-10 md:space-y-16">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.3em]">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </Link>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-end">
          <div className={`relative w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden border-2 shadow-2xl transition-transform hover:scale-[1.02] duration-500
            ${isLegendary ? 'border-yellow-500 animate-gold-glow' : isAmber ? 'border-orange-500 animate-amber-glow' : 'border-primary'}`}>
            {pet.photo ? (
              <Image src={pet.photo} alt={pet.name} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <Heart className="w-16 h-16 text-zinc-800" />
              </div>
            )}
          </div>
          
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="space-y-1">
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-bold">Linhagem de Elite</p>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">{pet.name}</h1>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Badge variant="outline" className="py-2 px-4 rounded-full border-zinc-800 bg-zinc-900/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                {pet.species}
              </Badge>
              <Badge variant="outline" className={`py-2 px-4 rounded-full font-black uppercase tracking-widest text-[10px] border-primary/20 bg-primary/10 text-primary`}>
                MEMBRO VERIFICADO
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <Card className="md:col-span-2 bg-zinc-900/30 border-zinc-800/50 backdrop-blur-xl p-6 md:p-8 space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                <User className={`w-4 h-4 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                Guardião Responsável
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-black/40 border border-zinc-800/30">
                <div className="space-y-1">
                  <p className="text-white font-black text-xl uppercase tracking-tight">{owner.name}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`}>
                    {owner.status === 'LEGENDARY' ? 'ACREDITAÇÃO LENDÁRIA' : owner.status === 'AMBER' ? 'STATUS LEGENDÁRIO' : 'MEMBRO MÍTICO'}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-full border-zinc-800 text-[9px] font-black h-9 px-4 uppercase tracking-widest">
                  <Link href={`/profile/${owner.id}`}>Ver Perfil</Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-5 rounded-2xl bg-black/40 border border-zinc-800/30 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Contato de Emergência</span>
                  </div>
                  <p className="font-mono text-zinc-300 text-xs">{owner.emergencyContact || 'RESTRITO'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-xl p-6 text-center space-y-4">
              <ShieldCheck className={`w-12 h-12 mx-auto ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-tighter">Status de Segurança</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Identidade Verificada</p>
              </div>
            </Card>

            <Card className="bg-zinc-900/30 border-zinc-800/50 backdrop-blur-xl p-6 text-center">
              <p className="text-[8px] text-zinc-600 uppercase tracking-[0.4em] mb-4">HALL BLACK VERIFIED</p>
              <CollarIcon className="w-8 h-8 mx-auto text-zinc-800" />
            </Card>
          </div>
        </div>

        <footer className="pt-20 text-center opacity-30">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-8 bg-zinc-800" />
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <div className="h-px w-8 bg-zinc-800" />
          </div>
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-light">
            HALL BLACK PET IDENTITY PROTOCOL
          </p>
        </footer>
      </div>
    </main>
  );
}
