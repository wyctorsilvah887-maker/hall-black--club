"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, FileText, ChevronRight, Zap, ArrowLeft, BookOpen, DatabaseZap, Loader2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * @fileOverview O Cofre (The Vault).
 * Repositório central de conhecimento técnico e estratégico.
 * Filtra conteúdos por pilares de Genética, Biohacking e Patrimônio.
 */

interface VaultArticle {
  id: string;
  title: string;
  category: 'GENETICS' | 'HEALTH' | 'LIFESTYLE';
  content: string;
  timestamp: string;
  restrictedTo?: string;
}

export function TheVault({ profile }: { profile: any }) {
  const db = useFirestore();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [readingArticle, setReadingArticle] = useState<VaultArticle | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  
  const vaultQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'vault'), orderBy('timestamp', 'desc'));
  }, [db]);
  
  const { data: articles, isLoading } = useCollection<VaultArticle>(vaultQuery as any);

  const categories = [
    { id: 'GENETICS', label: 'Genética Avançada', icon: Zap },
    { id: 'HEALTH', label: 'Biohacking Pet', icon: Zap },
    { id: 'LIFESTYLE', label: 'Patrimônio Elite', icon: Zap },
  ];

  const filteredArticles = articles?.filter(art => 
    !selectedCategory || art.category === selectedCategory
  );

  const themeColor = 'text-primary';

  const handleSeedData = async () => {
    if (!db) return;
    setIsBootstrapping(true);
    
    const sampleArticles = [
      {
        title: "PROTOCOLO G-26: PUREZA DE LINHAGEM",
        category: "GENETICS",
        content: "Este documento detalha o mapeamento genômico necessário para manter a acreditação Hall Black. O foco é na estabilidade dos marcadores de elite através das gerações, garantindo que a sucessão biológica mantenha os padrões exigidos pelo Alto Conselho. Analisamos a preservação de traços dominantes e a eliminação de recessividades indesejadas na linhagem suprema.",
        timestamp: new Date().toISOString(),
        restrictedTo: "MASTER"
      },
      {
        title: "BIOHACKING: SUPREMACIA VITAL",
        category: "HEALTH",
        content: "Guia técnico sobre suplementação molecular e regimes de bio-otimização para estender o ápice físico da linhagem pet. Abordamos a modulação dietética de precisão, o uso de nutracêuticos de quarta geração e protocolos de recuperação celular acelerada. O objetivo é a longevidade ativa, mantendo o vigor de um campeão por décadas.",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        restrictedTo: "MASTER"
      },
      {
        title: "PATRIMÔNIO: O VALOR DA REDE",
        category: "LIFESTYLE",
        content: "Uma análise estratégica sobre a escassez das 60 chaves originais do Hall Black Club. Este protocolo discute o valor intrínseco de pertencer a um ecossistema fechado de influência, as regras de sucessão patrimonial para as credenciais e como o prestígio acumulado do tutor se traduz em ativos reais dentro da rede de elite.",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        restrictedTo: "MASTER"
      }
    ];

    try {
      const vaultRef = collection(db, 'vault');
      for (const art of sampleArticles) {
        addDocumentNonBlocking(vaultRef, art);
      }
      toast({
        title: "PROTOCOLO INICIALIZADO",
        description: "Os arquivos de elite foram sincronizados com o seu Cofre.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "FALHA NA SINCRONIZAÇÃO",
        description: "Não foi possível acessar a rede de dados.",
      });
    } finally {
      setIsBootstrapping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* SIDEBAR DE PILARES */}
      <div className="lg:col-span-4 space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white">O Cofre</h3>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold leading-relaxed">
            Conhecimento técnico avançado, genética e estratégias de elite reservadas aos 60 detentores.
          </p>
        </div>
        
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4 text-zinc-500">
             <Lock className="w-4 h-4" />
             <span className="text-[9px] font-black uppercase tracking-widest">Patente: {profile.status}</span>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest",
                !selectedCategory ? "bg-primary/10 text-primary border border-primary/20" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Ver Tudo
            </button>
            {categories.map((cat) => (
               <button 
                 key={cat.id}
                 onClick={() => setSelectedCategory(cat.id)}
                 className={cn(
                   "w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest border",
                   selectedCategory === cat.id 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-transparent border-transparent text-zinc-500 hover:bg-zinc-900/40 hover:text-zinc-300"
                 )}
               >
                 {cat.label}
                 <cat.icon className={cn("w-3.5 h-3.5", selectedCategory === cat.id ? themeColor : "opacity-20")} />
               </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRADE DE DOCUMENTOS */}
      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-zinc-900/20 rounded-[2.5rem] animate-pulse border border-zinc-900" />
          ))
        ) : !filteredArticles || filteredArticles.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center opacity-30">
              <Lock className="w-8 h-8 text-zinc-800" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 max-w-xs mx-auto">
                Protocolos {selectedCategory ? "desta categoria" : ""} em processamento mítico.
              </p>
              {!articles || articles.length === 0 ? (
                <Button 
                  onClick={handleSeedData}
                  disabled={isBootstrapping}
                  variant="outline" 
                  className="mt-4 border-primary/30 text-primary hover:bg-primary/10 text-[9px] font-black uppercase tracking-widest h-10 px-6 rounded-full"
                >
                  {isBootstrapping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <DatabaseZap className="w-3 h-3 mr-2" />
                      Inicializar Protocolos de Elite
                    </>
                  )}
                </Button>
              ) : (
                <Button variant="link" onClick={() => setSelectedCategory(null)} className="text-[9px] uppercase tracking-widest font-black text-primary">
                  Limpar Filtro
                </Button>
              )}
            </div>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <Card key={article.id} className="bg-zinc-950/40 border-zinc-900 rounded-[2.5rem] overflow-hidden group hover:border-zinc-800 transition-all flex flex-col">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className={cn("border-zinc-800 text-[8px] font-black tracking-widest", themeColor)}>
                    {categories.find(c => c.id === article.category)?.label || article.category}
                  </Badge>
                  <FileText className="w-4 h-4 text-zinc-800 group-hover:text-zinc-500 transition-colors" />
                </div>
                <CardTitle className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-tight text-white">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-wider line-clamp-3 mb-6">
                  {article.content}
                </p>
                <Button 
                  onClick={() => setReadingArticle(article)}
                  variant="link" 
                  className={cn("p-0 h-auto text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 self-start", themeColor)}
                >
                  Acessar Documento <ChevronRight className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* LEITOR DE ARTIGOS */}
      <Dialog open={!!readingArticle} onOpenChange={(open) => !open && setReadingArticle(null)}>
        <DialogContent className="bg-black border-zinc-900 text-white max-w-2xl w-[95vw] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl z-[200]">
          {readingArticle && (
            <div className="flex flex-col max-h-[90vh]">
              {/* HEADER DO LEITOR */}
              <div className="p-8 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className={cn("border-zinc-800 text-[9px] font-black tracking-widest uppercase", themeColor)}>
                    {categories.find(c => c.id === readingArticle.category)?.label}
                  </Badge>
                </div>
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight text-white">
                    {readingArticle.title}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Documento restrito: {readingArticle.title}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-4 mt-4 text-zinc-600">
                  <span className="text-[8px] font-black uppercase tracking-widest">Ref: HB-DOC-{readingArticle.id.substring(0,6).toUpperCase()}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Sincronizado: {new Date(readingArticle.timestamp).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* CONTEÚDO DO LEITOR */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 prose prose-invert">
                <div className="flex items-start gap-4 p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl">
                  <BookOpen className={cn("w-5 h-5 flex-shrink-0 mt-1", themeColor)} />
                  <p className="text-sm font-medium text-zinc-300 leading-relaxed italic">
                    "Este documento é de uso restrito da elite Hall Black. A reprodução sem autorização do Alto Conselho resultará em revogação imediata da credencial."
                  </p>
                </div>
                
                <div className="text-zinc-400 text-sm md:text-base leading-relaxed space-y-6 font-medium">
                  {readingArticle.content.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                <div className="pt-8 border-t border-zinc-900 flex flex-col items-center text-center gap-4">
                  <Zap className={cn("w-6 h-6 opacity-20", themeColor)} />
                  <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em]">
                    Fim do Protocolo de Inteligência
                  </p>
                </div>
              </div>

              {/* FOOTER DO LEITOR */}
              <div className="p-6 bg-zinc-950 border-t border-zinc-900 flex justify-center">
                <Button 
                  onClick={() => setReadingArticle(null)}
                  variant="ghost" 
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white"
                >
                  Fechar Documento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}