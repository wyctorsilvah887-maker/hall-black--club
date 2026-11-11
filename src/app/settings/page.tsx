"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, collection, increment } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Camera, ShieldAlert, ArrowRightLeft, Loader2, ShieldX, ShieldCheck, ChevronRight, X, MapPin, AlignLeft, Phone, UserCircle, Medal, CreditCard, Sparkles, LayoutDashboard } from "lucide-react";
import Link from 'next/link';
import NextImage from 'next/image';
import { compressImage } from '@/lib/image-utils';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ImageEditor } from '@/components/mythic/ImageEditor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { sendTransferConfirmationEmail } from '@/app/actions';
import { signOut } from 'firebase/auth';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';
import { EliteLoader } from '@/components/mythic/EliteLoader';
import { useRouter } from 'next/navigation';

/**
 * @fileOverview Página de configurações de elite do Sovereign Founders Club.
 * Sincronizado com atraso proposital para imersão de elite.
 */

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isForcedLoading, setIsForcedLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsForcedLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);
  
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
  const [showBio, setShowBio] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showJoinDate, setShowJoinDate] = useState(true);
  
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
      setShowBio(profile.showBio ?? true);
      setShowLocation(profile.showLocation ?? true);
      setShowJoinDate(profile.showJoinDate ?? true);
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
      toast({ title: "FOTO ATUALIZADA", description: "Seu retrato foi processado." });
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
      toast({ title: "PERFIL SINCRONIZADO", description: "Credenciais salvas com sucesso." });
      setIsProfileEditOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "ERRO", description: "Falha ao sincronizar." });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleTogglePrivacyField = (field: string, value: boolean) => {
    if (!profile?.id || !db) return;

    const userRef = doc(db, 'users', profile.id);
    const updates = { [field]: value };

    if (field === 'isPublicProfile') {
      setIsPublic(value);
    } else if (field === 'showBio') {
      setShowBio(value);
    } else if (field === 'showLocation') {
      setShowLocation(value);
    } else if (field === 'showJoinDate') {
      setShowJoinDate(value);
    }

    updateDocumentNonBlocking(userRef, updates);
    toast({ 
      title: "PRIVACIDADE", 
      description: field === 'isPublicProfile' 
        ? (value ? "Seu perfil agora está visível na rede." : "Seu perfil foi colocado sob sigilo.")
        : "Preferências de visibilidade atualizadas." 
    });
  };

  const handleSimulatePayment = () => {
    if (!profile?.id || !db) return;
    const userRef = doc(db, 'users', profile.id);
    updateDocumentNonBlocking(userRef, { 
      eliteScore: increment(100)
    });
    toast({ 
      title: "PRESTÍGIO ADQUIRIDO", 
      description: "+100 Pontos de Elite adicionados à sua linhagem.",
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
      toast({ variant: "destructive", title: "REVOGAÇÃO EM CURSO", description: "Sua identidade será encerrada." });
      setTimeout(async () => {
        await signOut(auth);
        router.push('/');
      }, 10000);
    } catch (err) {
      toast({ variant: "destructive", title: "ERRO", description: "Falha no protocolo de cessão." });
      setIsTransferring(false);
      setTransferProtocolStatus('idle');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading || isProfileLoading || isForcedLoading) {
    return <EliteLoader />;
  }

  const currentRank = calculateRankByTime(profile?.registrationDateTime, profile?.status);
  const themeClass = getThemeClass(currentRank);
  
  const themeColor = 
    currentRank === 'HALL_BLACK' ? 'text-white' : 
    currentRank === 'MYTHIC' ? 'text-primary' :
    currentRank === 'AMBER' ? 'text-orange-500' :
    currentRank === 'LEGENDARY' ? 'text-yellow-500' :
    currentRank === 'ELITE' ? 'text-zinc-400' : 'text-orange-900';

  const themeBorder = 
    currentRank === 'HALL_BLACK' ? 'border-zinc-800' : 
    currentRank === 'MYTHIC' ? 'border-primary/30' :
    currentRank === 'AMBER' ? 'border-orange-500/30' :
    currentRank === 'LEGENDARY' ? 'border-yellow-500/30' :
    currentRank === 'ELITE' ? 'border-zinc-400/30' : 'border-orange-900/30';

  return (
    <main className={cn("min-h-screen bg-black text-white selection:bg-primary/30 animate-in fade-in duration-700", themeClass)}>
      <div className="max-w-xl mx-auto">
        
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl py-5 px-4 flex items-center justify-between border-b border-zinc-900/50">
          <Link href="/hub" className="p-2 -ml-3 hover:bg-zinc-900/50 rounded-full transition-colors active:scale-95">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Configurações</h1>
          <div className="w-10" />
        </header>

        <div className="py-6 space-y-10">
          
          <section>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-5 mb-4">Minha Conta</p>
            <div className="bg-zinc-950/40 border-y border-zinc-900/60 divide-y divide-zinc-900/40">
              <button 
                onClick={() => setIsProfileEditOpen(true)}
                className="w-full flex items-center justify-between px-5 py-5 group active:bg-zinc-900/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl bg-black border", themeBorder)}>
                    <User className={cn("w-4 h-4", themeColor)} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase tracking-widest">Perfil</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">{settingsName || 'Configurar'}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-800" />
              </button>

              <button 
                onClick={handleSimulatePayment}
                className="w-full flex items-center justify-between px-5 py-5 group active:bg-zinc-900/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl bg-black border", themeBorder)}>
                    <CreditCard className={cn("w-4 h-4", themeColor)} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase tracking-widest">Contribuir para a Linhagem</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Acumular 100 pontos de elite</p>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </button>

              <Link 
                href="/debug/badges"
                className="w-full flex items-center justify-between px-5 py-5 group active:bg-zinc-900/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl bg-black border", themeBorder)}>
                    <Medal className={cn("w-4 h-4", themeColor)} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase tracking-widest">Protocolo de Patentes</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Ver hierarquia de elite</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-800" />
              </Link>
            </div>
          </section>

          <section>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-5 mb-4">Privacidade de Elite</p>
            <div className="bg-zinc-950/40 border-y border-zinc-900/60 divide-y divide-zinc-900/40">
              <div className="flex items-center justify-between px-5 py-5">
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest">Perfil Público</p>
                  <p className="text-[9px] text-zinc-600 uppercase font-bold">Visibilidade global na rede</p>
                </div>
                <Switch checked={isPublic} onCheckedChange={(val) => handleTogglePrivacyField('isPublicProfile', val)} />
              </div>
              
              <div className={cn("flex items-center justify-between px-5 py-5 transition-opacity", !isPublic && "opacity-50")}>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest">Cidade e Estado no perfil</p>
                </div>
                <Switch 
                  disabled={!isPublic}
                  checked={showLocation} 
                  onCheckedChange={(val) => handleTogglePrivacyField('showLocation', val)} 
                />
              </div>

              <div className={cn("flex items-center justify-between px-5 py-5 transition-opacity", !isPublic && "opacity-50")}>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest">Exibir Biografia</p>
                  <p className="text-[9px] text-zinc-600 uppercase font-bold">Sua trajetória no clube</p>
                </div>
                <Switch 
                  disabled={!isPublic}
                  checked={showBio} 
                  onCheckedChange={(val) => handleTogglePrivacyField('showBio', val)} 
                />
              </div>

              <div className={cn("flex items-center justify-between px-5 py-5 transition-opacity", !isPublic && "opacity-50")}>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest">Exibir Admissão</p>
                  <p className="text-[9px] text-zinc-600 uppercase font-bold">Ano de entrada na elite</p>
                </div>
                <Switch 
                  disabled={!isPublic}
                  checked={showJoinDate} 
                  onCheckedChange={(val) => handleTogglePrivacyField('showJoinDate', val)} 
                />
              </div>
            </div>
          </section>

          <section>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-5 mb-4">Gestão e Segurança</p>
            <div className="bg-zinc-950/40 border-y border-zinc-900/60 divide-y divide-zinc-900/40">
              {profile?.role === 'admin' && (
                <Link 
                  href="/staff"
                  className="w-full flex items-center justify-between px-5 py-5 active:bg-zinc-900/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-black border border-primary/30">
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-primary">Terminal Staff</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-800" />
                </Link>
              )}

              <button 
                onClick={() => setIsTransferOpen(true)}
                className="w-full flex items-center justify-between px-5 py-5 active:bg-red-950/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-black border border-red-900/30">
                    <ArrowRightLeft className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-red-600">Transferir Credencial</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-800" />
              </button>
              
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-between px-5 py-5 active:bg-zinc-900/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl bg-black border", themeBorder)}>
                    <ShieldCheck className="w-4 h-4 text-zinc-500" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-zinc-300">Encerrar Sessão</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-800" />
              </button>
            </div>
          </section>
        </div>

        <footer className="mt-12 py-12 border-t border-zinc-900/50 text-center opacity-20">
          <p className="text-[8px] font-black uppercase tracking-[0.8em]">Sovereign Founders Protocol v2.0</p>
        </footer>
      </div>

      <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
        <DialogContent className="bg-black border-none text-white w-full h-full max-w-none m-0 p-0 z-[200] flex flex-col overflow-hidden">
          <div className="sticky top-0 bg-black/90 backdrop-blur-xl z-50 px-5 py-5 flex items-center justify-between border-b border-zinc-900/60">
            <button onClick={() => setIsProfileEditOpen(false)} className="p-2 -ml-2 active:scale-95">
              <X className="w-6 h-6 text-zinc-500" />
            </button>
            <DialogTitle className="text-[11px] font-black uppercase tracking-[0.3em]">Editar Perfil</DialogTitle>
            <button 
              onClick={handleUpdateSettings}
              disabled={isUpdatingSettings}
              className={cn("text-[11px] font-black uppercase tracking-widest px-2", themeColor, isUpdatingSettings && 'opacity-50')}
            >
              {isUpdatingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-8 pb-20 space-y-10">
            <DialogDescription className="sr-only">Formulário de edição de credencial elite.</DialogDescription>
            
            <div className="flex flex-col items-center gap-5">
              <div 
                onClick={() => profilePicInputRef.current?.click()}
                className={cn("w-36 h-36 rounded-full border-4 overflow-hidden relative group cursor-pointer shadow-2xl active:scale-95 transition-transform", themeBorder)}
              >
                {settingsPhoto ? (
                  <NextImage src={settingsPhoto} alt="Profile" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                    <UserCircle className="w-16 h-16 text-zinc-800" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white/70" />
                </div>
              </div>
              <input type="file" ref={profilePicInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="space-y-8 max-w-md mx-auto">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Nome Completo
                </Label>
                <input 
                  value={settingsName || ''} 
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="bg-zinc-950/50 border-zinc-900/80 h-14 rounded-xl font-bold uppercase focus-visible:ring-primary/40 text-sm px-4 w-full outline-none"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <AlignLeft className="w-3.5 h-3.5" /> Biografia
                </Label>
                <Textarea 
                  value={settingsBio || ''} 
                  onChange={(e) => setSettingsBio(e.target.value)}
                  placeholder="Defina sua identidade na rede..."
                  className="bg-zinc-950/50 border-zinc-900/80 min-h-[120px] rounded-xl font-medium focus-visible:ring-primary/40 text-sm resize-none p-4"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> WhatsApp de Elite
                </Label>
                <Input 
                  value={settingsPhone || ''} 
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  className="bg-zinc-950/50 border-zinc-900/80 h-14 rounded-xl font-mono focus-visible:ring-primary/40 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2 space-y-3">
                  <Label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Cidade
                  </Label>
                  <Input 
                    value={settingsCity || ''} 
                    onChange={(e) => setSettingsCity(e.target.value)}
                    className="bg-zinc-950/50 border-zinc-900/80 h-14 rounded-xl font-bold uppercase focus-visible:ring-primary/40 text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">UF</Label>
                  <Input 
                    value={settingsState || ''} 
                    maxLength={2}
                    onChange={(e) => setSettingsState(e.target.value.toUpperCase())}
                    className="bg-zinc-950/50 border-zinc-900/80 h-14 rounded-xl font-bold uppercase text-center focus-visible:ring-primary/40 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900/80 text-white w-[95vw] max-w-sm rounded-[2rem] p-0 overflow-hidden shadow-2xl z-[250]">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-red-600" />
          {transferProtocolStatus !== 'done' ? (
            <div className="p-7 space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-[1.5rem] bg-red-950/20 border border-red-900/30">
                  <ShieldAlert className="w-10 h-10 text-red-600" />
                </div>
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-black uppercase tracking-tighter text-center">Protocolo de Cessão</DialogTitle>
                  <DialogDescription className="text-[9px] text-red-500 uppercase tracking-[0.2em] font-bold leading-relaxed text-center">
                    AÇÃO IRREVERSÍVEL: RESULTARÁ NA REVOGAÇÃO DA SUA IDENTIDADE.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <form onSubmit={handleInitiateTransfer} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold ml-1">E-mail do Novo Titular</Label>
                  <Input 
                    type="email" required 
                    placeholder="exemplo@sovereign.club"
                    className="bg-black/40 border-zinc-800 h-14 rounded-2xl text-sm font-bold"
                    value={transferEmail || ''}
                    onChange={(e) => setTransferEmail(e.target.value)}
                    disabled={isTransferring}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    type="submit" disabled={isTransferring || !transferEmail}
                    className="h-14 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-transform"
                  >
                    {isTransferring ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Transferência'}
                  </Button>
                  <Button variant="ghost" onClick={() => setIsTransferOpen(false)} className="h-12 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="py-16 px-8 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500">
              <ShieldX className="w-20 h-20 text-red-600 animate-pulse" />
              <div className="space-y-4">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-black uppercase tracking-widest">Acesso Revogado</DialogTitle>
                  <DialogDescription className="text-[9px] text-zinc-500 uppercase font-bold text-center leading-relaxed">
                    Sua identidade foi encerrada. O código abaixo deve ser entregue ao sucessor.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-7 bg-black/60 border border-zinc-900 rounded-[2rem]">
                   <p className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.5em] mb-3">Chave de Herança</p>
                   <p className="text-4xl font-mono font-black text-white tracking-[0.3em]">{transferCode}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editorState} onOpenChange={(open) => { if(!open) setEditorState(null); }}>
        <DialogContent className="bg-zinc-950 border-zinc-900/60 text-white w-[95vw] max-sm p-6 rounded-[2rem] z-[300]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tighter">Enquadramento</DialogTitle>
            <DialogDescription className="text-xs text-zinc-600 uppercase tracking-widest">Ajuste seu retrato de elite.</DialogDescription>
          </DialogHeader>
          {editorState && (
            <ImageEditor image={editorState.image} cropShape="round" onCancel={() => setEditorState(null)} onConfirm={handleEditorConfirm} />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
