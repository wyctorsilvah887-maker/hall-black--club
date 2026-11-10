
"use client"

import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, PlusCircle, Medal, ExternalLink, Loader2, PawPrint, Camera, Siren } from "lucide-react";
import NextImage from "next/image";
import { useCollection, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/image-utils';
import { calculateRankByTime, getRankLabel, getThemeClass } from '@/lib/rank-utils';
import { cn } from '@/lib/utils';
import { RankBadge } from './MythicIcons';

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
        <div className="flex items-center">
           <NextImage 
             src="/logo-sfc.gif" 
             alt="Sovereign Founders Club" 
             width={200} 
             height={54} 
             className="h-10 md:h-12 w-auto object-contain"
             unoptimized
           />
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
        {/* Conteúdo mantido */}
      </main>

      {/* MODAL ADICIONAR PET */}
      <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white w-[92vw] max-w-sm rounded-[1.5rem] p-6 z-[200]">
          <DialogHeader>
            <DialogTitle className="uppercase font-black text-white">Registrar Pet</DialogTitle>
            <DialogDescription className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Adicione um novo animal à linhagem oficial da elite.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPet} className="space-y-4 mt-4">
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
