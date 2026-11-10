
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { validateMythicCode, validateTransferClaim } from "@/lib/mythic-service";
import { useFirestore } from "@/firebase";
import { Loader2, LogIn, ArrowRightLeft, ShieldCheck, Mail } from "lucide-react";
import NextImage from 'next/image';

interface AccessGateProps {
  onSuccess: (profile: any) => void;
}

export function AccessGate({ onSuccess }: AccessGateProps) {
  const [mode, setMode] = useState<'code' | 'transfer'>('code');
  const [code, setCode] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
  const [transferCode, setTransferCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const db = useFirestore();

  const handleClaimAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setIsLoading(true);
    try {
      let result;
      if (mode === 'code') {
        result = await validateMythicCode(db, code);
      } else {
        result = await validateTransferClaim(db, transferEmail, transferCode);
      }

      if (result.success) {
        toast({
          title: "SISTEMA SOVEREIGN",
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
        description: "Falha na sincronização.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 md:py-12 bg-black overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/10 rounded-full blur-[80px] md:blur-[140px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 md:space-y-10 relative z-10 text-center">
        <div className="flex flex-col items-center space-y-4">
          <NextImage 
            src="/logo-sfc.gif" 
            alt="Sovereign Founders Club" 
            width={320} 
            height={80} 
            className="w-64 md:w-80 h-auto object-contain"
            unoptimized
            priority
          />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 mt-2">
            Protocolo de Elite v2026.12
          </p>
        </div>

        <form onSubmit={handleClaimAccess} className="space-y-5 md:space-y-6 mt-8 md:mt-12 bg-zinc-900/20 p-6 md:p-8 rounded-2xl border border-zinc-800/50 backdrop-blur-md shadow-2xl">
          {mode === 'code' ? (
            <div className="space-y-2 md:space-y-3">
              <Label htmlFor="mythic-code" className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold block text-left ml-1">Chave de Acesso Original</Label>
              <Input
                id="mythic-code"
                placeholder="XXXXXXXX-XXXX"
                className="bg-black/50 border-zinc-800 text-center text-lg md:text-xl h-14 md:h-16 tracking-[0.15em] font-black focus-visible:ring-primary placeholder:text-zinc-800 transition-all"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold block text-left ml-1">E-mail do Cessionário</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="bg-black/50 border-zinc-800 h-14 pl-12 text-sm font-bold focus-visible:ring-primary"
                    value={transferEmail}
                    onChange={(e) => setTransferEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold block text-left ml-1">Código de Segurança (6 Dígitos)</Label>
                <Input
                  placeholder="000000"
                  maxLength={6}
                  className="bg-black/50 border-zinc-800 text-center text-xl h-14 tracking-[0.5em] font-black focus-visible:ring-primary"
                  value={transferCode}
                  onChange={(e) => setTransferCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-14 md:h-16 text-base md:text-lg font-black bg-primary hover:bg-accent text-white transition-all duration-500 animate-ruby-glow group"
            disabled={isLoading || (mode === 'code' && !code) || (mode === 'transfer' && (!transferEmail || !transferCode))}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                {mode === 'code' ? 'REIVINDICAR ACESSO' : 'VALIDAR TRANSFERÊNCIA'}
                <ShieldCheck className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            )}
          </Button>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setMode(mode === 'code' ? 'transfer' : 'code')}
              className="text-zinc-500 hover:text-white transition-colors text-[9px] uppercase tracking-widest font-black flex items-center justify-center gap-2"
            >
              <ArrowRightLeft className="w-3 h-3" />
              {mode === 'code' ? 'Reivindicar Transferência de Titular' : 'Usar Chave de Acesso Original'}
            </button>
            
            <button 
              type="button"
              onClick={() => onSuccess({ status: 'MYTHIC', theme: 'mythic', name: 'Membro Elite' })}
              className="text-zinc-700 hover:text-zinc-400 transition-colors text-[9px] uppercase tracking-widest font-black flex items-center justify-center gap-2"
            >
              <LogIn className="w-3 h-3" />
              Já possui credenciais? Autenticar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
