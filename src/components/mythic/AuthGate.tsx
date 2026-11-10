"use client"

import React, { useState, useEffect } from 'react';
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
import { doc, setDoc, updateDoc, getCountFromServer, collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { Loader2, UserPlus, LogIn, Phone, CreditCard, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import NextImage from 'next/image';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthGateProps {
  theme?: string;
  tempProfile?: any;
}

/**
 * @fileOverview Gateway de Autenticação Central - Sovereign Founders Club.
 * Gerencia Login, Registro e o novo Protocolo de Assinatura de Elite.
 */

export function AuthGate({ theme, tempProfile }: AuthGateProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  
  // Estado para o Modal de Pagamento
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (tempProfile?.email) {
      setEmail(tempProfile.email);
    }
  }, [tempProfile]);

  const formatPhoneMask = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmergencyPhone(formatPhoneMask(e.target.value));
  };

  const handleAuthInitiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isLogin) {
      handleAuth();
    } else {
      // Se for cadastro, abre o modal de pagamento primeiro
      setIsPaymentModalOpen(true);
    }
  };

  const handleConfirmPaymentAndRegister = async () => {
    setIsProcessingPayment(true);
    // Simulação de processamento de gateway de elite
    setTimeout(() => {
      handleAuth();
      setIsPaymentModalOpen(false);
      setIsProcessingPayment(false);
    }, 2000);
  };

  const handleAuth = async () => {
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "BEM-VINDO", description: "Identidade Sovereign confirmada." });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        await updateProfile(userCredential.user, { displayName: name });
        
        let memberNumber = 0;
        let inheritedData = {
          city: '',
          state: '',
          isPublicProfile: true,
          status: tempProfile?.status || 'MASTER',
          theme: tempProfile?.theme || 'master',
          eliteScore: 100
        };

        if (tempProfile?.isTransfer && tempProfile?.fromUserId) {
          const originalProfileRef = doc(db, 'users', tempProfile.fromUserId);
          const originalSnap = await getDoc(originalProfileRef).catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: originalProfileRef.path, operation: 'get' }));
            throw err;
          });
          
          if (originalSnap.exists()) {
            const data = originalSnap.data();
            memberNumber = data.memberNumber || 0;
            inheritedData = {
              city: data.city || '',
              state: data.state || '',
              isPublicProfile: data.isPublicProfile ?? true,
              status: data.status || 'MASTER',
              theme: data.theme || 'master',
              eliteScore: data.eliteScore || 100
            };

            const petsRef = collection(db, 'users', tempProfile.fromUserId, 'pets');
            const petsSnap = await getDocs(petsRef).catch(err => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({ path: petsRef.path, operation: 'list' }));
              throw err;
            });
            
            for (const petDoc of petsSnap.docs) {
              const petData = petDoc.data();
              const newPetRef = doc(collection(db, 'users', userId, 'pets'));
              await setDoc(newPetRef, {
                ...petData,
                id: newPetRef.id,
                userId: userId,
                migrationDate: new Date().toISOString()
              }).catch(err => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: newPetRef.path, operation: 'create', requestResourceData: petData }));
              });
            }

            await updateDoc(originalProfileRef, { 
              status: 'REVOKED', 
              revokedAt: new Date().toISOString()
            }).catch(err => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({ path: originalProfileRef.path, operation: 'update' }));
            });
          }
        }

        if (memberNumber === 0) {
          const usersSnapshot = await getCountFromServer(query(collection(db, 'users'), where('status', '!=', 'REVOKED')));
          memberNumber = usersSnapshot.data().count + 1;
        }

        const userRef = doc(db, 'users', userId);
        const userData = {
          id: userId,
          name: name,
          email: email,
          emergencyContact: emergencyPhone,
          registrationDateTime: new Date().toISOString(),
          ...inheritedData,
          memberNumber: memberNumber
        };

        await setDoc(userRef, userData).catch(err => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userRef.path, operation: 'create', requestResourceData: userData }));
          throw err;
        });

        if (tempProfile?.codeId) {
          const codeRef = doc(db, 'mythicCodes', tempProfile.codeId);
          await updateDoc(codeRef, {
            status: 'activated',
            userId: userId,
            activationDateTime: new Date().toISOString()
          }).catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: codeRef.path, operation: 'update' }));
          });
        } else if (tempProfile?.transferRequestId) {
          const transferRef = doc(db, 'transferRequests', tempProfile.transferRequestId);
          await updateDoc(transferRef, {
            status: 'processed',
            processedAt: new Date().toISOString(),
            newUserId: userId
          }).catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: transferRef.path, operation: 'update' }));
          });
        }

        toast({
          title: "BEM-VINDO AO CLUB",
          description: `Sua credencial de Fundador #${memberNumber.toString().padStart(2, '0')} foi ativada.`,
        });
      }
    } catch (error: any) {
      if (!error.message?.includes('Missing or insufficient permissions')) {
        toast({
          variant: "destructive",
          title: "ERRO DE ACESSO",
          description: error.message || "Falha na autenticação.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const themeBtnClass = theme === 'legendary' ? 'bg-yellow-500 text-black' : theme === 'amber' ? 'bg-orange-500 text-black' : 'bg-primary text-white';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 md:py-12 bg-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <NextImage 
              src="/logo-sfc.gif" 
              alt="Sovereign Founders Club" 
              width={300} 
              height={80} 
              className="w-64 md:w-80 h-auto object-contain"
              unoptimized
              priority
            />
          </div>
          <p className="text-zinc-600 text-[9px] uppercase tracking-[0.3em] font-bold">
            Protocolo de Entrada v2026.12
          </p>
        </div>

        <form onSubmit={handleAuthInitiation} className="space-y-4 bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50 backdrop-blur-xl shadow-2xl">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Nome Completo</Label>
                <Input
                  placeholder="NOME"
                  required
                  className="bg-black/50 border-zinc-800 h-12 font-bold uppercase"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> WhatsApp de Elite
                </Label>
                <Input
                  placeholder="(00) 00000-0000"
                  required
                  className="bg-black/50 border-zinc-800 h-12 font-mono"
                  value={emergencyPhone}
                  onChange={handlePhoneChange}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">E-mail</Label>
            <Input
              type="email"
              placeholder="email@exemplo.com"
              required
              className="bg-black/50 border-zinc-800 h-12 font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Senha</Label>
            <Input
              type="password"
              placeholder="••••••••"
              required
              className="bg-black/50 border-zinc-800 h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className={`w-full h-14 text-xs font-black tracking-widest uppercase transition-all duration-500 mt-4 ${themeBtnClass}`}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <span className="flex items-center gap-2">
                {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isLogin ? 'AUTENTICAR' : 'REGISTRAR COMO FUNDADOR'}
              </span>
            )}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-500 hover:text-white transition-colors text-[9px] uppercase tracking-widest font-black"
          >
            {isLogin ? 'Ainda não possui credencial? Cadastre-se' : 'Já possui uma identidade? Autenticar'}
          </button>
        </div>
      </div>

      {/* MODAL DE PAGAMENTO OBRIGATÓRIO */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white w-[95vw] max-w-md rounded-[2.5rem] p-0 overflow-hidden shadow-2xl z-[300]">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-primary animate-pulse" />
          
          <div className="p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 relative group">
                <CreditCard className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-500" />
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-primary animate-pulse" />
              </div>
              
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-center leading-tight">
                  Assinatura de Elite
                </DialogTitle>
                <DialogDescription className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold text-center">
                  Protocolo de Acesso à Comunidade
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="bg-black/40 border border-zinc-900 rounded-[2rem] p-6 space-y-6">
              <div className="flex flex-col items-center gap-1">
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Valor da Linhagem</p>
                 <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-primary">R$</span>
                    <span className="text-5xl font-black tracking-tighter">10,90</span>
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">/mês</span>
                 </div>
              </div>

              <div className="space-y-3">
                {[
                  "Acesso ao Cofre de Inteligência",
                  "Rede Segura Black Room",
                  "Advisor IA sem Filtros",
                  "Credencial de Prestígio"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleConfirmPaymentAndRegister}
                disabled={isProcessingPayment}
                className="w-full h-16 bg-primary hover:bg-accent text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {isProcessingPayment ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    CONFIRMAR ASSINATURA <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </Button>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-full text-[9px] font-black text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors"
              >
                Retornar ao Protocolo Anterior
              </button>
            </div>
          </div>
          
          <footer className="bg-black/40 py-4 text-center border-t border-zinc-900/50">
             <p className="text-[7px] font-black text-zinc-700 uppercase tracking-[0.5em]">Transação Criptografada Sovereign Pay</p>
          </footer>
        </DialogContent>
      </Dialog>

      <footer className="absolute bottom-8 text-center opacity-20">
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-600">
          Sovereign Founders Identity System • 2026
        </p>
      </footer>
    </div>
  );
}
