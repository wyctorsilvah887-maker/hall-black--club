
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Send, User, ShieldCheck, Loader2, Sparkles, Hash } from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';
import { calculateRankByTime } from '@/lib/rank-utils';

/**
 * @fileOverview Salão do Conselho - Chat em tempo real para membros Sovereign Founders.
 */

export function CouncilLounge({ profile }: { profile: any }) {
  const db = useFirestore();
  const { user } = useUser();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'loungeMessages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
  }, [db]);

  const { data: messages, isLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user?.uid || !newMessage.trim()) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const messagesRef = collection(db, 'loungeMessages');
      const currentRank = calculateRankByTime(profile.registrationDateTime, profile.status);
      
      addDocumentNonBlocking(messagesRef, {
        userId: user.uid,
        userName: profile.name,
        userPhoto: profile.photo || null,
        userRank: currentRank,
        content: content,
        timestamp: new Date().toISOString()
      });
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
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Frequência Elite</h3>
            <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-[0.2em]">Canal Criptografado v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Membros Ativos</span>
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
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-10">
            <Sparkles className="w-12 h-12" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] max-w-[200px]">
              O Salão está em silêncio. Inicie a transmissão de elite.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
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
          })
        )}
      </div>

      {/* INPUT DE MENSAGEM */}
      <form onSubmit={handleSendMessage} className="p-4 bg-black/40 border-t border-zinc-900 flex items-center gap-3">
        <Input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="TRANSMITIR MENSAGEM..."
          disabled={isSending}
          className="bg-zinc-900/50 border-zinc-800 h-12 rounded-xl px-5 text-[11px] font-black uppercase tracking-tight focus-visible:ring-primary/40"
        />
        <Button 
          type="submit" 
          disabled={isSending || !newMessage.trim()}
          className="h-12 w-12 rounded-xl bg-primary text-primary-foreground hover:bg-accent transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </form>
    </div>
  );
}
