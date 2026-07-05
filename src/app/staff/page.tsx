
"use client"

import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { ShieldCheck, Clock, MessageSquare, CheckCircle2, Loader2, ArrowLeft, Send, Search, Filter } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Painel da Staff do Hall Black Club.
 * Gerenciamento centralizado de protocolos de audiência.
 */

export default function StaffPanelPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all');

  // Verifica se o usuário é admin
  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

  // Consulta todas as mensagens - APENAS se for confirmado admin
  const messagesQuery = useMemoFirebase(() => {
    if (!db || !userProfile || userProfile.role !== 'admin') return null;
    return query(collection(db, 'councilMessages'), orderBy('timestamp', 'desc'));
  }, [db, userProfile]);

  const { data: messages, isLoading: isMessagesLoading } = useCollection(messagesQuery);

  const filteredMessages = messages?.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const handleSendReply = async () => {
    if (!db || !selectedMessage || !replyText.trim()) return;

    setIsReplying(true);
    try {
      const messageRef = doc(db, 'councilMessages', selectedMessage.id);
      updateDocumentNonBlocking(messageRef, {
        reply: replyText.trim(),
        status: 'replied',
        repliedAt: new Date().toISOString()
      });

      toast({
        title: "VEREDITO ENVIADO",
        description: `O membro ${selectedMessage.userName} foi notificado.`,
      });
      setSelectedMessage(null);
      setReplyText('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "FALHA NO PROTOCOLO",
        description: "Não foi possível enviar a resposta oficial.",
      });
    } finally {
      setIsReplying(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-zinc-900 mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Acesso Restrito</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest max-w-xs mb-8">Este terminal é exclusivo para o Alto Conselho e Staff autorizada.</p>
        <Button asChild variant="outline" className="border-zinc-800 rounded-full">
          <Link href="/">Retornar ao Hub</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary/30">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-12">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-2">
              <ArrowLeft className="w-4 h-4" /> Hub de Elite
            </Link>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Gestão do Conselho</h1>
            <div className="flex items-center gap-3">
               <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black tracking-[0.2em] px-3 py-1">ADMIN TERMINAL</Badge>
               <span className="text-zinc-700 text-[9px] font-bold uppercase tracking-widest">Protocolo de Audiência v5.0</span>
            </div>
          </div>

          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'pending', label: 'Pendentes' },
              { id: 'replied', label: 'Respondidos' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                  filter === t.id ? "bg-primary border-primary text-white" : "border-zinc-900 text-zinc-500 hover:border-zinc-700"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LISTA DE MENSAGENS */}
          <section className="lg:col-span-5 space-y-4">
            {isMessagesLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-zinc-900/20 rounded-3xl animate-pulse border border-zinc-900" />
              ))
            ) : !filteredMessages || filteredMessages.length === 0 ? (
              <div className="py-20 text-center bg-zinc-950/40 rounded-[2.5rem] border border-zinc-900 border-dashed">
                 <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">Nenhum protocolo localizado.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    setReplyText(msg.reply || '');
                  }}
                  className={cn(
                    "w-full text-left p-6 rounded-3xl border transition-all flex flex-col gap-4 group",
                    selectedMessage?.id === msg.id 
                      ? "bg-zinc-900 border-primary" 
                      : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-700"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{msg.userName}</p>
                      <h4 className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{msg.subject}</h4>
                    </div>
                    <Badge variant="outline" className={cn(
                      "py-0.5 px-2 rounded-full text-[7px] font-black tracking-widest",
                      msg.status === 'replied' ? "text-green-500 border-green-500/20" : "text-primary border-primary/20 animate-pulse"
                    )}>
                      {msg.status === 'replied' ? 'CONCLUÍDO' : 'PENDENTE'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-auto">
                    <Clock className="w-3 h-3 text-zinc-800" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-800">
                      {new Date(msg.timestamp).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </button>
              ))
            )}
          </section>

          {/* ÁREA DE RESPOSTA */}
          <section className="lg:col-span-7">
            {selectedMessage ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="bg-zinc-950 border-zinc-900 p-8 md:p-12 rounded-[2.5rem] space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Protocolo de Audiência</p>
                        <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">REF ID: {selectedMessage.id}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{selectedMessage.subject}</h3>
                       <p className="text-zinc-400 text-sm font-medium leading-relaxed italic">
                         "{selectedMessage.message}"
                       </p>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-zinc-900">
                      <CheckCircle2 className="w-4 h-4 text-zinc-700" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Emitido por {selectedMessage.userName}</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Veredito do Alto Conselho</h4>
                      {selectedMessage.status === 'replied' && (
                        <span className="text-[8px] text-green-500 font-black uppercase tracking-widest">Originalmente respondido em {new Date(selectedMessage.repliedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <Textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="REDIJA O PARECER OFICIAL DO CONSELHO..."
                      className="bg-black border-zinc-900 min-h-[180px] rounded-3xl p-6 text-sm font-medium text-white focus-visible:ring-primary/40 resize-none"
                    />
                    <Button 
                      onClick={handleSendReply}
                      disabled={isReplying || !replyText.trim()}
                      className="w-full h-14 bg-primary hover:bg-accent text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-primary/20"
                    >
                      {isReplying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Emitir Resposta Oficial</>}
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20 border border-zinc-900 border-dashed rounded-[3rem] py-32">
                 <ShieldCheck className="w-20 h-20" />
                 <p className="text-[11px] font-black uppercase tracking-[0.4em] max-w-xs leading-relaxed">
                   Selecione uma audiência pendente para emitir o veredito oficial do conselho.
                 </p>
              </div>
            )}
          </section>
        </div>

        <footer className="pt-20 text-center opacity-10">
           <p className="text-[8px] font-black uppercase tracking-[1em]">Hall Black Management Terminal • Secret Protocol v2.0</p>
        </footer>
      </div>
    </main>
  );
}
