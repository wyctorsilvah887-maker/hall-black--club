
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Cpu, Loader2, ShieldCheck, ChevronRight, Zap, AlertTriangle } from "lucide-react";
import { consultBlackAdvisor } from '@/app/actions';
import { cn } from '@/lib/utils';

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
          note: result.data.confidentialityNote
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
    <div className="max-w-4xl mx-auto space-y-8 h-[70vh] flex flex-col">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-4">
          <Terminal className={themeColor} />
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Black Advisor</h3>
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Consultoria de Linhagem via IA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Sistema Operacional</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar"
      >
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
            <Cpu className="w-16 h-16" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] max-w-xs">
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
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] max-w-md">
                <p className="text-xs font-bold uppercase tracking-tight text-white">{log.content}</p>
              </div>
            ) : log.type === 'advisor' ? (
              <div className="space-y-6 max-w-2xl">
                <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] shadow-2xl relative">
                  <div className="absolute -top-3 -left-3 bg-black border border-zinc-800 p-2 rounded-lg">
                    <ShieldCheck className={cn("w-4 h-4", themeColor)} />
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-zinc-300 italic">
                    {log.content}
                  </p>
                  
                  {log.insights && log.insights.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-zinc-900 space-y-4">
                       <p className={cn("text-[9px] font-black uppercase tracking-widest", themeColor)}>Insights Acionáveis</p>
                       <ul className="space-y-3">
                         {log.insights.map((insight: string, idx: number) => (
                           <li key={idx} className="flex items-start gap-3 text-[11px] text-zinc-500 font-bold uppercase">
                             <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />
                             {insight}
                           </li>
                         ))}
                       </ul>
                    </div>
                  )}
                </div>
                <p className="text-[8px] text-zinc-800 font-black uppercase tracking-[0.4em] ml-4">
                  DOC: {log.note}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-red-900 text-[10px] font-black uppercase tracking-widest bg-red-950/20 p-5 rounded-[2rem] border border-red-900/30 max-w-md">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>{log.content}</p>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 ml-4">
            <Loader2 className={cn("w-4 h-4 animate-spin", themeColor)} />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Processando Linhagem...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleConsult} className="mt-auto pt-6 border-t border-zinc-900 relative">
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SOLICITAR CONSULTORIA TÉCNICA..."
          disabled={isLoading}
          className="bg-zinc-950/50 border-zinc-800 h-20 rounded-[2rem] px-8 text-sm font-black uppercase tracking-tight focus-visible:ring-primary/40 pr-32"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className={cn("absolute right-4 top-[3.1rem] h-12 w-12 rounded-2xl bg-primary text-primary-foreground")}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </form>
    </div>
  );
}
