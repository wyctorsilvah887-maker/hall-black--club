"use client"

import React from 'react';
import NextImage from 'next/image';

/**
 * @fileOverview Carregador Oficial de Elite - Sovereign Founders Club.
 * Utiliza o logotipo animado em GIF para manter a identidade visual durante o processamento.
 */

export function EliteLoader() {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <NextImage 
            src="/logo-sfc.gif" 
            alt="Sovereign Founders Club" 
            width={340} 
            height={90} 
            className="w-64 md:w-80 h-auto object-contain"
            unoptimized
            priority
          />
          {/* Sutil brilho aura atrás do logo */}
          <div className="absolute inset-0 bg-primary/5 blur-[60px] -z-10 rounded-full scale-150 animate-pulse" />
        </div>
        
        {/* Barra de Carregamento Minimalista */}
        <div className="w-32 md:w-48 h-[1px] bg-zinc-900 overflow-hidden relative rounded-full opacity-50">
           <div className="absolute inset-0 bg-primary animate-loading-bar" />
        </div>
        
        <p className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.6em] text-zinc-700 animate-pulse">
          Sincronizando Rede de Elite
        </p>
      </div>
    </div>
  );
}