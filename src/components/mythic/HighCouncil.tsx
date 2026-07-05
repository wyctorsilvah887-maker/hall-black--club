
"use client"

import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { User, ShieldCheck, MapPin, Lock, MessageSquare, Send, Clock, CheckCircle2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

/**
 * @fileOverview Galeria do Conselho e Canal de Audiência.
 * Exibe os 60 detentores e provê canal de comunicação oficial.
 */

export function HighCouncil({ profile }: { profile: any }) {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  // Consulta de membros
  const councilQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'users'), limit(100));
  }, [db]);
  
  const { data: allMembers, isLoading: isMembersLoading } = useCollection(councilQuery);

  // Consulta de mensagens do usuário
  const messagesQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, 'councilMessages'),
      where('userId', '==', user.uid),
      limit(50)
    );
  }, [db, user?.uid]);

  const { data: myMessages, isLoading: isMessagesLoading } = useCollection(messagesQuery);

  const members = allMembers 
    ? allMembers.filter(m => m.status !== 'REVOKED').slice(0, 60)
    : [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user?.uid || !message.trim()) return;

    setIsSending(true);
    try {
      const messagesRef = collection(db, 'councilMessages');
      await addDocumentNonBlocking(messagesRef, {
        userId: user.uid,
        userName: profile.name,
        subject: subject || 'Assunto Geral',
        message: message.trim(),
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      toast({
        title: "PROTOCOLO DE AUDIÊNCIA",
        description: "Sua mensagem foi criptografada e enviada ao Conselho.",
      });
      setSubject('');
      setMessage('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "FALHA NA TRANSMISSÃO",
        description: "O canal de elite está instável. Tente novamente.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-20">
      {/* SEÇÃO DO CONSELHO */}
      <section className="space-y-12">
        <div className="max-w-xl space-y-4">
          <h3 className="text-3xl font-black uppercase tracking-tighter">Conselho</h3>
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-bold leading-relaxed">
            Os 60 detentores das chaves Hall Black originais. Uma linhagem de prestígio que governa o ecossistema.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {isMembersLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-zinc-900/20 rounded-[1.5rem] animate-pulse" />
            ))
          ) : members.map((member) => (
            <div 
              key={member.id} 
              className="group relative aspect-[3/4] bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all duration-700"
            >
              {member.photo ? (
                <Image 
                  src={member.photo} 
                  alt={member.name} 
                  fill 
                  className="object-cover opacity-40 group-hover:opacity-80 transition-opacity grayscale group-hover:grayscale-0 duration-700" 
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-zinc-900" />
                </div>
              )}
              
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent space-y-1">
                <p className="text-[9px] font-black text-white uppercase tracking-tighter truncate">{member.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-black uppercase tracking-widest text-primary">
                    #{member.memberNumber?.toString().padStart(2, '0')}
                  </span>
                  {member.city && (
                    <div className="flex items-center gap-1 text-zinc-600">
                      <MapPin className="w-2 h-2" />
                      <span className="text-[7px] font-bold uppercase">{member.city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {!isMembersLoading && members.length < 60 && Array(Math.max(0, 12 - members.length)).fill(0).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-[3/4] bg-zinc-950/20 border border-zinc-900 border-dashed rounded-[2rem] flex flex-col items-center justify-center opacity-20">
               <Lock className="w-6 h-6 mb-2" />
               <span className="text-[7px] font-black uppercase tracking-widest text-center px-4">Aguardando Sucessão</span>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO DE AUDIÊNCIA / MENSAGENS */}
      <section className="max-w-4xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-y border-zinc-900 py-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="text-2xl font-black uppercase tracking-tighter">Protocolo de Audiência</h3>
             </div>
             <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold max-w-sm">
               Canal direto e seguro para comunicações estratégicas com o Conselho.
             </p>
          </div>
          <Button 
            onClick={() => setShowInbox(!showInbox)}
            variant="outline" 
            className="h-12 rounded-2xl border-zinc-800 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900"
          >
            {showInbox ? (
              <><ChevronUp className="w-4 h-4 mr-2" /> Ver Formulário</>
            ) : (
              <><Clock className="w-4 h-4 mr-2" /> Minhas Solicitações ({myMessages?.length || 0})</>
            )}
          </Button>
        </div>

        {showInbox ? (
          /* INBOX DE MENSAGENS */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             {isMessagesLoading ? (
               <div className="flex items-center justify-center py-20">
                 <Loader2 className="w-6 h-6 animate-spin text-zinc-800" />
               </div>
             ) : !myMessages || myMessages.length === 0 ? (
               <div className="text-center py-20 bg-zinc-950/40 rounded-[2rem] border border-zinc-900 border-dashed">
                  <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Nenhuma audiência registrada.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-4">
                 {myMessages.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((msg) => (
                   <Card key={msg.id} className="bg-zinc-950/40 border-zinc-900 rounded-3xl overflow-hidden">
                      <div className="p-6 md:p-8 space-y-6">
                         <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                               <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">Protocolo: {msg.id.substring(0,8).toUpperCase()}</p>
                               <h4 className="text-white font-black uppercase tracking-tight">{msg.subject}</h4>
                            </div>
                            <Badge variant="outline" className={cn(
                              "py-1 px-3 rounded-full text-[8px] font-black tracking-widest border-zinc-800",
                              msg.status === 'replied' ? "text-green-500 bg-green-500/10" : "text-primary bg-primary/10 animate-pulse"
                            )}>
                              {msg.status === 'replied' ? 'RESPONDIDO' : 'EM ANÁLISE'}
                            </Badge>
                         </div>
                         
                         <p className="text-zinc-500 text-xs font-medium leading-relaxed italic">"{msg.message}"</p>
                         
                         {msg.reply && (
                           <div className="mt-6 pt-6 border-t border-zinc-900/50 space-y-3">
                              <div className="flex items-center gap-2">
                                 <ShieldCheck className="w-3 h-3 text-primary" />
                                 <span className="text-[8px] font-black uppercase tracking-widest text-primary">Parecer do Conselho</span>
                              </div>
                              <p className="text-white text-xs font-bold leading-relaxed">{msg.reply}</p>
                           </div>
                         )}

                         <div className="flex items-center gap-2 pt-2">
                            <Clock className="w-3 h-3 text-zinc-800" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-800">
                               {new Date(msg.timestamp).toLocaleString('pt-BR')}
                            </span>
                         </div>
                      </div>
                   </Card>
                 ))}
               </div>
             )}
          </div>
        ) : (
          /* FORMULÁRIO DE ENVIO */
          <form onSubmit={handleSendMessage} className="bg-zinc-950/40 border border-zinc-900 p-8 md:p-12 rounded-[2.5rem] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-[10px] text-zinc-600 uppercase font-black tracking-widest ml-1">Assunto da Audiência</Label>
                   <Input 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="EX: EXPANSÃO DE LINHAGEM, SOLICITAÇÃO TÉCNICA..."
                      className="bg-black/50 border-zinc-900 h-14 rounded-2xl font-black uppercase tracking-tight text-sm focus-visible:ring-primary/40"
                   />
                </div>
                
                <div className="space-y-2">
                   <Label className="text-[10px] text-zinc-600 uppercase font-black tracking-widest ml-1">Mensagem do Membro</Label>
                   <Textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="REDIJA SEU COMUNICADO COM SOLENIDADE..."
                      className="bg-black/50 border-zinc-900 min-h-[160px] rounded-2xl p-6 font-medium text-zinc-300 focus-visible:ring-primary/40 resize-none"
                   />
                </div>
             </div>

             <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
                <Button 
                   type="submit" 
                   disabled={isSending || !message.trim()}
                   className="w-full md:w-auto h-14 px-10 bg-primary hover:bg-accent text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                   {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Enviar Comunicado</>}
                </Button>
                <div className="flex items-center gap-3 opacity-20">
                   <div className="h-px w-8 bg-zinc-800" />
                   <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Canal Criptografado</p>
                   <div className="h-px w-8 bg-zinc-800" />
                </div>
             </div>
          </form>
        )}
      </section>

      <footer className="pt-10 text-center opacity-10">
         <p className="text-[7px] font-black uppercase tracking-[1em]">Protocolo de Hierarquia Hall Black v5.0</p>
      </footer>
    </div>
  );
}
