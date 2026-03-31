"use client"

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollarIcon, RubyShield } from "./MythicIcons";
import { Trophy, User, ShieldCheck, Heart, ArrowUpRight, PlusCircle, Sparkles, Crown, Gem, Phone, LogOut, Settings, ExternalLink, Loader2, PawPrint, Trash2, Camera, X } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
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
  DialogTrigger,
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
  
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('');
  const [newPetPhoto, setNewPetPhoto] = useState<string | null>(null);

  // Busca a coleção de usuários para contar o registro
  const usersQuery = useMemoFirebase(() => {
    return collection(db, 'users');
  }, [db]);
  
  const { data: usersData } = useCollection(usersQuery);
  const userCount = usersData?.length || 0;
  const formattedRegistration = userCount.toString().padStart(3, '0');

  // Busca os pets do usuário logado
  const petsQuery = useMemoFirebase(() => {
    if (!profile?.id) return null;
    return collection(db, 'users', profile.id, 'pets');
  }, [db, profile?.id]);

  const { data: petsData, isLoading: isPetsLoading } = useCollection(petsQuery);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setNewPetPhoto(compressed);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "ERRO NA IMAGEM",
        description: "Não foi possível processar a foto do pet.",
      });
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName || !newPetSpecies || !profile?.id) return;

    setIsSubmitting(true);
    const petsRef = collection(db, 'users', profile.id, 'pets');
    
    // Adiciona o Pet
    addDocumentNonBlocking(petsRef, {
      userId: profile.id,
      name: newPetName,
      species: newPetSpecies,
      photo: newPetPhoto,
      registrationDateTime: new Date().toISOString(),
    });

    // Incrementa a pontuação do usuário (Ganha 100 pontos por pet)
    const userRef = doc(db, 'users', profile.id);
    updateDocumentNonBlocking(userRef, {
      rankingScore: (profile.rankingScore || 0) + 100
    });

    toast({
      title: "PET REGISTRADO (+100 PTS)",
      description: `${newPetName.toUpperCase()} AGORA FAZ PARTE DA ELITE. SEU PRESTÍGIO AUMENTOU.`,
    });

    setNewPetName('');
    setNewPetSpecies('');
    setNewPetPhoto(null);
    setIsAddPetOpen(false);
    setIsSubmitting(false);
  };

  const handleDeletePet = (petId: string, petName: string) => {
    if (!profile?.id) return;
    
    const petRef = doc(db, 'users', profile.id, 'pets', petId);
    deleteDocumentNonBlocking(petRef);

    toast({
      title: "PET REMOVIDO",
      description: `${petName.toUpperCase()} FOI RETIRADO DA LINHAGEM.`,
    });
  };

  const isLegendary = profile.status === 'LEGENDARY';
  const isAmber = profile.status === 'AMBER';

  const getTitleText = () => {
    if (isLegendary) return 'HALL BLACK LENDÁRIO';
    if (isAmber) return 'HALL BLACK LEGENDÁRIO';
    return 'HALL BLACK';
  };

  const getStatusBadge = () => {
    if (isLegendary) return { text: 'ACREDITAÇÃO LENDÁRIA', icon: <Crown className="w-3 h-3 md:w-4 md:h-4" />, style: 'border-yellow-500/50 bg-yellow-500/20 text-yellow-500 animate-gold-glow' };
    if (isAmber) return { text: 'STATUS LEGENDÁRIO', icon: <Gem className="w-3 h-3 md:w-4 md:h-4" />, style: 'border-orange-500/50 bg-orange-500/20 text-orange-500 animate-amber-glow' };
    return { text: 'MEMBRO MÍTICO', icon: <CollarIcon className="w-3 h-3 md:w-4 md:h-4" />, style: 'border-primary/50 bg-primary/10 text-primary' };
  };

  const badgeInfo = getStatusBadge();

  return (
    <div className={`min-h-screen bg-black text-white animate-in fade-in duration-1000 overflow-x-hidden`}>
      {/* CABEÇALHO SUPERIOR STICKY */}
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <h2 className={`text-base sm:text-xl md:text-2xl font-black font-headline uppercase tracking-tighter 
              ${isLegendary ? 'gold-gradient-text' : isAmber ? 'amber-gradient-text' : 'text-primary'}`}>
              {getTitleText()}
            </h2>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-4 w-px bg-zinc-800 mx-1" />
              <span className="text-zinc-500 text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-bold">
                REGISTRO: #{formattedRegistration}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`h-9 rounded-full border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 px-4 transition-all
                    ${isLegendary ? 'hover:border-yellow-500/50 hover:text-yellow-500' : isAmber ? 'hover:border-orange-500/50 hover:text-orange-500' : 'hover:border-primary/50 hover:text-primary'}`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Novo Pet</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tighter">Registrar Novo Pet</DialogTitle>
                  <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest">
                    Adicione uma nova identidade à sua linhagem de elite.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddPet} className="space-y-6 pt-4">
                  <div className="space-y-4">
                    {/* Foto Upload */}
                    <div className="flex flex-col items-center gap-3">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden relative group`}
                      >
                        {newPetPhoto ? (
                          <>
                            <Image src={newPetPhoto} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-zinc-600">
                            <Camera className="w-6 h-6" />
                            <span className="text-[8px] font-black uppercase">Foto</span>
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pet-name" className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Nome do Pet</Label>
                      <Input
                        id="pet-name"
                        placeholder="EX: THOR"
                        className="bg-black/50 border-zinc-800 focus:border-primary/50 font-bold uppercase"
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pet-species" className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Espécie / Raça</Label>
                      <Input
                        id="pet-species"
                        placeholder="EX: DOBERMAN"
                        className="bg-black/50 border-zinc-800 focus:border-primary/50 font-bold uppercase"
                        value={newPetSpecies}
                        onChange={(e) => setNewPetSpecies(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      className={`w-full h-12 font-black uppercase tracking-widest
                        ${isLegendary ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : isAmber ? 'bg-orange-500 hover:bg-orange-400 text-black' : 'bg-primary hover:bg-accent'}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Registro'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center border-2 transition-all bg-zinc-900/80 outline-none
                  ${isLegendary ? 'border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]' : 
                    isAmber ? 'border-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 
                    'border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)] hover:shadow-[0_0_15px_rgba(var(--primary),0.4)]'}`}>
                  <User className={`w-4 h-4 md:w-5 md:h-5 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-300">
                <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-zinc-500 px-3 pt-3">Conta Elite</DropdownMenuLabel>
                <div className="px-3 pb-3">
                  <p className="font-bold text-sm text-white truncate">{profile.name}</p>
                  <p className={`text-[9px] font-black uppercase tracking-tighter ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`}>
                    {badgeInfo.text}
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer py-2.5">
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
                <DropdownMenuItem 
                  onClick={() => signOut(auth)}
                  className="focus:bg-red-950/30 focus:text-red-500 text-red-600 cursor-pointer py-2.5"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Encerrar Sessão</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:space-y-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8 md:pb-12">
          <div className="space-y-1">
            <p className="text-zinc-500 text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-bold">Bem-vindo ao Elite</p>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight uppercase leading-none">{profile.name}</h1>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={`py-2 px-5 flex items-center gap-2 rounded-full font-bold tracking-widest text-[10px] md:text-xs w-fit ${badgeInfo.style}`}>
              {badgeInfo.icon}
              {badgeInfo.text}
            </Badge>
            <span className="sm:hidden text-zinc-500 text-[8px] uppercase tracking-[0.2em] font-bold ml-1">
              REGISTRO: #{formattedRegistration}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Profile Card */}
          <Card className={`md:col-span-4 bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl relative overflow-hidden group 
            ${isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : ''}`}>
            <div className={`absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-30 transition-opacity rotate-12 pointer-events-none
              ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`}>
              {isLegendary ? <Crown className="w-16 h-16 md:w-24 md:h-24" /> : isAmber ? <Gem className="w-16 h-16 md:w-24 md:h-24" /> : <RubyShield className="w-16 h-16 md:w-24 md:h-24" />}
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg md:text-xl tracking-tight">
                <ShieldCheck className={`w-4 h-4 md:w-5 md:h-5 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                Credencial de Membro
              </CardTitle>
              <CardDescription className="text-zinc-500 uppercase text-[9px] md:text-[10px] tracking-widest">Identificação Criptografada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-4 p-4 md:p-5 rounded-xl bg-black/60 border border-zinc-800/50">
                <div className="text-sm space-y-0.5">
                  <p className="text-zinc-500 uppercase text-[8px] md:text-[10px] tracking-widest font-semibold">Titular da Conta</p>
                  <p className="font-bold text-lg md:text-xl break-words">{profile.name}</p>
                </div>
              </div>

              {profile.emergencyContact && (
                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-black/40 border border-zinc-800/30">
                  <Phone className={`w-4 h-4 flex-shrink-0 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                  <div className="text-sm">
                    <p className="text-zinc-500 uppercase text-[8px] md:text-[9px] tracking-widest font-semibold">Contato Emergencial</p>
                    <p className="font-mono text-white text-xs sm:text-sm">{profile.emergencyContact}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 md:p-4 rounded-xl bg-black/60 border border-zinc-800/50">
                  <p className="text-zinc-500 uppercase text-[8px] md:text-[10px] tracking-widest mb-1">Status Rede</p>
                  <p className={`font-bold text-xs sm:text-sm ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`}>VERIFICADO</p>
                </div>
                <div className="p-3 md:p-4 rounded-xl bg-black/60 border border-zinc-800/50">
                  <p className="text-zinc-500 uppercase text-[8px] md:text-[10px] tracking-widest mb-1">Influência</p>
                  <p className="font-bold text-white text-xs sm:text-sm">MÍTICA</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestão de Linhagem */}
          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Card className={`bg-zinc-900/40 border-zinc-800/50 overflow-hidden group relative flex flex-col ${isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : ''}`}>
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl tracking-tight uppercase">
                  <PawPrint className={`w-4 h-4 md:w-5 md:h-5 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
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
                              <Image src={pet.photo} alt={pet.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                <Heart className={`w-4 h-4 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
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
                            className="h-8 w-8 text-zinc-700 hover:text-red-500 hover:bg-red-950/20"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeletePet(pet.id, pet.name);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Link href={`/pet/${profile.id}/${pet.id}`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-700 hover:text-white">
                              <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button 
                  onClick={() => setIsAddPetOpen(true)}
                  className={`w-full h-11 md:h-12 text-xs font-bold transition-all mt-4
                    ${isLegendary ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 
                      isAmber ? 'bg-orange-500 hover:bg-orange-400 text-black' : 
                      'bg-primary hover:bg-accent text-white'}`}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  ADICIONAR NOVO PET
                </Button>
              </CardContent>
            </Card>

            <Card className={`bg-zinc-900/40 border-zinc-800/50 relative overflow-hidden ${isLegendary ? 'border-yellow-500/20' : isAmber ? 'border-orange-500/20' : ''}`}>
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl tracking-tight uppercase">
                  <Trophy className={`w-4 h-4 md:w-5 md:h-5 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
                  Hall da Fama
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {[
                  { name: "Thor (Doberman)", points: "12,450", rank: 1 },
                  { name: "Luna (Persa)", points: "10,200", rank: 2 },
                  { name: "Zeus (Husky)", points: "9,800", rank: 3 }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl bg-black/40 border border-zinc-800/30 transition-all hover:bg-black/60 
                    ${(isLegendary || isAmber) && i === 0 ? (isLegendary ? 'border-yellow-500/30' : 'border-orange-500/30') : ''}`}>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black 
                        ${i === 0 ? 
                          (isLegendary ? 'bg-yellow-500 text-black' : 
                           isAmber ? 'bg-orange-500 text-black' : 
                           'bg-primary text-white') : 
                          'bg-zinc-800 text-zinc-400'}`}>
                        {item.rank}
                      </span>
                      <span className="font-semibold text-xs sm:text-sm tracking-tight truncate max-w-[100px] xs:max-w-none">{item.name}</span>
                    </div>
                    <span className={`${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'} font-black text-[10px] sm:text-xs`}>{item.points} PTS</span>
                  </div>
                ))}
                
                <div className="pt-4 md:pt-6 border-t border-zinc-800/50 mt-2 md:mt-4 text-center">
                  <p className="text-[8px] md:text-[9px] text-zinc-500 uppercase tracking-[0.3em] mb-2 md:mb-3">Seu Prestígio Atual</p>
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <span className={`text-3xl md:text-4xl font-black italic ${isLegendary ? 'gold-gradient-text' : isAmber ? 'amber-gradient-text' : 'text-white'}`}>
                      {profile.rankingScore || 0}
                    </span>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-zinc-400 text-[10px] md:text-xs font-bold">PTS</span>
                      <span className="text-zinc-600 text-[8px] md:text-[10px]">RANKING</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-12 md:mt-20 pb-12 md:pb-16 border-t border-zinc-900 pt-8 md:pt-10 text-center">
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
          <div className="h-px w-6 md:w-8 bg-zinc-800" />
          <Crown className={`w-3 h-3 md:w-4 md:h-4 ${isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary'}`} />
          <div className="h-px w-6 md:w-8 bg-zinc-800" />
        </div>
        <p className="text-zinc-600 text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-light px-4">
          &copy; 2024 HALL BLACK CLUB - EXCLUSIVIDADE {isLegendary ? 'LENDÁRIA' : isAmber ? 'LEGENDÁRIA' : 'MÍTICA'}
        </p>
      </footer>
    </div>
  );
}
