
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, FileText, ChevronRight, Zap, ArrowLeft, BookOpen, Share2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [readingArticle, setReadingArticle] = useState<VaultArticle | null>(null);
  
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* SIDEBAR DE PILARES */}
      <div className="lg:col-span-4 space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tighter">O Cofre</h3>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold leading-relaxed">
            Conhecimento técnico avançado, genética e estratégias de elite reservadas aos 60 detentores.
          </p>
        </div>
        
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4 text-zinc-500">
             <Lock className="w-4 h-4" />
             <span className="text-[9px] font-black uppercase tracking-widest">Acreditação: {profile.status}</span>
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
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
              <Lock className="w-8 h-8 text-zinc-800" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] max-w-xs">
              Protocolos {selectedCategory ? "desta categoria" : ""} em processamento mítico.
            </p>
            {selectedCategory && (
              <Button variant="link" onClick={() => setSelectedCategory(null)} className="text-[9px] uppercase tracking-widest font-black text-primary">
                Limpar Filtro
              </Button>
            )}
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
                <CardTitle className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
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
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-zinc-700 hover:text-white cursor-pointer transition-colors" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight">
                  {readingArticle.title}
                </h2>
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
