
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
import { Loader2, UserPlus, LogIn, ArrowLeft, Shield, Phone } from "lucide-react";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  const hasValidEntry = !!(tempProfile?.codeId || tempProfile?.transferRequestId);

  useEffect(() => {
    if (tempProfile?.email) {
      setEmail(tempProfile.email);
    }
    if (hasValidEntry) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [tempProfile, hasValidEntry]);

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "BEM-VINDO", description: "Identidade confirmada." });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        await updateProfile(userCredential.user, { displayName: name });
        
        let memberNumber = 0;
        // Todos novos usuários sem código específico entram como MASTER
        let inheritedData = {
          city: '',
          state: '',
          isPublicProfile: true,
          status: tempProfile?.status || 'MASTER',
          theme: tempProfile?.theme || 'master'
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
              theme: data.theme || 'master'
            };

            // Migrar Pets
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

            // Marcar perfil antigo como revogado
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
          pedigreeScore: 100, // Score inicial
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
          description: `Sua credencial de Mestre #${memberNumber.toString().padStart(2, '0')} foi ativada.`,
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

  const themeTextClass = theme === 'legendary' ? 'text-yellow-500' : theme === 'amber' ? 'text-orange-500' : theme === 'elite' ? 'text-zinc-400' : theme === 'master' ? 'text-orange-900' : 'text-primary';
  const themeBtnClass = theme === 'legendary' ? 'bg-yellow-500 text-black' : theme === 'amber' ? 'bg-orange-500 text-black' : 'bg-primary text-white';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 md:py-12 bg-black relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <Shield className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
          <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tighter ${themeTextClass}`}>
            {isLogin ? 'Confirmar Identidade' : 'Entrar para a Elite'}
          </h2>
          <p className="text-zinc-600 text-[9px] uppercase tracking-[0.3em] font-bold">
            Protocolo de Entrada Hall Black
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800/50 backdrop-blur-xl">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Nome Completo</Label>
                <Input
                  placeholder="NOME"
                  required
                  className="bg-black/50 border-zinc-800 h-12"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Contato de Emergência
                </Label>
                <Input
                  placeholder="(00) 00000-0000"
                  required
                  className="bg-black/50 border-zinc-800 h-12"
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
              className="bg-black/50 border-zinc-800 h-12"
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
                {isLogin ? 'AUTENTICAR' : 'REGISTRAR COMO MESTRE'}
              </span>
            )}
          </Button>
        </form>

        <div className="text-center space-y-6">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-500 hover:text-white transition-colors text-[9px] uppercase tracking-widest font-bold"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já possui credenciais? Login'}
          </button>
          
          <button 
            type="button"
            onClick={() => {
              localStorage.removeItem('mythic_access_granted');
              window.location.reload();
            }}
            className="flex items-center gap-2 mx-auto text-zinc-700 hover:text-zinc-500 transition-colors text-[9px] uppercase tracking-widest font-black"
          >
            <ArrowLeft className="w-3 h-3" /> Início
          </button>
        </div>
      </div>
    </div>
  );
}
