
"use client"

import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, where, increment } from 'firebase/firestore';
import { 
  ShieldCheck, Clock, MessageSquare, CheckCircle2, 
  Loader2, ArrowLeft, Send, Search, Users, 
  LayoutDashboard, UserCog, ChevronRight, X, CreditCard, Award, Zap
} from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Centro de Comando Staff - Alto Conselho Hall Black.
 */

type StaffView = 'dashboard' | 'messages' | 'users';

export default function StaffPanelPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState<StaffView>('dashboard');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [msgFilter, setMsgFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [userSearch, setUserSearch] = useState('');

  // Perfil do Admin
  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

  // Consulta de Mensagens
  const messagesQuery = useMemoFirebase(() => {
    if (!db || userProfile?.role !== 'admin') return null;
    return query(collection(db, 'councilMessages'), orderBy('timestamp', 'desc'));
  }, [db, userProfile]);

  const { data: messages, isLoading: isMessagesLoading } = useCollection(messagesQuery);

  // Consulta de Usuários
  const usersQuery = useMemoFirebase(() => {
    if (!db || userProfile?.role !== 'admin') return null;
    return query(collection(db, 'users'), orderBy('registrationDateTime', 'desc'));
  }, [db, userProfile]);

  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

  const filteredMessages = messages?.filter(m => {
    if (msgFilter === 'all') return true;
    return m.status === msgFilter;
  });

  const filteredUsers = allUsers?.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

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
      toast({ title: "VEREDITO EMITIDO", description: `O membro foi notificado.` });
      setSelectedMessage(null);
      setReplyText('');
    } catch (error) {
      toast({ variant: "destructive", title: "FALHA", description: "Erro ao enviar resposta." });
    } finally { setIsReplying(false); }
  };

  const handleToggleRole = (targetUser: any) => {
    if (!db) return;
    const newRole = targetUser.role === 'admin' ? 'member' : 'admin';
    const targetRef = doc(db, 'users', targetUser.id);
    updateDocumentNonBlocking(targetRef, { role: newRole });
    toast({ 
      title: "PERMISSÃO ALTERADA", 
      description: `Membro ${targetUser.name} agora é ${newRole.toUpperCase()}.` 
    });
  };

  const handleConfirmPayment = (targetUser: any) => {
    if (!db) return;
    const targetRef = doc(db, 'users', targetUser.id);
    updateDocumentNonBlocking(targetRef, { 
      eliteScore: increment(100)
    });
    toast({ 
      title: "PAGAMENTO CONFIRMADO", 
      description: `+100 Pontos de Elite creditados para ${targetUser.name}.` 
    });
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
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Terminal Restrito</h1>
        <p className="text-zinc-600 text-xs uppercase tracking-widest max-w-xs mb-8">Apenas o Alto Conselho possui as chaves deste terminal.</p>
        <Button asChild variant="outline" className="border-zinc-800 rounded-full h-12 px-8">
          <Link href="/">Retornar ao Hub</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary/30 pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {currentView !== 'dashboard' && (
                <button onClick={() => setCurrentView('dashboard')} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                {currentView === 'dashboard' ? 'Centro de Comando' : 
                 currentView === 'messages' ? 'Protocolos' : 'Gestão de Membros'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
               <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black tracking-[0.2em] px-3 py-1">STAFF TERMINAL</Badge>
               <span className="text-zinc-700 text-[9px] font-bold uppercase tracking-widest">Protocolo Apex v2.0</span>
            </div>
          </div>
        </header>

        {/* DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <button 
              onClick={() => setCurrentView('messages')}
              className="group text-left p-10 rounded-[3rem] bg-zinc-950 border border-zinc-900 hover:border-primary transition-all flex flex-col justify-between aspect-video md:aspect-auto"
            >
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Protocolo de Audiência</h3>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                    Responda aos comunicados oficiais e emita vereditos do Alto Conselho.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-10">
                <Badge variant="outline" className="border-zinc-800 text-primary text-[9px] px-4">{messages?.filter(m => m.status === 'pending').length || 0} PENDENTES</Badge>
                <ChevronRight className="w-6 h-6 text-zinc-800 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>

            <button 
              onClick={() => setCurrentView('users')}
              className="group text-left p-10 rounded-[3rem] bg-zinc-950 border border-zinc-900 hover:border-zinc-500 transition-all flex flex-col justify-between aspect-video md:aspect-auto"
            >
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCog className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Gestão de Membros</h3>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                    Controle de linhagem, rankings e permissões administrativas da rede.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-10">
                <Badge variant="outline" className="border-zinc-800 text-white text-[9px] px-4">{allUsers?.length || 0} MEMBROS</Badge>
                <ChevronRight className="w-6 h-6 text-zinc-800 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
          </div>
        )}

        {/* MESSAGES VIEW */}
        {currentView === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-500">
            <aside className="lg:col-span-4 space-y-6">
              <div className="flex gap-2">
                {['all', 'pending', 'replied'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setMsgFilter(f as any)}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all",
                      msgFilter === f ? "bg-primary border-primary text-white" : "border-zinc-900 text-zinc-600"
                    )}
                  >
                    {f === 'all' ? 'Tudo' : f === 'pending' ? 'Pendentes' : 'Concluídos'}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {isMessagesLoading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-zinc-900/40 rounded-2xl animate-pulse" />)
                ) : filteredMessages?.length === 0 ? (
                  <div className="p-10 border border-dashed border-zinc-900 rounded-3xl text-center">
                    <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">Vazio</p>
                  </div>
                ) : (
                  filteredMessages?.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => { setSelectedMessage(msg); setReplyText(msg.reply || ''); }}
                      className={cn(
                        "w-full text-left p-6 rounded-2xl border transition-all space-y-3",
                        selectedMessage?.id === msg.id ? "bg-zinc-900 border-primary" : "bg-zinc-950/40 border-zinc-900"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{msg.userName}</span>
                        <Badge variant="outline" className={cn("text-[7px] px-2", msg.status === 'replied' ? "border-green-900 text-green-500" : "border-primary/40 text-primary")}>
                          {msg.status === 'replied' ? 'OK' : 'WAIT'}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-black uppercase truncate">{msg.subject}</h4>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className="lg:col-span-8">
              {selectedMessage ? (
                <Card className="bg-zinc-950 border-zinc-900 p-8 md:p-12 rounded-[3rem] space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black uppercase tracking-tighter">{selectedMessage.subject}</h3>
                    <p className="text-zinc-400 text-sm italic font-medium leading-relaxed">"{selectedMessage.message}"</p>
                  </div>
                  <div className="space-y-4 pt-6 border-t border-zinc-900">
                    <Label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Parecer do Alto Conselho</Label>
                    <Textarea 
                      value={replyText} 
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="ESCREVA A RESPOSTA OFICIAL..."
                      className="bg-black border-zinc-900 min-h-[150px] rounded-2xl text-sm"
                    />
                    <Button onClick={handleSendReply} disabled={isReplying || !replyText.trim()} className="w-full h-14 bg-primary rounded-2xl font-black uppercase tracking-widest">
                      {isReplying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Emitir Veredito'}
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 border border-dashed border-zinc-900 rounded-[3rem] opacity-20">
                  <MessageSquare className="w-16 h-16 mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Selecione uma audiência</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* USERS VIEW */}
        {currentView === 'users' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <Input 
                placeholder="BUSCAR POR NOME OU E-MAIL..." 
                className="bg-zinc-950 border-zinc-900 h-14 pl-12 rounded-2xl font-bold uppercase text-xs"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <Card className="bg-zinc-950 border-zinc-900 rounded-[2.5rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900/50 border-b border-zinc-900">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Membro</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Patente</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Elite Score</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {isUsersLoading ? (
                      Array(5).fill(0).map((_, i) => <tr key={i} className="h-16 bg-zinc-900/20 animate-pulse" />)
                    ) : filteredUsers?.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black uppercase">{u.name}</span>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant="outline" className="border-zinc-800 text-[8px] font-black tracking-widest">
                            {u.status || 'MASTER'}
                          </Badge>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <Zap className="w-3 h-3 text-primary" />
                             <span className="text-xs font-black">{u.eliteScore || 0}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleConfirmPayment(u)}
                              className="h-8 border-primary/30 text-[9px] font-black uppercase tracking-widest hover:bg-primary/10"
                            >
                              <CreditCard className="w-3 h-3 mr-1" /> Mensalidade
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleRole(u)}
                              className="h-8 text-[9px] font-black uppercase tracking-widest hover:text-primary"
                            >
                              {u.role === 'admin' ? 'Membro' : 'Admin'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

      </div>
    </main>
  );
}
