
"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Loader2, UserPlus, LogIn, ArrowLeft, Shield, Phone } from "lucide-react";

interface AuthGateProps {
  theme?: string;
  tempProfile?: any;
}

export function AuthGate({ theme, tempProfile }: AuthGateProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const formatPhoneMask = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (2 do DDD + 9 do número)
    const truncated = digits.slice(0, 11);
    
    if (truncated.length === 0) return '';
    
    let formatted = '+55 ';
    
    if (truncated.length > 0) {
      if (truncated.length <= 2) {
        formatted += `(${truncated}`;
      } else if (truncated.length <= 7) {
        formatted += `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
      } else {
        formatted += `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;
      }
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Se o usuário estiver apagando, permitimos o comportamento padrão ou limpamos tudo se for pequeno
    if (input.length < emergencyPhone.length && emergencyPhone.startsWith('+55 ') && input.length <= 4) {
      setEmergencyPhone('');
      return;
    }
    
    setEmergencyPhone(formatPhoneMask(input));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "BEM-VINDO DE VOLTA",
          description: "Sua identidade foi confirmada.",
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Salva o perfil no Firestore após o registro
        const userRef = doc(db, 'users', userCredential.user.uid);
        setDoc(userRef, {
          id: userCredential.user.uid,
          name: name,
          email: email,
          emergencyContact: emergencyPhone,
          registrationDateTime: new Date().toISOString(),
          isPublicProfile: true,
          rankingScore: tempProfile?.rank || 0,
          status: tempProfile?.status || 'MYTHIC',
          theme: tempProfile?.theme || 'mythic'
        }, { merge: true });

        toast({
          title: "REGISTRO CONCLUÍDO",
          description: "Sua conta na elite foi criada com sucesso.",
        });
      }
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro na autenticação.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Credenciais inválidas para este nível de acesso.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este email já possui registro no Hall Black.";
      }

      toast({
        variant: "destructive",
        title: "ERRO DE ACESSO",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const themeTextClass = theme === 'legendary' 
    ? 'text-yellow-500 animate-text-gold-glow' 
    : theme === 'amber' 
    ? 'text-orange-500 animate-text-amber-glow' 
    : 'text-primary animate-text-ruby-glow';

  const themeBtnClass = theme === 'legendary'
    ? 'bg-yellow-500 hover:bg-yellow-400 text-black animate-gold-glow'
    : theme === 'amber'
    ? 'bg-orange-500 hover:bg-orange-400 text-black animate-amber-glow'
    : 'bg-primary hover:bg-accent text-white animate-ruby-glow';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-black relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <Shield className={`w-12 h-12 mx-auto mb-4 ${theme === 'legendary' ? 'text-yellow-500' : theme === 'amber' ? 'text-orange-500' : 'text-primary'}`} />
          <h2 className={`text-4xl font-black tracking-tighter uppercase ${themeTextClass}`}>
            {isLogin ? 'Confirmar Identidade' : 'Criar Credenciais'}
          </h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">
            Proteção de Nível Militar Hall Black
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5 bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50 backdrop-blur-xl">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Nome Completo</Label>
                <Input
                  placeholder="SEU NOME"
                  required
                  className="bg-black/50 border-zinc-800 focus-visible:ring-primary/50 text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Contato de Emergência
                </Label>
                <Input
                  placeholder="+55 (00) 00000-0000"
                  required
                  className="bg-black/50 border-zinc-800 focus-visible:ring-primary/50 text-white"
                  value={emergencyPhone}
                  onChange={handlePhoneChange}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Email Autorizado</Label>
            <Input
              type="email"
              placeholder="email@exemplo.com"
              required
              className="bg-black/50 border-zinc-800 focus-visible:ring-primary/50 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Senha de Criptografia</Label>
            <Input
              type="password"
              placeholder="••••••••"
              required
              className="bg-black/50 border-zinc-800 focus-visible:ring-primary/50 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className={`w-full h-14 text-sm font-black tracking-widest uppercase transition-all duration-500 mt-4 ${themeBtnClass}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isLogin ? 'AUTENTICAR AGORA' : 'FINALIZAR REGISTRO'}
              </span>
            )}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-500 hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em] font-bold"
          >
            {isLogin ? 'Não possui registro? Criar conta elite' : 'Já possui credenciais? Fazer login'}
          </button>
          
          <div className="pt-4">
            <button 
              onClick={() => {
                localStorage.removeItem('mythic_access_granted');
                window.location.reload();
              }}
              className="flex items-center gap-2 mx-auto text-zinc-700 hover:text-zinc-500 transition-colors text-[9px] uppercase tracking-widest font-black"
            >
              <ArrowLeft className="w-3 h-3" />
              Voltar para Validação de Chave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
