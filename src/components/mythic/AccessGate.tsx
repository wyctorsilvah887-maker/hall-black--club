
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { validateMythicCode } from "@/lib/mythic-service";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from 'firebase/firestore';
import { Loader2, Info, Crown, Gem, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AccessGateProps {
  onSuccess: (profile: any) => void;
}

export function AccessGate({ onSuccess }: AccessGateProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  // Monitor de Membros Ativos (Contagem Global)
  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const { data: usersData } = useCollection(usersQuery);
  const memberCount = usersData?.length || 0;
  const slotsLeft = Math.max(0, 60 - memberCount);

  const handleClaimAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !db) return;

    setIsLoading(true);
    try {
      const result = await validateMythicCode(db, code);
      if (result.success) {
        let title = "💎 STATUS MÍTICO";
        if (result.profile.status === 'LEGENDARY') title = "👑 STATUS LENDÁRIO";
        if (result.profile.status === 'AMBER') title = "🔥 STATUS LEGENDÁRIO";

        toast({
          title,
          description: result.message,
        });
        onSuccess(result.profile);
      } else {
        toast({
          variant: "destructive",
          title: "ACESSO NEGADO",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "ERRO DE SISTEMA",
        description: "Falha na sincronização com o Hall Black.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 md:py-12 bg-black overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/10 rounded-full blur-[80px] md:blur-[140px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 md:space-y-10 relative z-10 text-center">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-1 md:mb-2">
            <div className="h-[1px] w-4 md:w-6 bg-primary/50" />
            <Crown className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
            <div className="h-[1px] w-4 md:w-6 bg-primary/50" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white font-headline">
            HALL <span className="text-primary animate-text-ruby-glow">BLACK</span>
          </h1>
          <div className="flex flex-col items-center gap-1">
            <p className="text-zinc-500 text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] font-bold">
              THE EXCLUSIVE ELITE 60
            </p>
            <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full border border-zinc-900 bg-zinc-950/40">
              <Users className="w-3 h-3 text-primary/60" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                {memberCount.toString().padStart(2, '0')} / 60 SLOTS OCUPADOS
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleClaimAccess} className="space-y-5 md:space-y-6 mt-8 md:mt-12 bg-zinc-900/20 p-5 md:p-8 rounded-2xl border border-zinc-800/50 backdrop-blur-md">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="mythic-code" className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Chave de Acesso</Label>
            <Input
              id="mythic-code"
              placeholder="XXXXXXXX-XXXX"
              className="bg-black/50 border-zinc-800 text-center text-lg md:text-xl h-14 md:h-16 tracking-[0.15em] md:tracking-[0.2em] font-black focus-visible:ring-primary focus-visible:border-primary/50 placeholder:text-zinc-800 transition-all"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 md:h-16 text-base md:text-lg font-black bg-primary hover:bg-accent text-white transition-all duration-500 animate-ruby-glow group relative overflow-hidden"
            disabled={isLoading || !code || slotsLeft === 0}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
            ) : slotsLeft === 0 ? (
              "CAPACIDADE MÁXIMA"
            ) : (
              <span className="flex items-center justify-center gap-2">
                REIVINDICAR ACESSO
                <Crown className="h-4 w-4 md:h-5 md:w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            )}
          </Button>
          {slotsLeft <= 5 && slotsLeft > 0 && (
            <p className="text-red-500 text-[9px] font-black uppercase animate-pulse tracking-widest">
              Alerta: Apenas {slotsLeft} vagas restantes!
            </p>
          )}
        </form>

        <div className="mt-8 md:mt-10 flex flex-col items-center gap-4 md:gap-6">
          <p className="text-zinc-600 text-[8px] md:text-[9px] px-4 uppercase tracking-widest font-medium leading-relaxed">
            Apenas 60 slots disponíveis na rede mundial.
          </p>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="text-zinc-700 hover:text-zinc-400 gap-2 text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] font-bold">
                  <Info className="w-3 h-3" />
                  CONSULTAR CHAVES
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-zinc-950 border-zinc-800 text-zinc-300 p-4 space-y-4 w-64 max-w-[calc(100vw-32px)]">
                <div className="space-y-2">
                  <p className="font-black text-[10px] uppercase text-primary tracking-widest">Mítico (Rubi) - Chaves Ativas:</p>
                  <code className="bg-black px-3 py-2 rounded text-[9px] border border-zinc-800 block font-mono text-zinc-400">HB-MYTH-8X2K</code>
                  <code className="bg-black px-3 py-2 rounded text-[9px] border border-zinc-800 block font-mono text-zinc-400">HB-MYTH-4P9L</code>
                  <p className="text-[8px] text-zinc-600 italic mt-1">Limite global de 60 chaves únicas.</p>
                </div>
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <p className="font-black text-[10px] uppercase text-orange-500 flex items-center gap-2 tracking-widest">
                    <Gem className="w-3 h-3" /> Legendário (Laranja):
                  </p>
                  <code className="bg-black px-3 py-2 rounded text-[10px] border border-orange-900/50 block font-mono text-orange-500">AMBER-LEGEND</code>
                </div>
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <p className="font-black text-[10px] uppercase text-yellow-500 flex items-center gap-2 tracking-widest">
                    <Crown className="w-3 h-3" /> Lendário (Dourado):
                  </p>
                  <code className="bg-black px-3 py-2 rounded text-[10px] border border-yellow-900/50 block font-mono text-yellow-500">LEGEND-GOLD</code>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
