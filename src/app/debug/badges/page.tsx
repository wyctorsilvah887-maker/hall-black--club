
"use client"

import React from 'react';
import { RankBadge } from '@/components/mythic/MythicIcons';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import Link from 'next/link';

/**
 * @fileOverview Galeria de Exposição de Patentes.
 * Página de debug para visualizar todos os níveis de elite do Hall Black Club.
 */

export default function BadgeGalleryPage() {
  const ranks = [
    { status: 'LEGENDARY', label: 'Platinum Lendário', description: 'O ápice da linhagem. Acesso supremo e influência total.' },
    { status: 'AMBER', label: 'Rubi Legendário', description: 'Membros de alto escalão com contribuições históricas.' },
    { status: 'MYTHIC', label: 'Membro Mítico', description: 'Elite verificada com acesso ao Cofre e Conselho.' },
    { status: 'ELITE', label: 'Membro Elite', description: 'Patente intermediária para membros ativos e influentes.' },
    { status: 'MASTER', label: 'Mestre do Club', description: 'Nível de entrada. O início da jornada na rede Hall Black.' }
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-20 selection:bg-primary/30">
      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-zinc-900 pb-12">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
              <ArrowLeft className="w-4 h-4" /> Voltar ao Hub
            </Link>
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">Galeria de Patentes</h1>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-bold max-w-xl leading-relaxed">
              Exposição técnica das credenciais de linhagem. Cada insígnia representa um nível de autoridade e prestígio no ecossistema Hall Black.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
             <ShieldCheck className="w-6 h-6 text-primary animate-pulse" />
             <div className="text-[9px] font-black uppercase tracking-widest">Protocolo Visual v2026.1</div>
          </div>
        </div>

        {/* EXPOSIÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
          {ranks.map((rank, idx) => (
            <div key={rank.status} className="group space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 150}s` }}>
              <div className="flex flex-col items-center gap-8">
                 <div className="relative">
                    <RankBadge status={rank.status} id={`debug-${rank.status}`} regNumber={idx + 1} size="lg" />
                 </div>
                 <div className="text-center space-y-3 max-w-xs">
                    <h3 className="text-xl font-black uppercase tracking-tight">{rank.label}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                      {rank.description}
                    </p>
                 </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                 <div className="flex flex-col items-center gap-2">
                    <RankBadge status={rank.status} size="sm" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-700">Compacto</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <RankBadge status={rank.status} size="md" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-700">Padrão</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full border border-zinc-900 bg-zinc-950 flex items-center justify-center">
                       <Zap className={`w-4 h-4 ${
                         rank.status === 'LEGENDARY' ? 'text-yellow-500' : 
                         rank.status === 'AMBER' ? 'text-orange-500' : 
                         rank.status === 'MYTHIC' ? 'text-primary' : 
                         rank.status === 'ELITE' ? 'text-zinc-400' : 'text-orange-900'
                       }`} />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-700">Atributo</span>
                 </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="pt-20 pb-12 text-center opacity-20">
          <p className="text-[8px] font-black uppercase tracking-[1em] text-zinc-500">
            Hall Black Brand Identity System
          </p>
        </footer>
      </div>
    </main>
  );
}
