
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Cpu, Loader2, ShieldCheck, ChevronRight, Zap, AlertTriangle, Battery, BatteryFull, BatteryMedium, BatteryLow } from "lucide-react";
import { consultBlackAdvisor } from '@/app/actions';
import { cn } from '@/lib/utils';
import { RankBadge } from './MythicIcons';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * @fileOverview Componente Sovereign Advisor - Business Edition.
 * Interface de terminal imersiva para consultoria de negócios e SaaS.
 * Estilizado para ser idêntico ao layout do Black Room.
 */

export function BlackAdvisor({ profile }: { profile: any }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();
  
  const [logs, setLogs] = useState<any[]>([
    { 
      type: 'advisor', 
      content: `Saudações, ${profile.name}. Link neural estabelecido para a patente ${profile.status}. Sou seu Advisor estratégico para escala, modelos de negócio e arquitetura financeira. Submeta seu projeto para análise sem filtros.`,
      insights: ["Aguardando entrada estratégica"],
      note: `PROTOCOLO DE ACESSO: ${profile.status} IDENTIFICADO`,
      isInitial: true
    }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastLogRef = useRef<HTMLDivElement>(null);

  // Lógica de Limite de Mensagens (15 a cada 12h)
  const now = new Date();
  const lastReset = profile.lastAiMessageReset ? new Date(profile.lastAiMessageReset) : new Date(0);
  const diffMs = now.getTime() - lastReset.getTime();
  const twelveHoursMs = 12 * 60 * 60 * 1000;
  const isResetNeeded = diffMs >= twelveHoursMs;
  
  const messagesSent = isResetNeeded ? 0 : (profile.aiMessageCount || 0);
  const messagesRemaining = 15 - messagesSent;

  useEffect(() => {
    if (lastLogRef.current) {
      lastLogRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [logs, isLoading]);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading || !db) return;

    if (messagesRemaining <= 0) {
      toast({
        variant: "destructive",
        title: "PROTOCOLO DE SEGURANÇA",
        description: "Limite de 15 mensagens por ciclo de 12 horas atingido. Recarga em andamento."
      });
      return;
    }

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
          note: result.data.confidentialityNote
        }]);

        const userRef = doc(db, 'users', profile.id);
        updateDocumentNonBlocking(userRef, {
          aiMessageCount: messagesSent + 1,
          lastAiMessageReset: isResetNeeded ? now.toISOString() : (profile.lastAiMessageReset || now.toISOString())
        });

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
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">
      
      {/* INDICADOR DE CRÉDITOS NEURAIS */}
      <div className="flex items-center justify-between px-8 mb-2 animate-in fade-in duration-1000">
        <div className="flex items-center gap-2">
          {messagesRemaining > 10 ? <BatteryFull className="w-3 h-3 text-green-500" /> :
           messagesRemaining > 5 ? <BatteryMedium className="w-3 h-3 text-yellow-500" /> :
           <BatteryLow className={cn("w-3 h-3", messagesRemaining === 0 ? "text-red-600 animate-pulse" : "text-orange-500")} />}
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Link Neural: {messagesRemaining}/15</span>
        </div>
      </div>

      {/* ÁREA DE TRANSMISSÃO */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-12 md:py-10 space-y-8 custom-scrollbar scroll-smooth pb-20"
      >
        {logs.map((log, i) => (
          <div 
            key={i} 
            ref={i === logs.length - 1 ? lastLogRef : null}
            className={`flex flex-col ${log.type === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-700 slide-in-from-bottom-2`}
          >
            {log.type === 'user' ? (
              <div className="flex flex-col items-end space-y-1.5 max-w-[85%] md:max-w-[70%]">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Você</span>
                </div>
                <div className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] rounded-tr-none text-[11px] md:text-sm font-medium leading-relaxed bg-primary/10 border border-primary/20 text-white shadow-2xl backdrop-blur-md">
                  {log.content}
                </div>
              </div>
            ) : log.type === 'advisor' ? (
              <div className="flex flex-col items-start space-y-1.5 max-w-[95%] md:max-w-[80%]">
                <div className="flex items-center gap-2 px-1">
                  <span className={cn("text-[8px] md:text-[9px] uppercase tracking-widest font-black", themeColor)}>Sovereign AI</span>
                  <span className="text-[7px] font-black text-zinc-800 uppercase tracking-widest italic">{log.note}</span>
                </div>
                <div className="p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] rounded-tl-none bg-zinc-900/40 border border-zinc-800/40 text-zinc-200 shadow-2xl backdrop-blur-md space-y-6">
                  <div className="text-sm font-medium leading-relaxed italic whitespace-pre-wrap">
                    {log.content}
                  </div>

                  {log.isInitial && (
                    <div className="mt-4 flex flex-col items-center gap-1 border-t border-zinc-900/50 pt-6">
                      <div className="scale-75 origin-center py-2">
                        <RankBadge status={profile.status} id={profile.id} size="sm" />
                      </div>
                      <p className="text-[7px] font-black text-zinc-800 uppercase tracking-[0.5em]">Link Seguro Estabelecido</p>
                    </div>
                  )}
                  
                  {log.insights && log.insights.length > 0 && !log.isInitial && (
                    <div className="pt-8 border-t border-zinc-900/50 space-y-4">
                       <p className={cn("text-[9px] font-black uppercase tracking-widest", themeColor)}>Protocolos de Ação</p>
                       <ul className="space-y-3">
                         {log.insights.map((insight: string, idx: number) => (
                           <li key={idx} className="flex items-start gap-3 text-[10px] md:text-[11px] text-zinc-500 font-bold uppercase">
                             <Zap className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                             {insight}
                           </li>
                         ))}
                       </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-red-900 text-[9px] font-black uppercase tracking-widest bg-red-950/20 p-4 rounded-2xl border border-red-900/30 max-w-md">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <p>{log.content}</p>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 animate-pulse pt-4">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center">
              <Loader2 className={cn("w-5 h-5 animate-spin", themeColor)} />
            </div>
            <div className="flex flex-col space-y-1.5">
               <span className="text-[8px] uppercase tracking-widest text-zinc-700 font-black">Auditando Ecossistema...</span>
               <div className="bg-zinc-900/20 border border-zinc-800/20 p-4 rounded-[1.2rem] flex items-center justify-center gap-2 w-16">
                 <span className="w-1.5 h-1.5 bg-primary rounded-full animate-dot-pulse" style={{ animationDelay: '0s' }} />
                 <span className="w-1.5 h-1.5 bg-primary rounded-full animate-dot-pulse" style={{ animationDelay: '0.2s' }} />
                 <span className="w-1.5 h-1.5 bg-primary rounded-full animate-dot-pulse" style={{ animationDelay: '0.4s' }} />
               </div>
            </div>
          </div>
        )}
      </div>

      {/* DOCK DE ENTRADA (ESTILO BLACK ROOM) */}
      <div className="flex-shrink-0 bg-black/60 backdrop-blur-3xl border-t border-zinc-900/50 p-4 md:p-10 pb-8 md:pb-12 z-50">
        <form onSubmit={handleConsult} className="max-w-4xl mx-auto flex items-center gap-3 relative">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={messagesRemaining > 0 ? "TRANSMITIR PROJETO PARA ANÁLISE..." : "RECARGA DE CRÉDITOS EM CURSO..."}
            disabled={isLoading || messagesRemaining <= 0}
            className="bg-zinc-950/50 border-zinc-800 h-14 md:h-20 rounded-2xl md:rounded-[2.5rem] px-6 md:px-10 text-xs md:text-base font-black uppercase tracking-tight focus-visible:ring-primary/40 pr-16 md:pr-24 shadow-inner"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !query.trim() || messagesRemaining <= 0}
            className="absolute right-2 md:right-4 h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-3xl bg-primary text-primary-foreground hover:bg-accent transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5 md:w-7 md:h-7" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
