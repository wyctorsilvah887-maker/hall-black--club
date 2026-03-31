
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { validateMythicCode } from "@/app/actions";
import { Loader2, Sparkles } from "lucide-react";

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
        toast({
          title: "BEM-VINDO À ELITE",
          description: "Seu status mítico foi ativado com sucesso.",
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
        description: "Não foi possível validar seu código no momento.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-black overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative z-10 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white font-headline">
            HALL <span className="text-primary animate-text-ruby-glow">BLACK</span> CLUB
          </h1>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.3em] font-light">
            Onde o Luxo Encontra a Lealdade
          </p>
        </div>

        <form onSubmit={handleClaimAccess} className="space-y-6 mt-12">
          <div className="space-y-2">
            <Label htmlFor="mythic-code" className="sr-only">Código Mítico</Label>
            <Input
              id="mythic-code"
              placeholder="INSIRA SEU CÓDIGO MÍTICO"
              className="bg-zinc-900/50 border-zinc-800 text-center text-lg h-14 tracking-widest focus-visible:ring-primary focus-visible:border-primary/50 placeholder:text-zinc-600 transition-all"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-accent text-white transition-all duration-500 animate-ruby-glow shadow-[0_0_20px_rgba(160,16,41,0.3)] hover:shadow-[0_0_30px_rgba(237,10,57,0.5)] group"
            disabled={isLoading || !code}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                REIVINDICAR ACESSO
                <Sparkles className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </Button>
        </form>

        <p className="text-zinc-500 text-xs mt-8">
          Acesso restrito a portadores de chaves autorizadas.
          <br />Todos os acessos são monitorados.
        </p>
      </div>
    </div>
  );
}
