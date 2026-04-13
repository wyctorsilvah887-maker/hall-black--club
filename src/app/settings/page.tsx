
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Camera, ShieldAlert, AlertCircle, ArrowRightLeft, Loader2, ShieldX, Check, Settings, Save, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
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
    <main className={`min-h-screen bg-black text-white p-4 md:p-8 animate-in fade-in duration-700 pb-20 ${isLegendary ? 'theme-legendary' : isAmber ? 'theme-amber' : ''}`}>
      <div className="max-w-4xl mx-auto space-y-12 py-8 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-[0.3em]">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </Link>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Settings className={cn("w-6 h-6 md:w-8 md:h-8", themeColorClass)} />
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Central de Elite</h1>
          </div>
          <p className="text-zinc-500 text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold">Gestão de Identidade Hall Black v2026</p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* MÓDULO 1: EDITAR PERFIL */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
              <User className={cn("w-5 h-5", themeColorClass)} />
              <h2 className="text-xl font-black uppercase tracking-tight">Editar Perfil</h2>
            </div>
            <Card className="bg-zinc-950/40 border-zinc-900 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
              <form onSubmit={handleUpdateSettings} className="space-y-10 relative z-10">
                <div className="flex flex-col items-center gap-6">
                  <div 
                    onClick={() => profilePicInputRef.current?.click()} 
                    className={cn(
                      "w-32 h-32 md:w-44 md:h-44 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative group shadow-2xl transition-all",
                      isLegendary ? "border-yellow-500/30 hover:border-yellow-500" : isAmber ? "border-orange-500/30 hover:border-orange-500" : "border-zinc-800 hover:border-primary"
                    )}
                  >
                    {settingsPhoto ? (
                      <NextImage src={settingsPhoto} alt="Profile" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-600">
                        <User className="w-12 h-12" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Foto</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <input type="file" ref={profilePicInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Toque para atualizar sua imagem de elite</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-[11px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-1">Nome de Titularidade</Label>
                    <Input 
                      className="bg-black/50 border-zinc-800 h-16 text-xl font-black uppercase tracking-tight focus:ring-primary rounded-2xl" 
                      value={settingsName} 
                      onChange={(e) => setSettingsName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-[11px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-1">Contato SOS (WhatsApp)</Label>
                    <Input 
                      className="bg-black/50 border-zinc-800 h-16 text-xl font-mono focus:ring-primary rounded-2xl" 
                      value={settingsPhone} 
                      onChange={handlePhoneChange} 
                      placeholder="(00) 00000-0000" 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-1">Cidade de Atuação</Label>
                    <Input 
                      className="bg-black/50 border-zinc-800 h-16 font-bold uppercase rounded-2xl" 
                      value={settingsCity} 
                      onChange={(e) => setSettingsCity(e.target.value)} 
                      placeholder="Ex: São Paulo" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-1">Estado (UF)</Label>
                    <Input 
                      className="bg-black/50 border-zinc-800 h-16 font-bold uppercase rounded-2xl text-center" 
                      value={settingsState} 
                      maxLength={2}
                      onChange={(e) => setSettingsState(e.target.value.toUpperCase())} 
                      placeholder="Ex: SP" 
                    />
                  </div>
                </div>

                <Button type="submit" className={cn("w-full h-20 font-black uppercase tracking-[0.3em] rounded-[1.5rem] text-lg transition-all duration-500 shadow-xl", themeBtnClass)} disabled={isUpdatingSettings}>
                  {isUpdatingSettings ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                    <span className="flex items-center gap-3">
                      <Save className="w-6 h-6" /> Sincronizar Identidade
                    </span>
                  )}
                </Button>
              </form>
            </Card>
          </section>

          {/* MÓDULO 2: PRIVACIDADE DE ELITE */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
              <Lock className={cn("w-5 h-5", themeColorClass)} />
              <h2 className="text-xl font-black uppercase tracking-tight">Privacidade de Elite</h2>
            </div>
            <Card className="bg-zinc-950/40 border-zinc-900 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-zinc-900 group opacity-50 cursor-not-allowed">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-zinc-500" />
                      <p className="text-xs font-black uppercase tracking-widest text-white">Perfil Público</p>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold">Visível para outros membros da elite</p>
                  </div>
                  <Switch checked={true} disabled />
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-zinc-900 group opacity-50 cursor-not-allowed">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-zinc-500" />
                      <p className="text-xs font-black uppercase tracking-widest text-white">Modo Invisível</p>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold">Ocultar status de atividade na rede</p>
                  </div>
                  <Switch checked={false} disabled />
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-zinc-900 group opacity-50 cursor-not-allowed md:col-span-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-zinc-500" />
                      <p className="text-xs font-black uppercase tracking-widest text-white">Segurança Biométrica (Simulado)</p>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase font-bold">Requer autenticação para ver dados sensíveis</p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-zinc-900/20 rounded-2xl border border-zinc-900">
                <AlertCircle className="w-4 h-4 text-zinc-700 mt-0.5" />
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black leading-relaxed">
                  As configurações de privacidade são gerenciadas automaticamente pelo protocolo Hall Black 2026 para garantir o sigilo absoluto da linhagem pet.
                </p>
              </div>
            </Card>
          </section>

          {/* MÓDULO 3: PROTOCOLO DE CESSÃO */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
              <ArrowRightLeft className={cn("w-5 h-5", themeColorClass)} />
              <h2 className="text-xl font-black uppercase tracking-tight">Protocolo de Cessão</h2>
            </div>
            <Card className="bg-red-950/5 border border-red-900/30 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="p-6 rounded-full bg-red-950/20 border border-red-900/30">
                  <ShieldAlert className="w-12 h-12 text-red-600 animate-pulse" />
                </div>
                <div className="space-y-6 flex-1 text-center md:text-left">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-red-500">Atenção Crítica</h3>
                    <p className="text-[11px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold leading-relaxed max-w-xl">
                      Deseja transferir sua titularidade para outro membro? Este processo requer validação de segurança, é permanente e resultará na <span className="text-red-500 font-black">REVOGAÇÃO IMEDIATA</span> da sua identidade de elite.
                    </p>
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsTransferOpen(true)}
                    className="w-full md:w-fit h-14 md:h-16 px-10 rounded-2xl border-red-900/40 text-red-500 hover:text-white hover:bg-red-600 transition-all text-xs font-black uppercase tracking-[0.2em]"
                  >
                    Solicitar Transferência de Credencial
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        </div>

        <footer className="pt-20 text-center opacity-30">
          <p className="text-[9px] md:text-[11px] text-zinc-700 uppercase tracking-[0.6em] font-black">
            HALL BLACK CLUB SECURE IDENTITY MANAGEMENT © {new Date().getFullYear()}
          </p>
        </footer>
      </div>

      {/* DIALOG DE TRANSFERÊNCIA */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-w-md rounded-[2rem] z-[200] p-0 overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-red-600" />
          
          {transferProtocolStatus !== 'done' ? (
            <div className="p-8 space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-3xl bg-red-950/20 border border-red-900/50">
                  <ShieldAlert className="w-10 h-10 text-red-600" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Protocolo de Cessão</DialogTitle>
                  <DialogDescription className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold pt-1">
                    Inicie a transferência permanente de sua credencial.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <form onSubmit={handleInitiateTransfer} className="space-y-6">
                <div className="bg-red-950/10 border border-red-900/30 p-5 rounded-3xl space-y-3">
                  <p className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Alerta de Irreversibilidade
                  </p>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold leading-relaxed">
                    Ao confirmar, sua conta será bloqueada permanentemente. O novo titular herdará sua posição, seus pets e seu histórico.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 ml-1">E-mail do Novo Titular (Cessionário)</Label>
                  <Input 
                    type="email" 
                    required 
                    placeholder="novo.membro@exemplo.com"
                    className="bg-black/50 border-zinc-800 h-14 text-white rounded-2xl text-lg font-bold"
                    value={transferEmail}
                    onChange={(e) => setTransferEmail(e.target.value)}
                    disabled={isTransferring}
                  />
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    type="submit" 
                    disabled={isTransferring || !transferEmail}
                    className="w-full h-16 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-red-900/20"
                  >
                    {isTransferring ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar Transferência Permanente'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsTransferOpen(false)}
                    className="w-full h-14 text-[10px] font-black uppercase tracking-widest border border-zinc-900 text-zinc-500 hover:text-white rounded-2xl"
                    disabled={isTransferring}
                  >
                    Cancelar Operação
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-10 animate-in zoom-in duration-500">
              <div className="relative">
                 <div className="absolute inset-0 bg-red-600/20 blur-[80px] rounded-full" />
                 <ShieldX className="w-24 h-24 text-red-600 relative z-10 animate-pulse" />
              </div>
              <div className="space-y-6 px-8">
                <div className="space-y-2">
                  <h3 className="text-white font-black text-2xl uppercase tracking-widest">Protocolo Emitido</h3>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold max-w-[280px] mx-auto leading-relaxed">
                    Sua credencial foi revogada. Use o código abaixo para validar o novo titular.
                  </p>
                </div>
                
                <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] space-y-3 shadow-2xl">
                   <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">Código de Segurança</p>
                   <p className="text-4xl font-mono font-black text-white tracking-[0.4em]">{transferCode}</p>
                </div>

                <div className="flex flex-col items-center gap-4 pt-6">
                   <div className="flex items-center gap-3">
                     <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                     <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Encerrando Sessão de Elite...</p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDITOR DE IMAGEM */}
      <Dialog open={!!editorState} onOpenChange={(open) => { if(!open) setEditorState(null); }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-w-md p-6 z-[300] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Ajuste de Imagem</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Enquadre sua nova identidade.</DialogDescription>
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
