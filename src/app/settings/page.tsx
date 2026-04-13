
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Camera, ShieldAlert, AlertCircle, ArrowRightLeft, Loader2, ShieldX, Check, Settings, Save } from "lucide-react";
import Link from 'next/link';
import NextImage from 'next/image';
import { compressImage } from '@/lib/image-utils';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ImageEditor } from '@/components/mythic/ImageEditor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { sendTransferConfirmationEmail } from '@/app/actions';
import { signOut } from 'firebase/auth';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  
  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  const [settingsName, setSettingsName] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsCity, setSettingsCity] = useState('');
  const [settingsState, setSettingsState] = useState('');
  const [settingsPhoto, setSettingsPhoto] = useState<string | null>(null);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProtocolStatus, setTransferProtocolStatus] = useState<'idle' | 'initiating' | 'done'>('idle');
  const [transferCode, setTransferCode] = useState('');

  const [editorState, setEditorState] = useState<{
    image: string;
  } | null>(null);

  useEffect(() => {
    if (profile) {
      setSettingsName(profile.name || '');
      setSettingsPhone(profile.emergencyContact || '');
      setSettingsCity(profile.city || '');
      setSettingsState(profile.state || '');
      setSettingsPhoto(profile.photo || null);
    }
  }, [profile]);

  const formatPhoneMask = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsPhone(formatPhoneMask(e.target.value));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setEditorState({
        image: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleEditorConfirm = async (croppedImage: string) => {
    try {
      const compressed = await compressImage(croppedImage);
      setSettingsPhoto(compressed);
      setEditorState(null);
      toast({
        title: "IMAGEM PROCESSADA",
        description: "A foto de perfil foi ajustada com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "ERRO NO PROCESSAMENTO",
        description: "Falha ao otimizar a imagem.",
      });
      setEditorState(null);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !db) return;

    setIsUpdatingSettings(true);
    try {
      const userRef = doc(db, 'users', profile.id);
      updateDocumentNonBlocking(userRef, {
        name: settingsName,
        emergencyContact: settingsPhone,
        city: settingsCity,
        state: settingsState,
        photo: settingsPhoto
      });

      toast({
        title: "PERFIL ATUALIZADO",
        description: "Suas credenciais foram sincronizadas com a rede.",
      });
    } catch (err) {
      toast({ variant: "destructive", title: "ERRO AO SALVAR", description: "Falha ao atualizar perfil." });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferEmail || !profile?.id || !db) return;

    setIsTransferring(true);
    setTransferProtocolStatus('initiating');
    
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
    setTransferCode(confirmationCode);
    const statusRank = profile.status || 'MYTHIC';

    try {
      const requestsRef = collection(db, 'transferRequests');
      addDocumentNonBlocking(requestsRef, {
        fromUserId: profile.id,
        fromUserName: profile.name,
        fromUserEmail: profile.email,
        toUserEmail: transferEmail,
        confirmationCode,
        statusRank,
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      await sendTransferConfirmationEmail({
        fromName: profile.name,
        fromEmail: profile.email,
        toEmail: transferEmail,
        confirmationCode,
        statusRank
      });

      setTransferProtocolStatus('done');
      
      toast({
        variant: "destructive",
        title: "PROTOCOLO INICIADO",
        description: "A credencial será revogada em instantes.",
      });
      
      setTimeout(() => {
        signOut(auth);
      }, 15000);
    } catch (err) {
      toast({ variant: "destructive", title: "ERRO NO PROTOCOLO", description: "Falha ao registrar transferência." });
      setIsTransferring(false);
      setTransferProtocolStatus('idle');
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8 text-center">
        <div className="space-y-4">
          <ShieldAlert className="w-12 h-12 text-zinc-800 mx-auto" />
          <h1 className="text-xl font-black uppercase text-white">Identidade Não Localizada</h1>
          <Button asChild variant="outline" className="border-zinc-800 rounded-full">
            <Link href="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isLegendary = profile.status === 'LEGENDARY';
  const isAmber = profile.status === 'AMBER';
  const themeColorClass = isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary';
  const themeBtnClass = isLegendary ? 'bg-yellow-500 text-black hover:bg-yellow-400' : isAmber ? 'bg-orange-500 text-black hover:bg-orange-400' : 'bg-primary text-white hover:bg-accent';

  return (
    <main className={`min-h-screen bg-black text-white p-4 md:p-8 animate-in fade-in duration-700 ${isLegendary ? 'theme-legendary' : isAmber ? 'theme-amber' : ''}`}>
      <div className="max-w-3xl mx-auto space-y-10 py-8 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.3em]">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </Link>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Settings className={cn("w-6 h-6", themeColorClass)} />
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Configurações de Elite</h1>
          </div>
          <p className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold">Gestão de Identidade Hall Black v2026</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card className="bg-zinc-950/40 border-zinc-900 backdrop-blur-xl rounded-3xl p-6 md:p-10">
            <form onSubmit={handleUpdateSettings} className="space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div 
                  onClick={() => profilePicInputRef.current?.click()} 
                  className="w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden relative group shadow-2xl"
                >
                  {settingsPhoto ? (
                    <NextImage src={settingsPhoto} alt="Profile" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-zinc-600">
                      <User className="w-10 h-10" />
                      <span className="text-[9px] font-black uppercase">Foto</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <input type="file" ref={profilePicInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Toque para atualizar sua imagem</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Nome Completo</Label>
                  <Input 
                    className="bg-black/50 border-zinc-800 h-14 text-lg font-bold focus:ring-primary" 
                    value={settingsName} 
                    onChange={(e) => setSettingsName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Contato de Emergência (WhatsApp)</Label>
                  <Input 
                    className="bg-black/50 border-zinc-800 h-14 text-lg font-mono focus:ring-primary" 
                    value={settingsPhone} 
                    onChange={handlePhoneChange} 
                    placeholder="(00) 00000-0000" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Cidade</Label>
                  <Input 
                    className="bg-black/50 border-zinc-800 h-14 font-bold focus:ring-primary" 
                    value={settingsCity} 
                    onChange={(e) => setSettingsCity(e.target.value)} 
                    placeholder="Ex: São Paulo" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 ml-1">Estado</Label>
                  <Input 
                    className="bg-black/50 border-zinc-800 h-14 font-bold focus:ring-primary" 
                    value={settingsState} 
                    onChange={(e) => setSettingsState(e.target.value)} 
                    placeholder="Ex: SP" 
                  />
                </div>
              </div>

              <Button type="submit" className={cn("w-full h-16 font-black uppercase tracking-[0.2em] rounded-2xl text-base", themeBtnClass)} disabled={isUpdatingSettings}>
                {isUpdatingSettings ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <span className="flex items-center gap-2">
                    <Save className="w-5 h-5" /> Sincronizar Credenciais
                  </span>
                )}
              </Button>
            </form>

            <Separator className="my-12 bg-zinc-900" />

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className={cn("w-5 h-5", themeColorClass)} />
                <h3 className="text-xl font-black uppercase tracking-tight">Protocolo de Cessão</h3>
              </div>
              <div className="bg-red-950/10 border border-red-900/30 p-6 rounded-2xl space-y-3">
                <p className="text-[11px] text-zinc-400 uppercase tracking-widest leading-relaxed">
                  Deseja transferir sua titularidade para outro membro? Este processo requer validação de segurança, é permanente e resultará na <span className="text-red-500 font-bold">REVOGAÇÃO IMEDIATA</span> do seu acesso.
                </p>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsTransferOpen(true)}
                  className="w-full h-14 rounded-xl border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-600/50 hover:bg-red-950/10 transition-all text-xs font-black uppercase tracking-widest"
                >
                  Solicitar Transferência de Credencial
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <footer className="pt-20 text-center opacity-30">
          <p className="text-[8px] md:text-[10px] text-zinc-700 uppercase tracking-[0.5em] font-black">
            HALL BLACK CLUB SECURE MANAGEMENT © {new Date().getFullYear()}
          </p>
        </footer>
      </div>

      {/* DIALOG DE TRANSFERÊNCIA */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-w-md rounded-2xl z-[200]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-950/20 border border-red-900/50">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <DialogTitle className="text-xl font-black uppercase tracking-tighter">Protocolo de Cessão</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest leading-relaxed">
              {transferProtocolStatus === 'done' 
                ? 'IDENTIDADE REVOGADA. O ACESSO SERÁ ENCERRADO.'
                : 'Inicie a transferência permanente de sua credencial de elite.'}
            </DialogDescription>
          </DialogHeader>
          
          {transferProtocolStatus !== 'done' ? (
            <form onSubmit={handleInitiateTransfer} className="space-y-6 pt-4">
              <div className="bg-red-950/10 border border-red-900/30 p-4 rounded-xl space-y-2">
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" /> Atenção Crítica
                </p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Ao finalizar, sua conta será bloqueada. O novo titular assumirá seu slot, seus pets e seu legado de elite.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Email do Novo Titular</Label>
                <Input 
                  type="email" 
                  required 
                  placeholder="novo.membro@exemplo.com"
                  className="bg-black/50 border-zinc-800 h-12 text-white"
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  disabled={isTransferring}
                />
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsTransferOpen(false)}
                  className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest border border-zinc-900 text-zinc-500 hover:text-white"
                  disabled={isTransferring}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isTransferring || !transferEmail}
                  className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest"
                >
                  {isTransferring ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Protocolo'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-500">
              <div className="relative">
                 <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full" />
                 <ShieldX className="w-20 h-20 text-red-600 relative z-10 animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-white font-black text-xl uppercase tracking-widest">Protocolo Emitido</h3>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest max-w-[250px] mx-auto leading-relaxed">
                    Use o código abaixo para validar a transferência.
                  </p>
                </div>
                
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-2">
                   <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Código de Auditoria</p>
                   <p className="text-3xl font-mono font-black text-white tracking-[0.3em]">{transferCode}</p>
                </div>

                <div className="flex flex-col items-center gap-3 pt-4">
                   <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Encerrando sessão em 15s...</p>
                   <Loader2 className="w-6 h-6 animate-spin text-zinc-800" />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDITOR DE IMAGEM */}
      <Dialog open={!!editorState} onOpenChange={(open) => { if(!open) setEditorState(null); }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-w-md p-6 z-[300] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Ajuste de Imagem</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest">Enquadre sua identidade de elite.</DialogDescription>
          </DialogHeader>
          {editorState && (
            <ImageEditor 
              image={editorState.image}
              cropShape="round"
              onCancel={() => setEditorState(null)}
              onConfirm={handleEditorConfirm}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
