
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollarIcon, RubyShield } from "./MythicIcons";
import { User, ShieldCheck, Heart, PlusCircle, Crown, Gem, Phone, LogOut, Settings, ExternalLink, Loader2, PawPrint, Trash2, Camera, MapPin, Pencil, Stethoscope } from "lucide-react";
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
  const [editingPet, setEditingPet] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Inicializa os campos de configurações apenas quando o modal abre ou o perfil carrega
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

    try {
      const compressed = await compressImage(file);
      if (target === 'profile') setSettingsPhoto(compressed);
      if (target === 'newPet') setNewPetPhoto(compressed);
      if (target === 'editPet') setEditPetPhoto(compressed);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "ERRO NA IMAGEM",
        description: "Não foi possível processar a foto.",
      });
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName || !newPetSpecies || !profile?.id) return;

    setIsSubmitting(true);
    const petsRef = collection(db, 'users', profile.id, 'pets');
    
    addDocumentNonBlocking(petsRef, {
      userId: profile.id,
      name: newPetName,
      species: newPetSpecies,
      photo: newPetPhoto,
      registrationDateTime: new Date().toISOString(),
    });

    toast({
      title: "PET REGISTRADO",
      description: `${newPetName.toUpperCase()} AGORA FAZ PARTE DA ELITE.`,
    });

    setNewPetName('');
    setNewPetSpecies('');
    setNewPetPhoto(null);
    setIsAddPetOpen(false);
    setIsSubmitting(false);
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
    const petRef = doc(db, 'users', profile.id, 'pets', editingPet.id);
    
    updateDocumentNonBlocking(petRef, {
      name: editPetName,
      species: editPetSpecies,
      photo: editPetPhoto
    });

    toast({
      title: "IDENTIDADE ATUALIZADA",
      description: `AS CREDENCIAIS DE ${editPetName.toUpperCase()} FORAM SINCRONIZADAS.`,
    });

    setIsEditPetOpen(false);
    setIsSubmitting(false);
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setIsUpdatingSettings(true);
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
      description: "Suas credenciais foram sincronizadas com sucesso.",
    });

    setIsUpdatingSettings(false);
    setIsSettingsOpen(false);
  };

  const handleDeletePet = (petId: string, petName: string) => {
    if (!profile?.id) return;
    const petRef = doc(db, 'users', profile.id, 'pets', petId);
    deleteDocumentNonBlocking(petRef);
    toast({ title: "PET REMOVIDO", description: `${petName.toUpperCase()} FOI RETIRADO DA LINHAGEM.` });
  };

  const isLegendary = profile.status === 'LEGENDARY';
  const isAmber = profile.status === 'AMBER';
  const themeColorClass = isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary';
  const themeBadgeStyle = isLegendary ? 'border-yellow-500/50 bg-yellow-500/20 text-yellow-500 animate-gold-glow' : 
                          isAmber ? 'border-orange-500/50 bg-orange-500/20 text-orange-500 animate-amber-glow' : 
                          'border-primary/50 bg-primary/10 text-primary';

  return (
    <div className={`min-h-screen bg-black text-white animate-in fade-in duration-1000 overflow-x-hidden`}>
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <h2 className={`text-base sm:text-xl md:text-2xl font-black font-headline uppercase tracking-tighter 
              ${isLegendary ? 'gold-gradient-text' : isAmber ? 'amber-gradient-text' : 'text-primary'}`}>
              {isLegendary ? 'HALL BLACK LENDÁRIO' : isAmber ? 'HALL BLACK LEGENDÁRIO' : 'HALL BLACK'}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsAddPetOpen(true)}
              className="h-9 rounded-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 px-4 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase tracking-wider hidden sm:inline">Novo Pet</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center border-2 transition-all bg-zinc-900/80 outline-none overflow-hidden
                  ${isLegendary ? 'border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 
                    isAmber ? 'border-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 
                    'border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]'}`}>
                  {profile.photo ? (
                    <Image src={profile.photo} alt={profile.name} width={44} height={44} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <User className={`w-4 h-4 md:w-5 md:h-5 ${themeColorClass}`} />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-300">
                <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-zinc-500 px-3 pt-3">Conta Elite</DropdownMenuLabel>
                <div className="px-3 pb-3">
                  <p className="font-bold text-sm text-white truncate">{profile.name}</p>
                  <p className={`text-[9px] font-black uppercase tracking-tighter ${themeColorClass}`}>
                    {isLegendary ? 'ACREDITAÇÃO LENDÁRIA' : isAmber ? 'STATUS LEGENDÁRIO' : 'MEMBRO MÍTICO'}
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="focus:bg-zinc-900 focus:text-white cursor-pointer py-2.5">
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
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight uppercase leading-none">{profile.name}</h1>
            {(profile.city || profile.state) && (
              <div className="flex items-center gap-2 text-zinc-500 mt-2">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{profile.city}{profile.city && profile.state ? ', ' : ''}{profile.state}</span>
              </div>
            )}
          </div>
          <Badge variant="outline" className={`py-2 px-5 flex items-center gap-2 rounded-full font-bold tracking-widest text-[10px] md:text-xs w-fit ${themeBadgeStyle}`}>
            {isLegendary ? <Crown className="w-4 h-4" /> : isAmber ? <Gem className="w-4 h-4" /> : <CollarIcon className="w-4 h-4" />}
            {isLegendary ? 'ACREDITAÇÃO LENDÁRIA' : isAmber ? 'STATUS LEGENDÁRIO' : 'MEMBRO MÍTICO'}
          </Badge>
        </div>

        {/* SAÚDE MUNDO PET CTA */}
        <div className="grid grid-cols-1 gap-6">
          <Button 
            className={`w-full h-16 md:h-20 text-sm md:text-xl font-black tracking-[0.2em] uppercase rounded-2xl group transition-all duration-500
              ${isLegendary ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 hover:scale-[1.01] shadow-yellow-500/20' : 
                isAmber ? 'bg-gradient-to-r from-orange-600 to-orange-400 hover:scale-[1.01] shadow-orange-500/20' : 
                'bg-gradient-to-r from-red-800 to-primary hover:scale-[1.01] shadow-primary/20'}`}
          >
            <Stethoscope className="w-6 h-6 md:w-8 md:h-8 mr-4 group-hover:rotate-12 transition-transform" />
            SAÚDE MUNDO PET
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <Card className={`md:col-span-4 bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl relative overflow-hidden group 
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
              <div className="flex items-center gap-4 p-4 md:p-5 rounded-xl bg-black/60 border border-zinc-800/50">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-800 relative">
                  {profile.photo ? <Image src={profile.photo} alt={profile.name} fill className="object-cover" unoptimized /> : <User className="w-full h-full p-2 text-zinc-700" />}
                </div>
                <div className="text-sm space-y-0.5">
                  <p className="text-zinc-500 uppercase text-[8px] md:text-[10px] tracking-widest font-semibold">Titular da Conta</p>
                  <p className="font-bold text-lg md:text-xl break-words">{profile.name}</p>
                </div>
              </div>

              {profile.emergencyContact && (
                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-black/40 border border-zinc-800/30">
                  <Phone className={`w-4 h-4 flex-shrink-0 ${themeColorClass}`} />
                  <div className="text-sm">
                    <p className="text-zinc-500 uppercase text-[8px] md:text-[9px] tracking-widest font-semibold">Contato Emergencial</p>
                    <p className="font-mono text-white text-xs sm:text-sm">{profile.emergencyContact}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-8">
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
                      <div key={pet.id} className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-zinc-800/50 group/item hover:border-zinc-700 transition-colors">
                        <Link href={`/pet/${profile.id}/${pet.id}`} className="flex items-center gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-lg border border-zinc-800 overflow-hidden relative
                            ${isLegendary ? 'group-hover/item:border-yellow-500/30' : isAmber ? 'group-hover/item:border-orange-500/30' : 'group-hover/item:border-primary/30'}`}>
                            {pet.photo ? (
                              <Image src={pet.photo} alt={pet.name} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                <Heart className={`w-4 h-4 ${themeColorClass}`} />
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
                            className="h-8 w-8 text-zinc-700 hover:text-primary"
                            onClick={(e) => { e.preventDefault(); handleOpenEditPet(pet); }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-zinc-700 hover:text-red-500 hover:bg-red-950/20"
                            onClick={(e) => { e.preventDefault(); handleDeletePet(pet.id, pet.name); }}
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

      {/* DIÁLOGOS */}
      <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-sm">
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
                <Input placeholder="EX: THOR" className="bg-black/50 border-zinc-800 font-bold uppercase" value={newPetName} onChange={(e) => setNewPetName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Espécie / Raça</Label>
                <Input placeholder="EX: DOBERMAN" className="bg-black/50 border-zinc-800 font-bold uppercase" value={newPetSpecies} onChange={(e) => setNewPetSpecies(e.target.value)} required />
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

      <Dialog open={isEditPetOpen} onOpenChange={setIsEditPetOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-sm">
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
                <Input className="bg-black/50 border-zinc-800 font-bold uppercase" value={editPetName} onChange={(e) => setEditPetName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Espécie / Raça</Label>
                <Input className="bg-black/50 border-zinc-800 font-bold uppercase" value={editPetSpecies} onChange={(e) => setEditPetSpecies(e.target.value)} required />
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

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
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
                    <Camera className="w-6 h-6" />
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
                <Input className="bg-black/50 border-zinc-800" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Contato de Emergência</Label>
                <Input className="bg-black/50 border-zinc-800" value={settingsPhone} onChange={(e) => setSettingsPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Cidade</Label>
                <Input className="bg-black/50 border-zinc-800" value={settingsCity} onChange={(e) => setSettingsCity(e.target.value)} placeholder="Ex: São Paulo" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Estado</Label>
                <Input className="bg-black/50 border-zinc-800" value={settingsState} onChange={(e) => setSettingsState(e.target.value)} placeholder="Ex: SP" />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className={`w-full h-12 font-black uppercase tracking-widest ${isLegendary ? 'bg-yellow-500 text-black' : isAmber ? 'bg-orange-500 text-black' : 'bg-primary'}`} disabled={isUpdatingSettings}>
                {isUpdatingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
