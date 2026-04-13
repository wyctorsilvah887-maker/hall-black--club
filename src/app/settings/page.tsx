
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Camera, ShieldAlert, ArrowRightLeft, Loader2, ShieldX, ShieldCheck, ChevronRight, X, MapPin, AlignLeft } from "lucide-react";
import Link from 'next/link';
import NextImage from 'next/image';
import { compressImage } from '@/lib/image-utils';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ImageEditor } from '@/components/mythic/ImageEditor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { sendTransferConfirmationEmail } from '@/app/actions';
import { signOut } from 'firebase/auth';

/**
 * @fileOverview Página de configurações de elite do Hall Black Club.
 * Oferece edição de perfil, gestão de privacidade e protocolo de transferência.
 */

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
  const [settingsBio, setSettingsBio] = useState('');
  const [settingsPhoto, setSettingsPhoto] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
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
      setSettingsBio(profile.bio || '');
      setSettingsPhoto(profile.photo || null);
      setIsPublic(profile.isPublicProfile ?? true);
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
      setEditorState({ image: reader.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleEditorConfirm = async (croppedImage: string) => {
    try {
      const compressed = await compressImage(croppedImage);
      setSettingsPhoto(compressed);
      setEditorState(null);
      toast({ title: "IMAGEM ATUALIZADA", description: "Sua foto de perfil foi processada." });
    } catch (error) {
      toast({ variant: "destructive", title: "ERRO", description: "Falha ao processar imagem." });
      setEditorState(null);
    }
  };

  const handleUpdateSettings = async () => {
    if (!profile?.id || !db) return;
    setIsUpdatingSettings(true);
    try {
      const userRef = doc(db, 'users', profile.id);
      updateDocumentNonBlocking(userRef, {
        name: settingsName,
        emergencyContact: settingsPhone,
        city: settingsCity,
        state: settingsState,
        bio: settingsBio,
        photo: settingsPhoto
      });
      toast({ title: "PERFIL SINCRONIZADO", description: "Suas credenciais foram atualizadas na rede." });
      setIsProfileEditOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "ERRO", description: "Falha ao salvar." });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleTogglePrivacy = (checked: boolean) => {
    if (!profile?.id || !db) return;
    setIsPublic(checked);
    const userRef = doc(db, 'users', profile.id);
    updateDocumentNonBlocking(userRef, {
      isPublicProfile: checked
    });
    toast({ 
      title: checked ? "PERFIL PÚBLICO ATIVO" : "PERFIL RESTRITO", 
      description: checked ? "Sua credencial agora está visível na rede." : "Sua identidade foi ocultada da busca pública." 
    });
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
      toast({ variant: "destructive", title: "REVOGAÇÃO INICIADA", description: "Sua credencial será encerrada em instantes." });
      setTimeout(() => signOut(auth), 15000);
    } catch (err) {
      toast({ variant: "destructive", title: "ERRO", description: "Falha no protocolo." });
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

  const isLegendary = profile?.status === 'LEGENDARY';
  const isAmber = profile?.status === 'AMBER';
  const themeColor = isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary';
  const themeBorder = isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : 'border-zinc-900';

  return (
    <main className={cn("min-h-screen bg-black text-white pb-20 animate-in fade-in duration-500", isLegendary ? 'theme-legendary' : isAmber ? 'theme-amber' : '')}>
      <div className="max-w-2xl mx-auto px-4 md:px-0">
        
        {/* HEADER ESTILO APP */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md py-6 flex items-center justify-between border-b border-zinc-900/50 mb-8">
          <Link href="/" className="p-2 -ml-2 hover:bg-zinc-900 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-sm font-black uppercase tracking-widest">Configurações</h1>
          <div className="w-10" />
        </header>

        {/* SEÇÃO: PERFIL */}
        <div className="mb-10">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-4 mb-3">Minha Conta</p>
          <div className="bg-zinc-950/50 border-y border-zinc-900 divide-y divide-zinc-900">
            <button 
              onClick={() => setIsProfileEditOpen(true)}
              className="w-full flex items-center justify-between px-4 py-5 group text-left transition-colors hover:bg-zinc-900/40"
            >
              <div className="flex items-center gap-3">
                <User className={cn("w-4 h-4", themeColor)} />
                <p className="text-[11px] font-black uppercase tracking-widest text-white">Perfil</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider hidden sm:block">
                  {settingsName || 'Configurar'}
                </p>
                <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-white transition-colors" />
              </div>
            </button>
          </div>
        </div>

        {/* SEÇÃO: PRIVACIDADE FUNCIONAL */}
        <div className="space-y-1 mb-10">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-4 mb-3">Privacidade de Elite</p>
          <div className="bg-zinc-950/50 border-y border-zinc-900 divide-y divide-zinc-900">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="space-y-0.5">
                <p className="text-[11px] font-black uppercase tracking-widest">Perfil Público</p>
                <p className="text-[9px] text-zinc-600 uppercase font-bold">Visível para outros membros na rede</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={handleTogglePrivacy} />
            </div>
          </div>
        </div>

        {/* SEÇÃO: GERENCIAMENTO */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-4 mb-3">Gerenciamento de Conta</p>
          <div className="bg-zinc-950/50 border-y border-zinc-900 divide-y divide-zinc-900">
            <button 
              onClick={() => setIsTransferOpen(true)}
              className="w-full flex items-center justify-between px-4 py-5 group text-left transition-colors hover:bg-red-950/10"
            >
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="w-4 h-4 text-red-600" />
                <p className="text-[11px] font-black uppercase tracking-widest text-red-600">Transferir Credencial</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-red-600 transition-colors" />
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="w-full flex items-center justify-between px-4 py-5 group text-left transition-colors hover:bg-zinc-900/40"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-zinc-600" />
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-300">Encerrar Sessão</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        <footer className="mt-20 py-10 border-t border-zinc-900/50 text-center opacity-20">
          <p className="text-[8px] font-black uppercase tracking-[0.6em]">Hall Black Club Protocol © 2026</p>
        </footer>
      </div>

      {/* DIALOG DE EDIÇÃO DE PERFIL */}
      <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
        <DialogContent className="bg-black border-zinc-900 text-white w-full h-full sm:h-auto sm:max-w-md p-0 overflow-y-auto z-[200]">
          <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 px-6 py-4 flex items-center justify-between border-b border-zinc-900">
            <button onClick={() => setIsProfileEditOpen(false)} className="p-2 -ml-2">
              <X className="w-6 h-6 text-zinc-500" />
            </button>
            <DialogTitle className="text-sm font-black uppercase tracking-widest">Editar Perfil</DialogTitle>
            <button 
              onClick={handleUpdateSettings}
              disabled={isUpdatingSettings}
              className={cn("text-sm font-black uppercase tracking-widest", themeColor)}
            >
              {isUpdatingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </button>
          </div>
          
          <div className="p-6 space-y-8 pb-20">
            <DialogDescription className="sr-only">Altere seus dados de titularidade e foto de credencial.</DialogDescription>
            
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={() => profilePicInputRef.current?.click()}
                className={cn("w-32 h-32 rounded-full border-4 overflow-hidden relative group cursor-pointer shadow-2xl", themeBorder)}
              >
                {settingsPhoto ? (
                  <NextImage src={settingsPhoto} alt="Profile" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                    <User className="w-12 h-12 text-zinc-800" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <button 
                onClick={() => profilePicInputRef.current?.click()}
                className={cn("text-[10px] font-black uppercase tracking-widest underline underline-offset-4", themeColor)}
              >
                Alterar Foto de Elite
              </button>
              <input type="file" ref={profilePicInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User className="w-3 h-3" /> Nome Completo
                </Label>
                <Input 
                  value={settingsName || ''} 
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="bg-zinc-950 border-zinc-900 h-12 font-bold uppercase focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <AlignLeft className="w-3 h-3" /> Biografia
                </Label>
                <Textarea 
                  value={settingsBio || ''} 
                  onChange={(e) => setSettingsBio(e.target.value)}
                  placeholder="Conte um pouco sobre sua trajetória no mundo pet..."
                  className="bg-zinc-950 border-zinc-900 min-h-[100px] font-medium focus-visible:ring-primary resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> Contato Emergencial
                </Label>
                <Input 
                  value={settingsPhone || ''} 
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  className="bg-zinc-950 border-zinc-900 h-12 font-mono focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Cidade
                  </Label>
                  <Input 
                    value={settingsCity || ''} 
                    onChange={(e) => setSettingsCity(e.target.value)}
                    className="bg-zinc-950 border-zinc-900 h-12 font-bold uppercase focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 text-center">UF</Label>
                  <Input 
                    value={settingsState || ''} 
                    maxLength={2}
                    onChange={(e) => setSettingsState(e.target.value.toUpperCase())}
                    className="bg-zinc-950 border-zinc-900 h-12 font-bold uppercase text-center focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE TRANSFERÊNCIA */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white w-[95vw] max-w-md rounded-[2rem] p-0 overflow-hidden shadow-2xl z-[200]">
          <div className="absolute top-0 inset-x-0 h-1 bg-red-600" />
          {transferProtocolStatus !== 'done' ? (
            <div className="p-8 space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-3xl bg-red-950/20 border border-red-900/50">
                  <ShieldAlert className="w-10 h-10 text-red-600" />
                </div>
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-black uppercase tracking-tighter text-center">Cessão de Credencial</DialogTitle>
                  <DialogDescription className="text-[9px] text-red-500 uppercase tracking-widest font-bold leading-relaxed max-w-xs mx-auto text-center">
                    ESTE PROCESSO É IRREVERSÍVEL E RESULTARÁ NA REVOGAÇÃO IMEDIATA DA SUA IDENTIDADE.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <form onSubmit={handleInitiateTransfer} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold ml-1">E-mail do Novo Titular</Label>
                  <Input 
                    type="email" required 
                    placeholder="novo.membro@hallblack.com"
                    className="bg-zinc-900/50 border-zinc-800 h-14 rounded-2xl text-sm font-bold"
                    value={transferEmail || ''}
                    onChange={(e) => setTransferEmail(e.target.value)}
                    disabled={isTransferring}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    type="submit" disabled={isTransferring || !transferEmail}
                    className="h-14 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl"
                  >
                    {isTransferring ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Transferência'}
                  </Button>
                  <Button variant="ghost" onClick={() => setIsTransferOpen(false)} className="h-12 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    Cancelar Protocolo
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="py-16 px-8 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500">
              <ShieldX className="w-20 h-20 text-red-600 animate-pulse" />
              <div className="space-y-4">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-black uppercase tracking-widest text-center">Protocolo Emitido</DialogTitle>
                  <DialogDescription className="text-[9px] text-zinc-500 uppercase font-bold leading-relaxed text-center">
                    Sua identidade foi revogada. Informe o código abaixo ao novo titular para concluir a herança da credencial.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                   <p className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.4em] mb-2">Código de Segurança</p>
                   <p className="text-4xl font-mono font-black text-white tracking-[0.3em]">{transferCode}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDITOR DE IMAGEM */}
      <Dialog open={!!editorState} onOpenChange={(open) => { if(!open) setEditorState(null); }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-w-md p-6 rounded-3xl z-[300]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tighter">Ajuste de Credencial</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 uppercase tracking-widest">Enquadramento oficial para rede de elite.</DialogDescription>
          </DialogHeader>
          {editorState && (
            <ImageEditor image={editorState.image} cropShape="round" onCancel={() => setEditorState(null)} onConfirm={handleEditorConfirm} />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
