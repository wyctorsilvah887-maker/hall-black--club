"use client"

import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { 
  User, ShieldCheck, MapPin, Lock, MessageSquare, Send, 
  Clock, Loader2, Trophy, Medal, Star, Users, LayoutGrid 
} from "lucide-react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { RankBadge } from './MythicIcons';

/**
 * @fileOverview Seção do Conselho com sub-navegação: Linhagem, Ranking e Audiência.
 */

type CouncilTab = 'members' | 'ranking' | 'audience';

export function HighCouncil({ profile }: { profile: any }) {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<CouncilTab>('members');
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

  const rankedMembers = [...members].sort((a, b) => (b.pedigreeScore || 0) - (a.pedigreeScore || 0));

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
      setShowInbox(true);
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
    <div className="space-y-16">
      
      {/* SUB-NAVEGAÇÃO DO CONSELHO */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-900 pb-8">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-black uppercase tracking-tighter">O Alto Conselho</h3>
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Protocolo de Hierarquia Hall Black v5.0</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-zinc-950 border border-zinc-900 rounded-2xl">
          {[
            { id: 'members', label: 'Linhagem', icon: LayoutGrid },
            { id: 'ranking', label: 'Ranking', icon: Trophy },
            { id: 'audience', label: 'Audiência', icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTEÚDO DINÂMICO */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* ABA: LINHAGEM (GALLERY) */}
        {activeTab === 'members' && (
          <section className="space-y-10">
            <div className="max-w-xl space-y-4">
              <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-bold leading-relaxed">
                Os detentores das chaves originais. Uma linhagem de prestígio que governa o ecossistema Hall Black.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {isMembersLoading ? (
                Array(12).fill(0).map((_, i) => (
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
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black via-black/90 to-transparent space-y-1">
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
              {!isMembersLoading && Array(Math.max(0, 12 - members.length)).fill(0).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-[3/4] bg-zinc-950/20 border border-zinc-900 border-dashed rounded-[2rem] flex flex-col items-center justify-center opacity-10">
                   <Lock className="w-6 h-6 mb-2" />
                   <span className="text-[7px] font-black uppercase tracking-widest text-center px-4">Aguardando Sucessão</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ABA: RANKING */}
        {activeTab === 'ranking' && (
          <section className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <Trophy className="w-12 h-12 text-primary mx-auto animate-bounce" />
              <h3 className="text-3xl font-black uppercase tracking-tighter">Ranking de Prestígio</h3>
              <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-bold">Os Pilares da Linhagem Hall Black</p>
            </div>

            <div className="space-y-4">
              {isMembersLoading ? (
                Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-zinc-900/20 rounded-2xl animate-pulse" />)
              ) : rankedMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className={cn(
                    "flex items-center justify-between p-5 md:p-6 rounded-[2rem] border transition-all duration-500",
                    index === 0 ? "bg-primary/5 border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.1)]" : "bg-zinc-950 border-zinc-900"
                  )}
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    <div className="relative w-10 md:w-14 flex items-center justify-center">
                      {index === 0 ? <Star className="w-6 h-6 text-primary fill-primary" /> :
                       index === 1 ? <Medal className="w-6 h-6 text-yellow-500" /> :
                       index === 2 ? <Medal className="w-6 h-6 text-zinc-400" /> :
                       <span className="text-lg font-black text-zinc-800">#{index + 1}</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 overflow-hidden relative border border-zinc-800">
                        {member.photo ? <Image src={member.photo} alt={member.name} fill className="object-cover" unoptimized /> : <User className="w-full h-full p-2 text-zinc-800" />}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black uppercase tracking-tight text-white">{member.name}</p>
                        <div className="flex items-center gap-2">
                           <span className="text-[8px] font-black text-primary uppercase tracking-widest">#{member.memberNumber?.toString().padStart(2, '0')}</span>
                           <span className="w-1 h-1 rounded-full bg-zinc-800" />
                           <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{member.city || 'Hall Black'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl md:text-2xl font-black text-white tracking-tighter">{member.pedigreeScore || '100'}</p>
                    <p className="text-[7px] font-black text-zinc-700 uppercase tracking-widest">Pedigree Score</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ABA: AUDIÊNCIA */}
        {activeTab === 'audience' && (
          <section className="space-y-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
              <div className="space-y-2">
                 <h3 className="text-2xl font-black uppercase tracking-tighter">Protocolo de Audiência</h3>
                 <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Canal Criptografado de Elite</p>
              </div>
              <Button 
                onClick={() => setShowInbox(!showInbox)}
                variant="outline" 
                className="h-11 rounded-2xl border-zinc-800 text-[9px] font-black uppercase tracking-widest hover:bg-zinc-900"
              >
                {showInbox ? 'Abrir Formulário' : `Ver Mensagens (${myMessages?.length || 0})`}
              </Button>
            </div>

            {showInbox ? (
              <div className="space-y-6">
                 {isMessagesLoading ? (
                   <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-zinc-800" /></div>
                 ) : !myMessages || myMessages.length === 0 ? (
                   <div className="text-center py-20 bg-zinc-950/40 rounded-[2rem] border border-zinc-900 border-dashed">
                      <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Nenhuma audiência registrada.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-4">
                     {myMessages.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((msg) => (
                       <Card key={msg.id} className="bg-zinc-950/40 border-zinc-900 rounded-3xl overflow-hidden p-6 space-y-6">
                          <div className="flex items-start justify-between gap-4">
                             <div className="space-y-1">
                                <p className="text-[7px] text-zinc-600 uppercase font-black tracking-widest">Ref: {msg.id.substring(0,8).toUpperCase()}</p>
                                <h4 className="text-white font-black uppercase tracking-tight text-sm">{msg.subject}</h4>
                             </div>
                             <Badge variant="outline" className={cn(
                               "py-1 px-3 rounded-full text-[7px] font-black tracking-widest border-zinc-800",
                               msg.status === 'replied' ? "text-green-500 bg-green-500/10" : "text-primary bg-primary/10 animate-pulse"
                             )}>
                               {msg.status === 'replied' ? 'CONCLUÍDO' : 'EM ANÁLISE'}
                             </Badge>
                          </div>
                          <p className="text-zinc-500 text-xs font-medium italic">"{msg.message}"</p>
                          {msg.reply && (
                            <div className="pt-6 border-t border-zinc-900/50 space-y-2">
                               <p className="text-[8px] font-black uppercase tracking-widest text-primary">Parecer do Conselho</p>
                               <p className="text-white text-xs font-bold leading-relaxed">{msg.reply}</p>
                            </div>
                          )}
                       </Card>
                     ))}
                   </div>
                 )}
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="bg-zinc-950/40 border border-zinc-900 p-8 md:p-12 rounded-[2.5rem] space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] text-zinc-600 uppercase font-black tracking-widest ml-1">Assunto Estratégico</Label>
                       <Input 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="EX: EXPANSÃO, SOLICITAÇÃO TÉCNICA..."
                          className="bg-black/50 border-zinc-900 h-14 rounded-2xl font-black uppercase text-xs"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] text-zinc-600 uppercase font-black tracking-widest ml-1">Comunicado Oficial</Label>
                       <Textarea 
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          placeholder="REDIJA SEU COMUNICADO COM SOLENIDADE..."
                          className="bg-black/50 border-zinc-900 min-h-[160px] rounded-2xl p-6 font-medium text-zinc-300 resize-none"
                       />
                    </div>
                 </div>
                 <Button 
                   type="submit" 
                   disabled={isSending || !message.trim()}
                   className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-primary/20"
                 >
                   {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Emitir Protocolo</>}
                 </Button>
              </form>
            )}
          </section>
        )}
      </div>

      <footer className="pt-20 text-center opacity-10">
         <p className="text-[7px] font-black uppercase tracking-[1em]">Conselho Hall Black Identity Protocol</p>
      </footer>
    </div>
  );
}
