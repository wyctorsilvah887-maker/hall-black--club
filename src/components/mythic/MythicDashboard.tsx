
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollarIcon, RubyShield } from "./MythicIcons";
import { User, ShieldCheck, Heart, PlusCircle, Crown, Gem, Phone, LogOut, Settings, ExternalLink, Loader2, PawPrint, Trash2, Camera, MapPin, Pencil, Stethoscope, Siren, AlertCircle, Users, Trophy, ChevronRight, Activity, ArrowRightLeft, ShieldAlert, MailCheck } from "lucide-react";
import Image from "next/image";
import { useCollection, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/image-utils';
import { ImageEditor } from './ImageEditor';
import { RankBadge } from './MythicIcons';
import { ToastAction } from "@/components/ui/toast";
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { sendTransferConfirmationEmail } from '@/app/actions';

interface MythicDashboardProps {
  profile: any;
}

export function MythicDashboard({ profile }: MythicDashboardProps) {
  const db = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editPetFileInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isEditPetOpen, setIsEditPetOpen] = useState(false);
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const globalUsersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'users');
  }, [db]);
  const { data: allUsersData } = useCollection(globalUsersQuery);
  const memberCount = allUsersData?.length || 0;
  
  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    image: string;
    target: 'profile' | 'newPet' | 'editPet';
  } | null>(null);

  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('');
  const [newPetPhoto, setNewPetPhoto] = useState<string | null>(null);

  const [editPetName, setEditPetName] = useState('');
  const [editPetSpecies, setEditPetSpecies] = useState('');
  const [editPetPhoto, setEditPetPhoto] = useState<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settingsName, setSettingsName] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsCity, setSettingsCity] = useState('');
  const [settingsState, setSettingsState] = useState('');
  const [settingsPhoto, setSettingsPhoto] = useState<string | null>(null);

  const [transferEmail, setTransferEmail] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProtocolStatus, setTransferProtocolStatus] = useState<'idle' | 'initiating' | 'done'>('idle');

  useEffect(() => {
    if (profile && isSettingsOpen) {
      setSettingsName(profile.name || '');
      setSettingsPhone(profile.emergencyContact || '');
      setSettingsCity(profile.city || '');
      setSettingsState(profile.state || '');
      setSettingsPhoto(profile.photo || null);
    }
  }, [profile, isSettingsOpen]);

  const petsQuery = useMemoFirebase(() => {
    if (!profile?.id) return null;
    return collection(db, 'users', profile.id, 'pets');
  }, [db, profile?.id]);

  const { data: petsData, isLoading: isPetsLoading } = useCollection(petsQuery);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | 'newPet' | 'editPet') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setEditorState({
        isOpen: true,
        image: reader.result as string,
        target
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleEditorConfirm = async (croppedImage: string) => {
    if (!editorState) return;
    const currentTarget = editorState.target;
    
    try {
      const compressed = await compressImage(croppedImage);
      if (currentTarget === 'profile') setSettingsPhoto(compressed);
      if (currentTarget === 'newPet') setNewPetPhoto(compressed);
      if (currentTarget === 'editPet') setEditPetPhoto(compressed);
      
      setEditorState(null);
      toast({
        title: "IMAGEM PROCESSADA",
        description: "A foto foi ajustada e otimizada com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "ERRO NO PROCESSAMENTO",
        description: "Falha ao otimizar a imagem editada.",
      });
      setEditorState(null);
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName || !newPetSpecies || !profile?.id) return;

    setIsSubmitting(true);
    try {
      const petsRef = collection(db, 'users', profile.id, 'pets');
      addDocumentNonBlocking(petsRef, {
        userId: profile.id,
        name: newPetName,
        species: newPetSpecies,
        photo: newPetPhoto,
        registrationDateTime: new Date().toISOString(),
        isEmergencyActive: false,
      });

      toast({
        title: "PET REGISTRADO",
        description: `${newPetName.toUpperCase()} AGORA FAZ PARTE DA ELITE.`,
        action: (
          <ToastAction altText="Recarregar" onClick={() => window.location.reload()}>
            RECARREGAR
          </ToastAction>
        ),
      });

      setNewPetName('');
      setNewPetSpecies('');
      setNewPetPhoto(null);
      setIsAddPetOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "ERRO AO SALVAR", description: "Não foi possível registrar o pet." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditPet = (pet: any) => {
    setEditingPet(pet);
    setEditPetName(pet.name);
    setEditPetSpecies(pet.species);
    setEditPetPhoto(pet.photo);
    setIsEditPetOpen(true);
  };

  const handleUpdatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPet || !profile?.id) return;

    setIsSubmitting(true);
    try {
      const petRef = doc(db, 'users', profile.id, 'pets', editingPet.id);
      updateDocumentNonBlocking(petRef, {
        name: editPetName,
        species: editPetSpecies,
        photo: editPetPhoto
      });

      toast({
        title: "IDENTIDADE ATUALIZADA",
        description: `AS CREDENCIAIS DE ${editPetName.toUpperCase()} FORAM SINCRONIZADAS. RECARREGUE PARA ATUALIZAR.`,
        action: (
          <ToastAction altText="Recarregar" onClick={() => window.location.reload()}>
            RECARREGAR
          </ToastAction>
        ),
      });

      setIsEditPetOpen(false);
      setEditingPet(null);
    } catch (err) {
      toast({ variant: "destructive", title: "ERRO NA ATUALIZAÇÃO", description: "Falha ao sincronizar dados do pet." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

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
        description: "SUAS CREDENCIAIS FORAM SINCRONIZADAS. RECARREGUE PARA ATUALIZAR A INTERFACE.",
        action: (
          <ToastAction altText="Recarregar" onClick={() => window.location.reload()}>
            RECARREGAR
          </ToastAction>
        ),
      });

      setIsSettingsOpen(false);
    } catch (err) {
      toast({ variant: "destructive", title: "ERRO AO SALVAR", description: "Falha ao atualizar perfil." });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleDeletePet = (petId: string, petName: string) => {
    if (!profile?.id) return;
    const petRef = doc(db, 'users', profile.id, 'pets', petId);
    deleteDocumentNonBlocking(petRef);
    toast({ 
      title: "PET REMOVIDO", 
      description: `${petName.toUpperCase()} FOI RETIRADO DA LINHAGEM.`,
      action: (
        <ToastAction altText="Recarregar" onClick={() => window.location.reload()}>
          RECARREGAR
        </ToastAction>
      ),
    });
  };

  const handleToggleEmergency = (pet: any) => {
    if (!profile?.id) return;
    const petRef = doc(db, 'users', profile.id, 'pets', pet.id);
    const newState = !pet.isEmergencyActive;
    
    updateDocumentNonBlocking(petRef, {
      isEmergencyActive: newState
    });

    toast({
      variant: newState ? "destructive" : "default",
      title: newState ? "SOS ATIVADO" : "SOS DESATIVADO",
      description: newState 
        ? `PROTOCOLO DE EMERGÊNCIA INICIADO PARA ${pet.name.toUpperCase()}.`
        : `SITUAÇÃO NORMALIZADA PARA ${pet.name.toUpperCase()}.`,
      action: (
        <ToastAction altText="Recarregar" onClick={() => window.location.reload()}>
          RECARREGAR
        </ToastAction>
      ),
    });
  };

  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferEmail || !profile?.id || !db) return;

    setIsTransferring(true);
    setTransferProtocolStatus('initiating');
    
    const confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // 1. Registro oficial da transferência no Firestore
      const requestsRef = collection(db, 'transferRequests');
      addDocumentNonBlocking(requestsRef, {
        fromUserId: profile.id,
        fromUserName: profile.name,
        fromUserEmail: profile.email,
        toUserEmail: transferEmail,
        confirmationCode,
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      // 2. Acionamento do Fluxo de IA para envio de e-mail de confirmação
      await sendTransferConfirmationEmail({
        fromName: profile.name,
        fromEmail: profile.email,
        toEmail: transferEmail,
        confirmationCode,
        statusRank: profile.status || 'MYTHIC'
      });

      setTransferProtocolStatus('done');
      
      toast({
        variant: "destructive",
        title: "PROTOCOLO DE SEGURANÇA INICIADO",
        description: "Um e-mail de confirmação foi enviado. O acesso será encerrado por segurança.",
      });
      
      // Logout forçado após 5 segundos
      setTimeout(() => {
        signOut(auth);
      }, 5000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "ERRO NO PROTOCOLO",
        description: "Falha ao registrar a solicitação no ecossistema.",
      });
      setIsTransferring(false);
      setTransferProtocolStatus('idle');
    }
  };

  const isLegendary = profile.status === 'LEGENDARY';
  const isAmber = profile.status === 'AMBER';
  const themeColorClass = isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary';
  const themeBadgeStyle = isLegendary ? 'border-yellow-500/50 bg-yellow-500/20 text-yellow-500 animate-gold-glow' : 
                          isAmber ? 'border-orange-500/50 bg-orange-500/20 text-orange-500 animate-amber-glow' : 
                          'border-primary/50 bg-primary/10 text-primary';

  const memberRegistrationId = `HB-${profile.id?.slice(0, 5).toUpperCase() || 'XXXXX'}`;

  return (
    <div className="min-h-screen bg-black text-white animate-in fade-in duration-1000 overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <Crown className={cn("w-5 h-5 md:w-6 md:h-6", themeColorClass)} />
             <h2 className={`text-sm sm:text-lg md:text-2xl font-black font-headline uppercase tracking-tighter 
              ${isLegendary ? 'gold-gradient-text' : isAmber ? 'amber-gradient-text' : 'text-primary'}`}>
              {isLegendary ? 'HALL BLACK LENDÁRIO' : isAmber ? 'HALL BLACK LEGENDÁRIO' : 'HALL BLACK'}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-900 bg-zinc-950/50">
              <Users className={`w-3 h-3 ${themeColorClass}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {memberCount.toString().padStart(2, '0')} / 60
              </span>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddPetOpen(true)}
              className="h-8 md:h-9 rounded-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-1.5 md:gap-2 px-3 md:px-4 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider hidden sm:inline">Novo Pet</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center border-2 transition-all bg-zinc-900/80 outline-none overflow-hidden
                  ${isLegendary ? 'border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 
                    isAmber ? 'border-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 
                    'border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]'}`}>
                  {profile.photo ? (
                    <Image src={profile.photo} alt={profile.name} width={44} height={44} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <User className={`w-3.5 h-3.5 md:w-5 md:h-5 ${themeColorClass}`} />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-300">
                <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-zinc-500 px-3 pt-3">Conta Elite</DropdownMenuLabel>
                <div className="px-3 pb-3">
                  <p className="font-bold text-sm text-white truncate">{profile.name}</p>
                  <p className={`text-[9px] font-black uppercase tracking-tighter ${themeColorClass}`}>
                    REGISTRO: {memberRegistrationId}
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsSettingsOpen(true);
                  }}
                  className="focus:bg-zinc-900 focus:text-white cursor-pointer py-2.5"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-zinc-900 focus:text-white cursor-pointer py-2.5">
                  <Link href={`/profile/${profile.id}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Ver Perfil Público</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={() => signOut(auth)} className="focus:bg-red-950/30 focus:text-red-500 text-red-600 cursor-pointer py-2.5">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Encerrar Sessão</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8 md:pb-12">
          <div className="space-y-1">
            <p className="text-zinc-500 text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-bold">Bem-vindo ao Elite</p>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight uppercase leading-none break-words max-w-2xl">{profile.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {(profile.city || profile.state) && (
                <div className="flex items-center gap-2 text-zinc-500">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{profile.city}{profile.city && profile.state ? ', ' : ''}{profile.state}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-600">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">REGISTRO: {memberRegistrationId}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={`py-2 px-5 flex items-center gap-2 rounded-full font-bold tracking-widest text-[10px] md:text-xs w-full sm:w-fit justify-center ${themeBadgeStyle}`}>
            {isLegendary ? <Crown className="w-3.5 h-3.5 md:w-4 md:h-4" /> : isAmber ? <Gem className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <CollarIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            {isLegendary ? 'ACREDITAÇÃO LENDÁRIA' : isAmber ? 'STATUS LEGENDÁRIO' : 'MEMBRO MÍTICO'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button 
            onClick={() => setIsHealthDialogOpen(true)}
            className={`w-full h-14 md:h-20 text-xs sm:text-sm md:text-xl font-black tracking-[0.2em] uppercase rounded-2xl group transition-all duration-500
              ${isLegendary ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 hover:scale-[1.01] shadow-yellow-500/20' : 
                isAmber ? 'bg-gradient-to-r from-orange-600 to-orange-400 hover:scale-[1.01] shadow-orange-500/20' : 
                'bg-gradient-to-r from-red-800 to-primary hover:scale-[1.01] shadow-primary/20'}`}
          >
            <Stethoscope className="w-5 h-5 md:w-8 md:h-8 mr-3 md:mr-4 group-hover:rotate-12 transition-transform" />
            SAÚDE MUNDO PET
          </Button>

          <Card className="bg-zinc-950/40 border-zinc-900 border-dashed rounded-2xl flex items-center justify-between px-8">
            <div className="space-y-1">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Censo de Elite</p>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Membros Ativos</h3>
            </div>
            <div className="text-right">
              <p className={`text-4xl font-black tracking-tighter ${themeColorClass}`}>
                {memberCount.toString().padStart(2, '0')} <span className="text-zinc-800 text-xl">/ 60</span>
              </p>
              <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">Slots de Rede Mundial</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className={`bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl relative overflow-hidden group 
              ${isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : ''}`}>
              <div className={`absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-30 transition-opacity rotate-12 pointer-events-none ${themeColorClass}`}>
                {isLegendary ? <Crown className="w-16 h-16 md:w-24 md:h-24" /> : isAmber ? <Gem className="w-16 h-16 md:w-24 md:h-24" /> : <RubyShield className="w-16 h-16 md:w-24 md:h-24" />}
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl tracking-tight">
                  <ShieldCheck className={`w-4 h-4 md:w-5 md:h-5 ${themeColorClass}`} />
                  Credencial de Membro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="flex flex-col items-center justify-center py-4">
                  <RankBadge status={profile.status} id={profile.id} regNumber={profile.memberNumber} />
                </div>

                <div className="flex items-center gap-4 p-4 md:p-5 rounded-xl bg-black/60 border border-zinc-800/50">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-800 relative flex-shrink-0">
                    {profile.photo ? <Image src={profile.photo} alt={profile.name} fill className="object-cover" unoptimized /> : <User className="w-full h-full p-2 text-zinc-700" />}
                  </div>
                  <div className="text-sm space-y-0.5 min-w-0">
                    <p className="text-zinc-500 uppercase text-[8px] md:text-[10px] tracking-widest font-semibold">Titular da Conta</p>
                    <p className="font-bold text-base md:text-xl truncate">{profile.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-zinc-800/30">
                    <div className="text-sm min-w-0">
                      <p className="text-zinc-500 uppercase text-[8px] md:text-[9px] tracking-widest font-semibold">Nº Registro</p>
                      <p className="font-mono text-white text-[11px] sm:text-sm font-black">{memberRegistrationId}</p>
                    </div>
                  </div>

                  {profile.emergencyContact && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-zinc-800/30">
                      <Phone className={`w-4 h-4 flex-shrink-0 ${themeColorClass}`} />
                      <div className="text-sm min-w-0">
                        <p className="text-zinc-500 uppercase text-[8px] md:text-[9px] tracking-widest font-semibold">Contato Emergencial</p>
                        <p className="font-mono text-white text-[11px] sm:text-sm">{profile.emergencyContact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className={`bg-zinc-900/40 border-zinc-800/50 overflow-hidden group relative flex flex-col ${isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : ''}`}>
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl tracking-tight uppercase">
                  <PawPrint className={`w-4 h-4 md:w-5 md:h-5 ${themeColorClass}`} />
                  Seus Pets de Elite
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {isPetsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-800" />
                  </div>
                ) : !petsData || petsData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-40">
                    <CollarIcon className="w-12 h-12 text-zinc-700" />
                    <p className="text-[10px] uppercase tracking-widest font-bold max-w-[150px]">Nenhum pet registrado na sua linhagem.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {petsData.map((pet) => (
                      <div key={pet.id} className={`flex items-center justify-between p-3 rounded-xl bg-black/60 border group/item transition-all duration-300
                        ${pet.isEmergencyActive ? 'border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-zinc-800/50 hover:border-zinc-700'}`}>
                        <Link href={`/pet/${profile.id}/${pet.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg border border-zinc-800 overflow-hidden relative flex-shrink-0
                            ${pet.isEmergencyActive ? 'border-red-600' : isLegendary ? 'group-hover/item:border-yellow-500/30' : isAmber ? 'group-hover/item:border-orange-500/30' : 'group-hover/item:border-primary/30'}`}>
                            {pet.photo ? (
                              <Image src={pet.photo} alt={pet.name} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${themeColorClass}`} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-black text-xs sm:text-sm uppercase tracking-tighter truncate">{pet.name}</p>
                            <p className="text-zinc-500 text-[8px] sm:text-[10px] uppercase tracking-widest truncate">{pet.species}</p>
                          </div>
                        </Link>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className={`h-8 w-8 transition-all ${pet.isEmergencyActive ? 'text-red-500 bg-red-950/20' : 'text-zinc-700 hover:text-red-500'}`}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleEmergency(pet); }}
                          >
                            <Siren className={`w-3.5 h-3.5 ${pet.isEmergencyActive ? 'animate-pulse' : ''}`} />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-zinc-700 hover:text-primary"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenEditPet(pet); }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-zinc-700 hover:text-red-500 hover:bg-red-950/20"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeletePet(pet.id, pet.name); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={() => setIsAddPetOpen(true)} className={`w-full h-11 md:h-12 text-xs font-bold transition-all mt-4 ${isLegendary ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : isAmber ? 'bg-orange-500 hover:bg-orange-400 text-black' : 'bg-primary hover:bg-accent text-white'}`}>
                  <PlusCircle className="w-4 h-4 mr-2" /> ADICIONAR NOVO PET
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* DIÁLOGO SAÚDE MUNDO PET */}
      <Dialog open={isHealthDialogOpen} onOpenChange={setIsHealthDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-w-md rounded-3xl overflow-hidden p-0 z-[200]">
          <div className={`absolute top-0 inset-x-0 h-1.5 ${isLegendary ? 'bg-yellow-500' : isAmber ? 'bg-orange-500' : 'bg-primary'}`} />
          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-2xl bg-black border ${isLegendary ? 'border-yellow-500/30' : isAmber ? 'border-orange-500/30' : 'border-primary/30'}`}>
                <Activity className={`w-10 h-10 ${themeColorClass} animate-pulse`} />
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-center">Protocolos de Saúde</DialogTitle>
                <DialogDescription className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold text-center pt-1">Ecossistema Hall Black Elite</DialogDescription>
              </DialogHeader>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
              <p className="text-zinc-400 text-xs leading-relaxed text-center font-medium">
                Para acessar os <span className="text-white font-bold">serviços, prontuario digital e gestão de pet entre outros beneficios do mundo pet.</span>, você e seu pet precisam estar devidamente registrados no ecossistema Mundo Pet.
              </p>
              <div className="h-px w-full bg-zinc-800/50" />
              <p className="text-zinc-500 text-[10px] text-center uppercase tracking-widest font-black italic">
                A saúde da linhagem é nossa prioridade absoluta.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setIsHealthDialogOpen(false)}
                variant="ghost" 
                className="flex-1 h-14 rounded-2xl border border-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white"
              >
                Agora não
              </Button>
              <Button 
                onClick={() => {
                  window.location.href = 'https://mundopet-wsstudios.online/signup';
                  setIsHealthDialogOpen(false);
                }}
                className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl ${isLegendary ? 'bg-yellow-500 text-black hover:bg-yellow-400' : isAmber ? 'bg-orange-500 text-black hover:bg-orange-400' : 'bg-primary text-white hover:bg-accent'}`}
              >
                Cadastrar Agora
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adicionar Pet Modal e outros diálogos... */}
      <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-sm rounded-2xl z-[200]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Registrar Novo Pet</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest">Adicione uma nova identidade à sua linhagem.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPet} className="space-y-6 pt-4">
            <div className="flex flex-col items-center gap-3">
              <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden relative group">
                {newPetPhoto ? <Image src={newPetPhoto} alt="Preview" fill className="object-cover" unoptimized /> : <div className="flex flex-col items-center gap-1 text-zinc-600"><Camera className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Foto</span></div>}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'newPet')} />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Nome do Pet</Label>
                <Input placeholder="EX: THOR" className="bg-black/50 border-zinc-800 font-bold uppercase h-11" value={newPetName} onChange={(e) => setNewPetName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Espécie / Raça</Label>
                <Input placeholder="EX: DOBERMAN" className="bg-black/50 border-zinc-800 font-bold uppercase h-11" value={newPetSpecies} onChange={(e) => setNewPetSpecies(e.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className={`w-full h-12 font-black uppercase tracking-widest ${isLegendary ? 'bg-yellow-500 text-black' : isAmber ? 'bg-orange-500 text-black' : 'bg-primary'}`} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Registro'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editar Pet Modal */}
      <Dialog open={isEditPetOpen} onOpenChange={(open) => { setIsEditPetOpen(open); if(!open) setEditingPet(null); }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-w-sm rounded-2xl z-[200]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Editar Identidade</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest">Atualize as credenciais do seu pet.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePet} className="space-y-6 pt-4">
            <div className="flex flex-col items-center gap-3">
              <div onClick={() => editPetFileInputRef.current?.click()} className="w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden relative group">
                {editPetPhoto ? <Image src={editPetPhoto} alt="Preview" fill className="object-cover" unoptimized /> : <div className="flex flex-col items-center gap-1 text-zinc-600"><Camera className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Foto</span></div>}
              </div>
              <input type="file" ref={editPetFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'editPet')} />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Nome do Pet</Label>
                <Input className="bg-black/50 border-zinc-800 font-bold uppercase h-11" value={editPetName} onChange={(e) => setEditPetName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Espécie / Raça</Label>
                <Input className="bg-black/50 border-zinc-800 font-bold uppercase h-11" value={editPetSpecies} onChange={(e) => setEditPetSpecies(e.target.value)} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className={`w-full h-12 font-black uppercase tracking-widest ${isLegendary ? 'bg-yellow-500 text-black' : isAmber ? 'bg-orange-500 text-black' : 'bg-primary'}`} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sincronizar Dados'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Configurações Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-w-md rounded-2xl z-[200] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Configurações de Elite</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest">Gerencie suas credenciais e identidade mística.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSettings} className="space-y-6 pt-4">
            <div className="flex flex-col items-center gap-3">
              <div 
                onClick={() => profilePicInputRef.current?.click()} 
                className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden relative group"
              >
                {settingsPhoto ? (
                  <Image src={settingsPhoto} alt="Profile" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-zinc-600">
                    <User className="w-8 h-8" />
                    <span className="text-[8px] font-black uppercase">Foto</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input type="file" ref={profilePicInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Nome Completo</Label>
                <Input className="bg-black/50 border-zinc-800 h-11" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Contato de Emergência</Label>
                <Input className="bg-black/50 border-zinc-800 h-11" value={settingsPhone} onChange={(e) => setSettingsPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Cidade</Label>
                <Input className="bg-black/50 border-zinc-800 h-11" value={settingsCity} onChange={(e) => setSettingsCity(e.target.value)} placeholder="Ex: São Paulo" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Estado</Label>
                <Input className="bg-black/50 border-zinc-800 h-11" value={settingsState} onChange={(e) => setSettingsState(e.target.value)} placeholder="Ex: SP" />
              </div>
            </div>

            <Button type="submit" className={`w-full h-12 font-black uppercase tracking-widest ${isLegendary ? 'bg-yellow-500 text-black' : isAmber ? 'bg-orange-500 text-black' : 'bg-primary'}`} disabled={isUpdatingSettings}>
              {isUpdatingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
            </Button>
            
            <Separator className="bg-zinc-900" />
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-zinc-500">
                <ArrowRightLeft className={cn("w-4 h-4", themeColorClass)} />
                <h3 className="text-xs font-black uppercase tracking-widest">Protocolo de Transferência</h3>
              </div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest leading-relaxed">
                Deseja transferir sua titularidade para outro membro? Este processo requer validação de segurança e é permanente.
              </p>
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsTransferOpen(true);
                }}
                className="w-full h-12 rounded-xl border-zinc-800 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest"
              >
                Solicitar Transferência de Credencial
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transferência Modal */}
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
                : 'Inicie a transferência permanente de sua credencial de elite para um novo guardião.'}
            </DialogDescription>
          </DialogHeader>
          
          {transferProtocolStatus !== 'done' ? (
            <form onSubmit={handleInitiateTransfer} className="space-y-6 pt-4">
              <div className="bg-red-950/10 border border-red-900/30 p-4 rounded-xl space-y-2">
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" /> Atenção
                </p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Ao finalizar, um e-mail de confirmação será enviado para você. Você perderá acesso imediato a todos os privilégios Hall Black.
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
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full border-4 border-red-600 flex items-center justify-center animate-pulse">
                <MailCheck className="w-8 h-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-black uppercase tracking-widest">E-mail de Confirmação Enviado</h3>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest max-w-[200px] mx-auto">Sua identidade está sendo removida por segurança...</p>
              </div>
              <Loader2 className="w-6 h-6 animate-spin text-zinc-800" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Editor de Imagem Modal */}
      <Dialog open={!!editorState} onOpenChange={(open) => { if(!open) setEditorState(null); }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white w-[95vw] max-w-md p-6 z-[300] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Ajuste de Imagem</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest">Configure o enquadramento perfeito para a elite.</DialogDescription>
          </DialogHeader>
          {editorState && (
            <ImageEditor 
              image={editorState.image}
              cropShape={editorState.target === 'profile' ? 'round' : 'rect'}
              onCancel={() => setEditorState(null)}
              onConfirm={handleEditorConfirm}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
