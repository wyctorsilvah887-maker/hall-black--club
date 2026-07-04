
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, FileText, ChevronRight, Zap } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export function TheVault({ profile }: { profile: any }) {
  const db = useFirestore();
  
  const vaultQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'vault'), orderBy('timestamp', 'desc'));
  }, [db]);
  
  const { data: articles, isLoading } = useCollection(vaultQuery as any);

  const isLegendary = profile.status === 'LEGENDARY';
  const isAmber = profile.status === 'AMBER';
  const themeColor = isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-4 space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tighter">O Cofre</h3>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold leading-relaxed">
            Conhecimento técnico avançado, genética e estratégias de elite reservadas aos 60.
          </p>
        </div>
        
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4 text-zinc-500">
             <Lock className="w-4 h-4" />
             <span className="text-[9px] font-black uppercase tracking-widest">Nível de Acesso: {profile.status}</span>
          </div>
          <div className="space-y-4">
             {['Genética Avançada', 'Biohacking Pet', 'Patrimônio Elite'].map((cat) => (
               <div key={cat} className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-zinc-300">
                 {cat}
                 <Zap className="w-3 h-3 opacity-20" />
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-zinc-900/20 rounded-[2.5rem] animate-pulse border border-zinc-900" />
          ))
        ) : !articles || articles.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4 opacity-30">
            <Lock className="w-12 h-12 mx-auto text-zinc-800" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Arquivos em Processamento Mítico</p>
          </div>
        ) : (
          articles.map((article) => (
            <Card key={article.id} className="bg-zinc-950/40 border-zinc-900 rounded-[2.5rem] overflow-hidden group hover:border-zinc-800 transition-all">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className={`border-zinc-800 text-[8px] font-black tracking-widest ${themeColor}`}>
                    {article.category}
                  </Badge>
                  <FileText className="w-4 h-4 text-zinc-800 group-hover:text-zinc-500 transition-colors" />
                </div>
                <CardTitle className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex flex-col justify-between h-32">
                <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-wider line-clamp-2">
                  {article.content.substring(0, 100)}...
                </p>
                <Button variant="link" className={`p-0 h-auto text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${themeColor}`}>
                  Acessar Documento <ChevronRight className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
