
"use client"

import React, { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, orderBy, doc, limit } from 'firebase/firestore';
import { calculateRankByTime, getThemeClass } from '@/lib/rank-utils';
import { TopHeader } from '@/components/mythic/TopHeader';
import { EliteLoader } from '@/components/mythic/EliteLoader';
import { 
  Bell, ShieldCheck, ArrowLeft, Zap, Info, 
  MessageSquare, AlertTriangle, ChevronRight, Sparkles, DatabaseZap
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Centro de Notificações - Sovereign Founders Club.
 * Exibe alertas estratégicos, comunicados do conselho e notificações de sistema.
 */

export default function NotificationsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  const userRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  // Consulta de notificações otimizada
  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || !profile) return null;
    return query(
      collection(db, 'notifications'),
      where('userId', 'in', [user.uid, 'global']),
      limit(20)
    );
  }, [db, user, profile]);

  const { data: notificationsData, isLoading: isNotifsLoading } = useCollection(notificationsQuery);

  // Ordenação manual no cliente para evitar a necessidade de índices compostos complexos no início
  const notifications = React.useMemo(() => {
    if (!notificationsData) return [];
    return [...notificationsData].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [notificationsData]);

  const handleSeedNotifications = async () => {
    if (!db || !user?.uid || profile?.role !== 'admin') return;
    setIsBootstrapping(true);
    try {
      const notifsRef = collection(db, 'notifications');
      const samples = [
        {
          title: "Veredito do Conselho",
          content: "Sua solicitação de upgrade de patente foi aprovada pelo Alto Conselho. Seu prestígio foi atualizado.",
          type: "COUNCIL",
          userId: user.uid,
          isRead: false,
          timestamp: new Date().toISOString()
        },
        {
          title: "Protocolo de Segurança Ativo",
          content: "O sistema detectou um novo acesso à sua credencial. Verifique suas sessões ativas no terminal.",
          type: "SYSTEM",
          userId: user.uid,
          isRead: false,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          title: "Alerta de Inteligência",
          content: "Novas estratégias de SaaS High-Ticket foram adicionadas ao Cofre. Acesse agora para análise.",
          type: "STRATEGIC",
          userId: 'global',
          isRead: false,
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      for (const s of samples) {
        await addDocumentNonBlocking(notifsRef, s);
      }
      toast({ title: "NOTIFICAÇÕES SINCRONIZADAS", description: "O log de alertas foi atualizado." });
    } catch (err) {
      toast({ variant: "destructive", title: "ERRO", description: "Falha ao gerar alertas." });
    } finally {
      setIsBootstrapping(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return <EliteLoader />;
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-zinc-900 mb-6" />
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Acesso Negado</h1>
        <Link href="/" className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Voltar ao Portal</Link>
      </div>
    );
  }

  const currentRank = calculateRankByTime(profile.registrationDateTime, profile.status);
  const themeClass = getThemeClass(currentRank);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'STRATEGIC': return <Zap className="w-4 h-4 text-primary" />;
      case 'COUNCIL': return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case 'SYSTEM': return <ShieldCheck className="w-4 h-4 text-zinc-400" />;
      default: return <Info className="w-4 h-4 text-zinc-600" />;
    }
  };

  return (
    <main className={cn("min-h-screen bg-black text-white selection:bg-primary/30 flex flex-col", themeClass)}>
      
      <TopHeader profile={profile} />

      <div className="absolute top-24 left-6 z-50">
        <Link href="/hub" className="p-3 bg-black/40 backdrop-blur-xl border border-zinc-900 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90 shadow-2xl">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 pt-32 pb-20 space-y-12">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
           <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                 <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                 <h1 className="text-3xl font-black uppercase tracking-tighter">Notificações</h1>
                 <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold">Log de Alertas Estratégicos</p>
              </div>
           </div>
           
           {profile.role === 'admin' && notifications.length === 0 && (
              <Button 
                onClick={handleSeedNotifications} 
                disabled={isBootstrapping}
                variant="outline" 
                className="h-10 rounded-xl border-primary/30 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/10"
              >
                {isBootstrapping ? <Sparkles className="w-3 h-3 animate-spin mr-2" /> : <DatabaseZap className="w-3 h-3 mr-2" />}
                Inicializar Alertas
              </Button>
           )}
        </header>

        <div className="space-y-4">
          {isNotifsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-zinc-900/20 border border-zinc-900 rounded-3xl animate-pulse" />
            ))
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-zinc-900 rounded-[3rem] opacity-30">
               <Bell className="w-12 h-12 mx-auto mb-4 text-zinc-800" />
               <p className="text-[10px] font-black uppercase tracking-widest">Nenhum alerta registrado no ciclo atual.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <Card key={notif.id} className="bg-zinc-950/40 border-zinc-900 p-6 md:p-8 rounded-[2rem] hover:border-zinc-800 transition-all group relative overflow-hidden">
                <div className="flex items-start gap-5 relative z-10">
                   <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-xl bg-black border border-zinc-900 flex items-center justify-center shadow-inner">
                         {getNotifIcon(notif.type)}
                      </div>
                   </div>
                   <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                         <h3 className="text-sm md:text-base font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">
                           {notif.title}
                         </h3>
                         <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                           {new Date(notif.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                         </span>
                      </div>
                      <p className="text-zinc-400 text-xs md:text-sm font-medium leading-relaxed">
                        {notif.content}
                      </p>
                   </div>
                   <div className="flex-shrink-0 self-center">
                      <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-primary transition-all group-hover:translate-x-1" />
                   </div>
                </div>
                {!notif.isRead && (
                  <div className="absolute top-0 right-0 p-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        <footer className="pt-20 text-center opacity-10">
          <p className="text-[8px] font-black uppercase tracking-[1em]">Notification Secure Protocol</p>
        </footer>
      </div>
    </main>
  );
}
