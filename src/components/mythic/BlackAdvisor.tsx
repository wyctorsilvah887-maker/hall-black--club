
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Cpu, Loader2, ShieldCheck, ChevronRight, Zap, AlertTriangle, Battery, BatteryFull, BatteryMedium, BatteryLow } from "lucide-react";
import { consultBlackAdvisor } from '@/app/actions';
import { cn } from '@/lib/utils';
import { RankBadge } from './MythicIcons';
import { useFirestore, useToast } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * @fileOverview Componente Sovereign Advisor - Business Edition.
 * Interface de terminal imersiva para consultoria de negócios e SaaS com limite de uso.
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

    // Verificação de limite
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

        // Atualizar contador de mensagens no Firestore
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
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
      
      {/* INDICADOR DE CRÉDITOS NEURAIS */}
      <div className="flex items-center justify-between px-2 mb-4 animate-in fade-in duration-1000">
        <div className="flex items-center gap-2">
          {messagesRemaining > 10 ? <BatteryFull className="w-3.5 h-3.5 text-green-500" /> :
           messagesRemaining > 5 ? <BatteryMedium className="w-3.5 h-3.5 text-yellow-500" /> :
           <BatteryLow className={cn("w-3.5 h-3.5", messagesRemaining === 0 ? "text-red-600 animate-pulse" : "text-orange-500")} />}
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Link Neural: {messagesRemaining}/15 Créditos</span>
        </div>
        {messagesRemaining === 0 && (
          <span className="text-[8px] font-bold uppercase tracking-widest text-red-900 animate-pulse">Recarga do Ciclo em Andamento</span>
        )}
      </div>

      {/* HISTÓRICO COM SCROLL INDEPENDENTE */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-12 pr-2 md:pr-4 custom-scrollbar pb-20 pt-4"
      >
        {logs.map((log, i) => (
          <div 
            key={i} 
            ref={i === logs.length - 1 ? lastLogRef : null}
            className={`flex flex-col ${log.type === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-700 slide-in-from-bottom-2`}
          >
            {log.type === 'user' ? (
              <div className="bg-zinc-900 border border-zinc-800 p-5 md:p-6 rounded-2xl md:rounded-[2rem] max-w-[85%] md:max-w-md shadow-lg">
                <p className="text-xs font-bold uppercase tracking-tight text-white leading-relaxed">{log.content}</p>
              </div>
            ) : log.type === 'advisor' ? (
              <div className="space-y-6 max-w-[95%] md:max-w-2xl w-full">
                <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-2xl relative">
                  <div className="absolute -top-3 -left-3 bg-black border border-zinc-800 p-2 rounded-lg z-20 shadow-xl">
                    <ShieldCheck className={cn("w-4 h-4", themeColor)} />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="text-sm font-medium leading-relaxed text-zinc-300 italic whitespace-pre-wrap">
                      {log.content}
                    </div>

                    {log.isInitial && (
                      <div className="mt-4 flex flex-col items-center gap-1 border-t border-zinc-900/50 pt-6">
                        <div className="scale-75 md:scale-90 origin-center py-2">
                          <RankBadge status={profile.status} id={profile.id} size="sm" />
                        </div>
                        <p className="text-[7px] font-black text-zinc-800 uppercase tracking-[0.5em]">Identidade Confirmada</p>
                      </div>
                    )}
                    
                    {log.insights && log.insights.length > 0 && (
                      <div className="pt-8 border-t border-zinc-900 space-y-4">
                         <p className={cn("text-[9px] font-black uppercase tracking-widest", themeColor)}>Protocolos de Ação</p>
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
                  AUDITORIA: {log.note}
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
          <div className="flex items-center gap-3 ml-4 animate-pulse pt-4">
            <Loader2 className={cn("w-4 h-4 animate-spin", themeColor)} />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-700">Auditando Ecossistema Digital...</span>
          </div>
        )}
      </div>

      {/* CAMPO DE INPUT FIXO NA BASE */}
      <form onSubmit={handleConsult} className="mt-auto pt-6 md:pt-8 border-t border-zinc-900 relative bg-zinc-950 flex-shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50">
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={messagesRemaining > 0 ? "SUBMETER PROJETO PARA ANÁLISE ESTRATÉGICA..." : "LIMITE DE CRÉDITOS ATINGIDO..."}
          disabled={isLoading || messagesRemaining <= 0}
          className="bg-zinc-900/50 border-zinc-800 h-16 md:h-20 rounded-xl md:rounded-[2rem] px-6 md:px-8 text-xs md:text-sm font-black uppercase tracking-tight focus-visible:ring-primary/40 pr-20 md:pr-32"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !query.trim() || messagesRemaining <= 0}
          className={cn("absolute right-2 md:right-4 top-[2.1rem] md:top-[2.6rem] h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-2xl bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20")}
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </form>
    </div>
  );
}
