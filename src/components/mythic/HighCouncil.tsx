
"use client"

import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { User, ShieldCheck, MapPin } from "lucide-react";
import Image from 'next/image';

export function HighCouncil({ profile }: { profile: any }) {
  const db = useFirestore();
  const councilQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'users'), 
      where('status', '!=', 'REVOKED'),
      orderBy('memberNumber', 'asc'),
      limit(60)
    );
  }, [db]);
  
  const { data: members, isLoading } = useCollection(councilQuery as any);

  const isLegendary = profile.status === 'LEGENDARY';
  const isAmber = profile.status === 'AMBER';
  const themeColor = isLegendary ? 'text-yellow-500' : isAmber ? 'text-orange-500' : 'text-primary';

  return (
    <div className="space-y-12">
      <div className="max-w-xl space-y-4">
        <h3 className="text-3xl font-black uppercase tracking-tighter">Alto Conselho</h3>
        <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-bold leading-relaxed">
          Os 60 detentores das chaves Hall Black. Uma linhagem de prestígio e influência no mundo pet.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {isLoading ? (
          Array(12).fill(0).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-zinc-900/20 rounded-[1.5rem] animate-pulse" />
          ))
        ) : members?.map((member) => (
          <div 
            key={member.id} 
            className="group relative aspect-[3/4] bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden hover:border-zinc-700 transition-all duration-700"
          >
            {member.photo ? (
              <Image 
                src={member.photo} 
                alt={member.name} 
                fill 
                className="object-cover opacity-40 group-hover:opacity-80 transition-opacity grayscale group-hover:grayscale-0 duration-700" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-zinc-900" />
              </div>
            )}
            
            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent space-y-1">
              <p className="text-[9px] font-black text-white uppercase tracking-tighter truncate">{member.name}</p>
              <div className="flex items-center justify-between">
                <span className={`text-[7px] font-black uppercase tracking-widest ${member.status === 'LEGENDARY' ? 'text-yellow-500' : member.status === 'AMBER' ? 'text-orange-500' : 'text-primary'}`}>
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
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
               <ShieldCheck className={`w-4 h-4 ${member.status === 'LEGENDARY' ? 'text-yellow-500' : member.status === 'AMBER' ? 'text-orange-500' : 'text-primary'}`} />
            </div>
          </div>
        ))}
        
        {/* SLOTS VAZIOS */}
        {members && members.length < 60 && Array(60 - members.length).fill(0).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-[3/4] bg-zinc-950/20 border border-zinc-900 border-dashed rounded-[2rem] flex flex-col items-center justify-center opacity-20">
             <Lock className="w-6 h-6 mb-2" />
             <span className="text-[7px] font-black uppercase tracking-widest">Aguardando Sucessão</span>
          </div>
        ))}
      </div>
    </div>
  );
}
