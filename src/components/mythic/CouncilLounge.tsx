
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useDatabase, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { ref, push, onValue, off, serverTimestamp, query, limitToLast, set, onDisconnect } from 'firebase/database';
import { doc } from 'firebase/firestore';
import { Send, User, Loader2, Sparkles, ShieldAlert, MapPin, ShieldCheck, ChevronRight, Info } from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { calculateRankByTime, getRankLabel, getThemeClass } from '@/lib/rank-utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RankBadge } from './MythicIcons';
import Link from 'next/link';

/**
 * @fileOverview Salão do Conselho - Chat em tempo real utilizando Firebase Realtime Database.
 * Inclui:
 * - Indicadores de digitação.
 * - Auto-scroll.
 * - Preview de perfil de membros ao clicar.
 */

export function CouncilLounge({ profile }: { profile: any }) {
  const db = useDatabase();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // State para o preview do perfil
  const [previewUserId, setPreviewUserId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Referência Firestore para o usuário do preview
  const previewUserRef = useMemoFirebase(() => {
    if (!firestore || !previewUserId) return null;
    return doc(firestore, 'users', previewUserId);
  }, [firestore, previewUserId]);

  const { data: previewProfile, isLoading: isPreviewLoading } = useDoc(previewUserRef);

  // Sincronização de Mensagens e Status de Digitação
  useEffect(() => {
    if (!db) return;

    // Listener para Mensagens
    const messagesRef = query(ref(db, 'loungeMessages'), limitToLast(100));
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      setPermissionError(false);
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        })).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        
        setMessages(messageList);
      } else {
        setMessages([]);
      }
      setIsLoading(false);
    }, (error) => {
      if (error.message.includes('permission_denied')) {
        setPermissionError(true);
      }
      setIsLoading(false);
    });

    // Listener para Status de Digitação
    const typingStatusRef = ref(db, 'typingStatus');
    const unsubscribeTyping = onValue(typingStatusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const currentlyTyping = Object.entries(data)
          .filter(([uid, status]: [string, any]) => uid !== user?.uid && status.isTyping)
          .map(([_, status]: [string, any]) => status.userName);
        setTypingUsers(currentlyTyping);
      } else {
        setTypingUsers([]);
      }
    });

    return () => {
      off(messagesRef);
      off(typingStatusRef);
    };
  }, [db, user?.uid]);

  // Atualização do status "Digitando" do usuário local
  useEffect(() => {
    if (!db || !user?.uid || !profile?.name) return;

    const userTypingRef = ref(db, `typingStatus/${user.uid}`);

    const updateTyping = (isTyping: boolean) => {
      set(userTypingRef, {
        userName: profile.name,
        isTyping,
        lastUpdate: serverTimestamp()
      });
      if (isTyping) {
        onDisconnect(userTypingRef).remove();
      }
    };

    if (newMessage.length > 0) {
      updateTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => updateTyping(false), 3000);
    } else {
      updateTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [newMessage, db, user?.uid, profile?.name]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user?.uid || !newMessage.trim()) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const messagesRef = ref(db, 'loungeMessages');
      const userTypingRef = ref(db, `typingStatus/${user.uid}`);
      const currentRank = calculateRankByTime(profile.registrationDateTime, profile.status);
      
      set(userTypingRef, { isTyping: false });

      await push(messagesRef, {
        userId: user.uid,
        userName: profile.name,
        userPhoto: profile.photo || null,
        userRank: currentRank,
        content: content,
        timestamp: serverTimestamp()
      });
    } catch (error: any) {
      if (error.message.includes('permission_denied')) {
        toast({
          variant: "destructive",
          title: "SISTEMA BLOQUEADO",
          description: "O Salão exige permissão de rede ativa no Console."
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* ÁREA DE TRANSMISSÃO */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-12 md:py-10 space-y-6 md:space-y-8 custom-scrollbar scroll-smooth"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sintonizando Rede...</p>
          </div>
        ) : permissionError ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-10">
            <div className="p-6 rounded-[2rem] bg-red-950/10 border border-red-900/30">
              <ShieldAlert className="w-16 h-16 text-red-600 animate-pulse" />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">Acesso de Rede Negado</p>
              <p className="text-[10px] text-zinc-600 uppercase font-bold leading-relaxed max-w-xs mx-auto">
                Configure as regras do Realtime Database para permitir leitura/escrita.
              </p>
            </div>
          </div>
        ) : messages.length === 0 && typingUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-20">
            <Sparkles className="w-16 h-16 text-primary" />
            <p className="text-[11px] font-black uppercase tracking-[0.4em] max-w-[240px] leading-relaxed">
              O Salão está em silêncio. Inicie a transmissão para a elite.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isMe = msg.userId === user?.uid;
              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex items-start gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700",
                    isMe ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* AVATAR CLICÁVEL */}
                  <div className="flex-shrink-0 cursor-pointer active:scale-90 transition-transform" onClick={() => setPreviewUserId(msg.userId)}>
                    <div className={cn(
                      "w-8 h-8 md:w-11 md:h-11 rounded-full overflow-hidden border bg-zinc-950 shadow-2xl",
                      msg.userRank === 'HALL_BLACK' ? "border-white/20" : 
                      msg.userRank === 'MYTHIC' ? "border-primary/50" : "border-zinc-800"
                    )}>
                      {msg.userPhoto ? (
                        <Image src={msg.userPhoto} alt={msg.userName} width={44} height={44} className="object-cover" unoptimized />
                      ) : (
                        <User className="w-full h-full p-2 text-zinc-800" />
                      )}
                    </div>
                  </div>

                  <div className={cn(
                    "flex flex-col space-y-1.5 max-w-[85%] md:max-w-[70%]",
                    isMe ? "items-end" : "items-start"
                  )}>
                    {/* NOME CLICÁVEL */}
                    <div className="flex items-center gap-2 px-1 cursor-pointer group" onClick={() => setPreviewUserId(msg.userId)}>
                      <span className={cn(
                        "text-[8px] md:text-[9px] font-black uppercase tracking-widest group-hover:underline",
                        isMe ? "text-primary" : "text-zinc-500"
                      )}>{msg.userName}</span>
                      <span className="text-[7px] md:text-[8px] font-bold uppercase text-zinc-700">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    
                    <div className={cn(
                      "p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-[11px] md:text-sm font-medium leading-relaxed shadow-2xl border backdrop-blur-md",
                      isMe 
                        ? "bg-primary/10 border-primary/20 text-white rounded-tr-none" 
                        : "bg-zinc-900/40 border-zinc-800/40 text-zinc-200 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {typingUsers.length > 0 && (
              <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center overflow-hidden">
                    <User className="w-5 h-5 text-zinc-800" />
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1 italic">
                    {typingUsers.length === 1 
                      ? `${typingUsers[0].split(' ')[0]} está digitando...` 
                      : `${typingUsers.length} fundadores digitando...`}
                  </span>
                  <div className="bg-zinc-900/40 border border-zinc-800/40 p-3 md:p-4 rounded-[1.2rem] rounded-tl-none flex items-center justify-center gap-1.5 w-16 md:w-20">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* DOCK DE ENTRADA */}
      <div className="flex-shrink-0 bg-black/60 backdrop-blur-3xl border-t border-zinc-900/50 p-4 md:p-10 pb-8 md:pb-12 z-50">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3 relative">
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={permissionError ? "REDE INDISPONÍVEL..." : "TRANSMITIR..."}
            disabled={isSending || permissionError}
            className="bg-zinc-950/50 border-zinc-800 h-14 md:h-20 rounded-2xl md:rounded-[2.5rem] px-6 md:px-10 text-xs md:text-base font-black uppercase tracking-tight focus-visible:ring-primary/40 pr-16 md:pr-24 shadow-inner"
          />
          <Button 
            type="submit" 
            disabled={isSending || !newMessage.trim() || permissionError}
            className="absolute right-2 md:right-4 h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-3xl bg-primary text-primary-foreground hover:bg-accent transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 md:w-6 md:h-6" />}
          </Button>
        </form>
      </div>

      {/* MODAL DE PREVIEW DO PERFIL */}
      <Dialog open={!!previewUserId} onOpenChange={(open) => !open && setPreviewUserId(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white w-[90vw] max-w-sm rounded-[2.5rem] p-0 overflow-hidden shadow-2xl z-[300]">
          {isPreviewLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Acessando Dossiê...</p>
            </div>
          ) : previewProfile ? (
            <div className="flex flex-col">
              {/* Banner / Cabeçalho do Preview */}
              <div className="h-24 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-900 relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                   <div className={cn(
                     "w-24 h-24 rounded-full border-4 overflow-hidden bg-zinc-950 shadow-2xl",
                     calculateRankByTime(previewProfile.registrationDateTime, previewProfile.status) === 'HALL_BLACK' ? "border-zinc-800" :
                     calculateRankByTime(previewProfile.registrationDateTime, previewProfile.status) === 'MYTHIC' ? "border-primary" : "border-zinc-900"
                   )}>
                     {previewProfile.photo ? (
                       <Image src={previewProfile.photo} alt={previewProfile.name} width={96} height={96} className="object-cover" unoptimized />
                     ) : (
                       <User className="w-full h-full p-6 text-zinc-900" />
                     )}
                   </div>
                </div>
              </div>

              <div className="pt-14 pb-8 px-8 flex flex-col items-center text-center space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white leading-tight">{previewProfile.name}</h3>
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.3em]">#{previewProfile.memberNumber?.toString().padStart(2, '0')} FOUNDER</p>
                </div>

                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="scale-75 origin-center">
                    <RankBadge status={calculateRankByTime(previewProfile.registrationDateTime, previewProfile.status)} id={previewProfile.id} size="sm" />
                  </div>
                  <Badge variant="outline" className="border-zinc-900 text-zinc-500 text-[8px] font-black tracking-widest py-1 px-4 rounded-full">
                    {getRankLabel(calculateRankByTime(previewProfile.registrationDateTime, previewProfile.status))}
                  </Badge>
                </div>

                {previewProfile.bio && (
                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic max-w-[240px]">
                    "{previewProfile.bio}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 w-full pt-2">
                  <div className="bg-zinc-900/30 p-3 rounded-2xl border border-zinc-900/50 flex flex-col items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-700" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500 truncate w-full">
                      {previewProfile.city || 'Sovereign'}
                    </span>
                  </div>
                  <div className="bg-zinc-900/30 p-3 rounded-2xl border border-zinc-900/50 flex flex-col items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Verificado</span>
                  </div>
                </div>

                <Button asChild className="w-full h-12 bg-primary hover:bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 group">
                  <Link href={`/profile/${previewProfile.id}`}>
                    Ver Perfil Completo <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center px-10">
              <ShieldAlert className="w-12 h-12 text-zinc-900" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 leading-relaxed">
                Este membro optou por manter suas credenciais sob sigilo absoluto.
              </p>
              <Button variant="ghost" onClick={() => setPreviewUserId(null)} className="text-[9px] font-black uppercase tracking-widest">Fechar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
