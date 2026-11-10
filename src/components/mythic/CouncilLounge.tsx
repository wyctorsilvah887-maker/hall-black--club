
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useDatabase, useUser } from '@/firebase';
import { ref, push, onValue, off, serverTimestamp, query, limitToLast, set, onDisconnect } from 'firebase/database';
import { Send, User, Loader2, Sparkles, Hash, ShieldAlert } from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { calculateRankByTime } from '@/lib/rank-utils';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Salão do Conselho - Chat em tempo real utilizando Firebase Realtime Database.
 * Inclui sistema de indicadores de digitação em tempo real.
 */

export function CouncilLounge({ profile }: { profile: any }) {
  const db = useDatabase();
  const { user } = useUser();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronização de Mensagens
  useEffect(() => {
    if (!db) return;

    const messagesRef = query(ref(db, 'loungeMessages'), limitToLast(100));
    
    const unsubscribe = onSnapshotMessages();
    const typingUnsubscribe = onSnapshotTyping();

    function onSnapshotMessages() {
      return onValue(messagesRef, (snapshot) => {
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
        console.error("RTDB Sync Error:", error);
        if (error.message.includes('permission_denied')) {
          setPermissionError(true);
        }
        setIsLoading(false);
      });
    }

    function onSnapshotTyping() {
      const typingRef = ref(db, 'typingStatus');
      return onValue(typingRef, (snapshot) => {
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
    }

    return () => {
      off(ref(db, 'loungeMessages'));
      off(ref(db, 'typingStatus'));
    };
  }, [db, user?.uid]);

  // Gestão do status "Digitando"
  useEffect(() => {
    if (!db || !user?.uid || !profile?.name) return;

    const userTypingRef = ref(db, `typingStatus/${user.uid}`);

    if (newMessage.length > 0) {
      // Atualiza status para digitando
      set(userTypingRef, {
        userName: profile.name,
        isTyping: true,
        lastUpdate: serverTimestamp()
      });

      // Configura limpeza automática ao desconectar
      onDisconnect(userTypingRef).remove();

      // Timeout para parar de digitar após inatividade
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        set(userTypingRef, { isTyping: false });
      }, 3000);
    } else {
      // Se apagar tudo, remove status imediatamente
      set(userTypingRef, { isTyping: false });
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [newMessage, db, user?.uid, profile?.name]);

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
      const typingRef = ref(db, `typingStatus/${user.uid}`);
      const currentRank = calculateRankByTime(profile.registrationDateTime, profile.status);
      
      // Remove status de digitando imediatamente ao enviar
      set(typingRef, { isTyping: false });

      await push(messagesRef, {
        userId: user.uid,
        userName: profile.name,
        userPhoto: profile.photo || null,
        userRank: currentRank,
        content: content,
        timestamp: serverTimestamp()
      });
    } catch (error: any) {
      console.error("Erro ao transmitir mensagem via RTDB:", error);
      if (error.message.includes('permission_denied')) {
        toast({
          variant: "destructive",
          title: "ACESSO NEGADO",
          description: "O Salão está trancado. Verifique as regras de rede."
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/20 border border-zinc-900/50 rounded-[2rem] overflow-hidden backdrop-blur-sm">
      {/* HEADER DO CHAT */}
      <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <Hash className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Frequência Sovereign</h3>
            <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-[0.2em]">Realtime Stream v5.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", permissionError ? "bg-red-600" : "bg-primary")} />
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
            {permissionError ? 'Erro de Link' : 'Live RTDB'}
          </span>
        </div>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sintonizando Rede...</p>
          </div>
        ) : permissionError ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-10">
            <ShieldAlert className="w-12 h-12 text-red-900" />
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Protocolo Negado</p>
              <p className="text-[9px] text-zinc-600 uppercase font-bold leading-relaxed">
                As regras do Realtime Database estão bloqueando a conexão. Atualize as regras no Console do Firebase.
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-10">
            <Sparkles className="w-12 h-12" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] max-w-[200px]">
              O Salão está em silêncio. Inicie a transmissão de elite.
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
                    "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500",
                    isMe ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className="flex-shrink-0 relative">
                    <div className={cn(
                      "w-8 h-8 rounded-full overflow-hidden border bg-zinc-900 shadow-xl",
                      msg.userRank === 'HALL_BLACK' ? "border-white/20" : 
                      msg.userRank === 'MYTHIC' ? "border-primary/50" : "border-zinc-800"
                    )}>
                      {msg.userPhoto ? (
                        <Image src={msg.userPhoto} alt={msg.userName} width={32} height={32} className="object-cover" unoptimized />
                      ) : (
                        <User className="w-full h-full p-2 text-zinc-700" />
                      )}
                    </div>
                  </div>
                  <div className={cn(
                    "flex flex-col space-y-1 max-w-[80%]",
                    isMe ? "items-end" : "items-start"
                  )}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{msg.userName}</span>
                      <span className="text-[7px] font-bold uppercase text-zinc-700">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className={cn(
                      "p-4 rounded-[1.2rem] text-xs font-medium leading-relaxed shadow-lg border",
                      isMe 
                        ? "bg-primary/10 border-primary/20 text-white rounded-tr-none" 
                        : "bg-zinc-900/50 border-zinc-800/50 text-zinc-300 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 px-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">
                  {typingUsers.length === 1 
                    ? `${typingUsers[0]} está digitando...` 
                    : `${typingUsers.length} fundadores estão digitando...`}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* INPUT DE MENSAGEM */}
      <form onSubmit={handleSendMessage} className="p-4 bg-black/40 border-t border-zinc-900 flex items-center gap-3">
        <Input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={permissionError ? "LINK INTERROMPIDO..." : "TRANSMITIR MENSAGEM..."}
          disabled={isSending || permissionError}
          className="bg-zinc-900/50 border-zinc-800 h-12 rounded-xl px-5 text-[11px] font-black uppercase tracking-tight focus-visible:ring-primary/40"
        />
        <Button 
          type="submit" 
          disabled={isSending || !newMessage.trim() || permissionError}
          className="h-12 w-12 rounded-xl bg-primary text-primary-foreground hover:bg-accent transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </form>
    </div>
  );
}
