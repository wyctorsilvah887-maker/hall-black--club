
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Cpu, Loader2, ShieldCheck, ChevronRight, Zap, AlertTriangle, Image as ImageIcon, Sparkles } from "lucide-react";
import { consultBlackAdvisor } from '@/app/actions';
import { cn } from '@/lib/utils';
import NextImage from 'next/image';

/**
 * @fileOverview Componente Black Advisor.
 * Gerencia a interação de chat e exibição de imagens geradas em layout de terminal fixo.
 */

export function BlackAdvisor({ profile }: { profile: any }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userQuery = query.trim();
    setQuery('');
    setLogs(prev => [...prev, { type: 'user', content: userQuery }]);
    setIsLoading(true);

    try {
      const result = await consultBlackAdvisor({
        query: userQuery,
        memberRank: profile.status
      });

      if (result.success && result.data) {
        setLogs(prev => [...prev, { 
          type: 'advisor', 
          content: result.data.response,
          insights: result.data.actionableInsights,
          note: result.data.confidentialityNote,
          image: result.data.generatedImage
        }]);
      } else {
        setLogs(prev => [...prev, { 
          type: 'error', 
          content: result.error || 'Protocolo de comunicação interrompido.' 
        }]);
      }
    } catch (err) {
      setLogs(prev => [...prev, { 
        type: 'error', 
        content: 'Falha crítica no link de dados elite.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const themeColor = 'text-primary';

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
      {/* HISTÓRICO COM SCROLL INDEPENDENTE */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-8 pr-2 md:pr-4 custom-scrollbar pb-10"
      >
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
            <Cpu className="w-12 h-12 md:w-16 md:h-16" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] max-w-xs leading-relaxed">
              Aguardando entrada de dados para processamento de elite.
            </p>
          </div>
        )}

        {logs.map((log, i) => (
          <div 
            key={i} 
            className={`flex flex-col ${log.type === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-500`}
          >
            {log.type === 'user' ? (
              <div className="bg-zinc-900 border border-zinc-800 p-5 md:p-6 rounded-2xl md:rounded-[2rem] max-w-[85%] md:max-w-md shadow-lg">
                <p className="text-xs font-bold uppercase tracking-tight text-white leading-relaxed">{log.content}</p>
              </div>
            ) : log.type === 'advisor' ? (
              <div className="space-y-6 max-w-[95%] md:max-w-2xl w-full">
                <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-3 -left-3 bg-black border border-zinc-800 p-2 rounded-lg z-10">
                    <ShieldCheck className={cn("w-4 h-4", themeColor)} />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <p className="text-sm font-medium leading-relaxed text-zinc-300 italic">
                      {log.content}
                    </p>

                    {log.image && (
                      <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-zinc-900 shadow-inner group">
                        <NextImage 
                          src={log.image} 
                          alt="Elite Visual Concept" 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-105" 
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                           <div className="p-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-zinc-800">
                             <Sparkles className="w-3 h-3 text-primary" />
                           </div>
                           <span className="text-[8px] font-black text-white uppercase tracking-widest">Conceito Gerado</span>
                        </div>
                      </div>
                    )}
                    
                    {log.insights && log.insights.length > 0 && (
                      <div className="pt-8 border-t border-zinc-900 space-y-4">
                         <p className={cn("text-[9px] font-black uppercase tracking-widest", themeColor)}>Insights Acionáveis</p>
                         <ul className="space-y-3">
                           {log.insights.map((insight: string, idx: number) => (
                             <li key={idx} className="flex items-start gap-3 text-[10px] md:text-[11px] text-zinc-500 font-bold uppercase">
                               <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />
                               {insight}
                             </li>
                           ))}
                         </ul>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[7px] md:text-[8px] text-zinc-800 font-black uppercase tracking-[0.4em] ml-4">
                  DOC: {log.note}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-red-900 text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-red-950/20 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-red-900/30 max-w-md">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>{log.content}</p>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 ml-4">
            <Loader2 className={cn("w-4 h-4 animate-spin", themeColor)} />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-700">Sincronizando Linhagem Visual...</span>
          </div>
        )}
      </div>

      {/* CAMPO DE INPUT FIXO NA BASE DO COMPONENTE */}
      <form onSubmit={handleConsult} className="mt-auto pt-6 md:pt-8 border-t border-zinc-900 relative bg-zinc-950 flex-shrink-0">
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SOLICITAR CONSULTORIA TÉCNICA OU VISUAL..."
          disabled={isLoading}
          className="bg-zinc-900/50 border-zinc-800 h-16 md:h-20 rounded-xl md:rounded-[2rem] px-6 md:px-8 text-xs md:text-sm font-black uppercase tracking-tight focus-visible:ring-primary/40 pr-20 md:pr-32"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className={cn("absolute right-2 md:right-4 top-[2.1rem] md:top-[2.6rem] h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-2xl bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20")}
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </form>
    </div>
  );
}
