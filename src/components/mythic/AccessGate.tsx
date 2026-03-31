"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { validateMythicCode } from "@/app/actions";
import { Loader2, Sparkles, Info, Crown, Gem } from "lucide-react";
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

  const handleClaimAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    try {
      const result = await validateMythicCode(code);
      if (result.success) {
        let title = "💎 STATUS MÍTICO";
        if (result.profile.status === 'LEGENDARY') title = "👑 STATUS LENDÁRIO";
        if (result.profile.status === 'AMBER') title = "🔥 STATUS ÂMBAR";

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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-black overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-10 relative z-10 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-[1px] w-6 bg-primary/50" />
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <div className="h-[1px] w-6 bg-primary/50" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white font-headline">
            HALL <span className="text-primary animate-text-ruby-glow">BLACK</span>
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-bold">
            THE ABSOLUTE PET ELITE
          </p>
        </div>

        <form onSubmit={handleClaimAccess} className="space-y-6 mt-12 bg-zinc-900/20 p-8 rounded-2xl border border-zinc-800/50 backdrop-blur-md">
          <div className="space-y-3">
            <Label htmlFor="mythic-code" className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Chave de Acesso</Label>
            <Input
              id="mythic-code"
              placeholder="XXXXXXXX-XXXX"
              className="bg-black/50 border-zinc-800 text-center text-xl h-16 tracking-[0.2em] font-black focus-visible:ring-primary focus-visible:border-primary/50 placeholder:text-zinc-800 transition-all"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-16 text-lg font-black bg-primary hover:bg-accent text-white transition-all duration-500 animate-ruby-glow group relative overflow-hidden"
            disabled={isLoading || !code}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                REIVINDICAR ACESSO
                <Sparkles className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-6">
          <p className="text-zinc-600 text-[9px] uppercase tracking-widest font-medium">
            Acesso restrito. Use chaves de criptografia autorizadas.
          </p>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="text-zinc-700 hover:text-zinc-400 gap-2 text-[10px] tracking-[0.3em] font-bold">
                  <Info className="w-3 h-3" />
                  CONSULTAR CHAVES
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-zinc-950 border-zinc-800 text-zinc-300 p-4 space-y-4 w-64">
                <div className="space-y-2">
                  <p className="font-black text-[10px] uppercase text-primary tracking-widest">Mítico (Rubi):</p>
                  <code className="bg-black px-3 py-2 rounded text-[10px] border border-zinc-800 block font-mono text-zinc-400">MYTH-2024</code>
                </div>
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <p className="font-black text-[10px] uppercase text-orange-500 flex items-center gap-2 tracking-widest">
                    <Gem className="w-3 h-3" /> Âmbar (Laranja):
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
