'use client';

import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Serviço de validação de chaves de acesso para o Hall Black Club.
 * Realiza a validação de chaves especiais (Lendário/Âmbar) e chaves místicas únicas no Firestore.
 */

const AMBER_CODES = ["AMBER-LEGEND"];
const LEGENDARY_CODES = ["LEGEND-GOLD"];

export async function validateMythicCode(db: Firestore, code: string) {
  // Simula processamento de segurança para feedback visual de elite
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const normalizedCode = code.toUpperCase().trim();

  // 1. Verificação de Categorias Especiais (Hardcoded para demonstração de acesso administrativo)
  if (LEGENDARY_CODES.includes(normalizedCode)) {
    return {
      success: true,
      message: "ACESSO LENDÁRIO CONCEDIDO",
      profile: {
        name: "Lenda do Hall",
        status: "LEGENDARY",
        theme: "legendary"
      }
    };
  }

  if (AMBER_CODES.includes(normalizedCode)) {
    return {
      success: true,
      message: "MODO LEGENDÁRIO ATIVADO",
      profile: {
        name: "Guardião de Elite",
        status: "AMBER",
        theme: "amber"
      }
    };
  }

  // 2. Verificação de Chaves Míticas Únicas (Firestore)
  try {
    const codesRef = collection(db, 'mythicCodes');
    const q = query(codesRef, where('code', '==', normalizedCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: "Chave de Acesso Inválida ou Não Localizada" };
    }

    const codeDoc = querySnapshot.docs[0];
    const codeData = codeDoc.data();

    if (codeData.status !== 'available') {
      return { 
        success: false, 
        message: "Esta chave de acesso já foi ativada por outro membro da elite." 
      };
    }

    return {
      success: true,
      message: "Acesso Mítico Concedido. Chave Validada.",
      profile: {
        name: "Candidato à Elite",
        status: "MYTHIC",
        theme: "mythic",
        codeId: codeDoc.id // Identificador para inativação durante o registro definitivo
      }
    };
  } catch (error) {
    console.error("Erro na validação de segurança:", error);
    return { success: false, message: "Falha na sincronização com os servidores Hall Black." };
  }
}
