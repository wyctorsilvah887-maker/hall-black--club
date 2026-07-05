
"use client"

import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollarIcon, RubyShield } from "./MythicIcons";
import { User, ShieldCheck, Heart, PlusCircle, Crown, Gem, Phone, LogOut, Settings, ExternalLink, Loader2, PawPrint, Trash2, Camera, MapPin, Pencil, Stethoscope, Siren, Activity, Users, Trophy, Medal } from "lucide-react";
import NextImage from "next/image";
import { useCollection, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
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
import { calculateRankByTime, getRankLabel, getThemeClass } from '@/lib/rank-utils';
import { cn } from '@/lib/utils';

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
  
  // Patente dinâmica baseada no tempo
  const currentRank = useMemo(() => {
    return calculateRankByTime(profile.registrationDateTime, profile.status);
  }, [profile.registrationDateTime, profile.status]);

  const themeClass = getThemeClass(currentRank);
  const themeColorClass = 'text-primary';

  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    image: string;
    target: 'newPet' | 'editPet';
  } | null>(null);

  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('');
  const [newPetPhoto, setNewPetPhoto] = useState<string | null>(null);

  const petsQuery = useMemoFirebase(() => {
    if (!profile?.id) return null;
    return collection(db, 'users', profile.id, 'pets');
  }, [db, profile?.id]);

  const { data: petsData } = useCollection(petsQuery);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'newPet' | 'editPet') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditorState({ isOpen: true, image: reader.result as string, target });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleEditorConfirm = async (croppedImage: string) => {
    if (!editorState) return;
    try {
      const compressed = await compressImage(croppedImage);
      if (editorState.target === 'newPet') setNewPetPhoto(compressed);
      setEditorState(null);
    } catch (error) {
      toast({ variant: "destructive", title: "ERRO", description: "Falha ao processar imagem." });
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
      toast({ title: "PET REGISTRADO", description: `${newPetName.toUpperCase()} AGORA FAZ PARTE DA ELITE.` });
      setNewPetName(''); setNewPetSpecies(''); setNewPetPhoto(null);
      setIsAddPetOpen(false);
    } finally { setIsSubmitting(false); }
  };

  const handleToggleEmergency = (pet: any) => {
    if (!profile?.id) return;
    const petRef = doc(db, 'users', profile.id, 'pets', pet.id);
    const newState = !pet.isEmergencyActive;
    updateDocumentNonBlocking(petRef, { isEmergencyActive: newState });
    toast({ variant: newState ? "destructive" : "default", title: newState ? "SOS ATIVADO" : "SOS DESATIVADO" });
  };

  return (
    <div className={cn("min-h-screen bg-black text-white selection:bg-primary/30", themeClass)}>
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-zinc-900/50 h-16 md:h-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
           <Crown className={cn("w-5 h-5", themeColorClass)} />
           <h2 className={cn("text-sm md:text-xl font-black uppercase tracking-tighter", themeColorClass)}>Hall Black Hub</h2>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={() => setIsAddPetOpen(true)} size="sm" variant="outline" className="h-9 rounded-full border-zinc-800 bg-zinc-900/50">
            <PlusCircle className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Novo Pet</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("w-10 h-10 rounded-full border-2 overflow-hidden bg-zinc-900", themeColorClass.replace('text-', 'border-'))}>
                {profile.photo ? <NextImage src={profile.photo} alt={profile.name} width={40} height={40} className="object-cover" unoptimized /> : <User className="w-full h-full p-2 text-zinc-700" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-300">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuItem asChild><Link href="/settings">Configurações</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/debug/badges">Protocolo de Patentes</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut(auth)}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-12">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-12">
          <div className="space-y-2">
            <p className="text-zinc-600 text-[10px] uppercase tracking-[0.4em] font-bold">Identidade de Elite</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">{profile.name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={cn("py-1 px-4 rounded-full font-black text-[9px] tracking-widest", themeColorClass)}>
                {getRankLabel(currentRank)}
              </Badge>
              <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-[8px] font-black uppercase tracking-widest text-zinc-600 hover:text-white">
                <Link href="/debug/badges" className="flex items-center gap-1">
                  <Medal className="w-3 h-3" /> Ver Hierarquia
                </Link>
              </Button>
            </div>
          </div>
          <div className="scale-75 md:scale-100 origin-left md:origin-right">
             <RankBadge status={currentRank} id={profile.id} />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-950/40 border-zinc-900 p-6 flex flex-col items-center justify-center text-center space-y-4 rounded-3xl">
             <Trophy className={cn("w-10 h-10", themeColorClass)} />
             <div className="space-y-1">
               <h3 className="text-xl font-black uppercase">Pedigree Score</h3>
               <p className="text-4xl font-black tracking-tighter">{profile.pedigreeScore || '100'}</p>
             </div>
             <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Tempo de Casa Verificado</p>
          </Card>

          <Card className="bg-zinc-950/40 border-zinc-900 p-6 rounded-3xl col-span-1 lg:col-span-2">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <PawPrint className={themeColorClass} /> Meus Pets na Linhagem
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {petsData?.map((pet) => (
                <div key={pet.id} className="flex items-center justify-between p-3 rounded-2xl bg-black/60 border border-zinc-900 group">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-lg bg-zinc-900 overflow-hidden relative">
                        {pet.photo && <NextImage src={pet.photo} alt={pet.name} fill className="object-cover" unoptimized />}
                     </div>
                     <div>
                       <p className="font-black text-xs uppercase">{pet.name}</p>
                       <p className="text-[8px] text-zinc-600 uppercase font-bold">{pet.species}</p>
                     </div>
                   </div>
                   <div className="flex gap-1">
                     <Button size="icon" variant="ghost" className={cn("h-8 w-8", pet.isEmergencyActive ? "text-red-600" : "text-zinc-700")} onClick={() => handleToggleEmergency(pet)}>
                       <Siren className="w-4 h-4" />
                     </Button>
                     <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-700" asChild>
                        <Link href={`/pet/${profile.id}/${pet.id}`}><ExternalLink className="w-4 h-4" /></Link>
                     </Button>
                   </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      {/* MODAL ADICIONAR PET */}
      <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white w-[92vw] max-w-sm rounded-[1.5rem] p-6 z-[200]">
          <DialogHeader><DialogTitle className="uppercase font-black">Registrar Pet</DialogTitle></DialogHeader>
          <form onSubmit={handleAddPet} className="space-y-4">
             <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 mx-auto border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative">
                {newPetPhoto ? <NextImage src={newPetPhoto} alt="Preview" fill className="object-cover" unoptimized /> : <Camera className="text-zinc-800" />}
             </div>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'newPet')} />
             <div className="space-y-4">
               <Input placeholder="NOME DO PET" value={newPetName} onChange={(e) => setNewPetName(e.target.value.toUpperCase())} required className="bg-black border-zinc-900 h-12 font-bold" />
               <Input placeholder="ESPÉCIE / RAÇA" value={newPetSpecies} onChange={(e) => setNewPetSpecies(e.target.value.toUpperCase())} required className="bg-black border-zinc-900 h-12 font-bold" />
             </div>
             <Button type="submit" className="w-full h-12 font-black uppercase bg-primary" disabled={isSubmitting}>Confirmar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
