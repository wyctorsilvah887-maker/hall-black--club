'use client';

import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Serviço de validação de chaves de acesso para o Hall Black Club.
 * 
 * POLÍTICA DE USO:
 * 1. Chaves Hardcoded (Mestras): Uso ilimitado. Destinadas a testes e demonstração.
 * 2. Chaves Firestore (Únicas): Uso único. São inativadas após o primeiro registro bem-sucedido.
 */

const AMBER_CODES = ["AMBER-LEGEND"];
const LEGENDARY_CODES = ["LEGEND-GOLD"];
const MYTHIC_TEST_CODES = ["HB-MYTH-TEST", "HB-MYTH-8X2K", "HB-MYTH-4P9L"];

export async function validateMythicCode(db: Firestore, code: string) {
  // Simula processamento de segurança para feedback visual de elite
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const normalizedCode = code.toUpperCase().trim();

  // 1. Verificação de Categorias Especiais (Chaves Mestras - Uso Ilimitado)
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

  // 2. Verificação de Chaves Míticas de Teste (Chaves Mestras - Uso Ilimitado)
  if (MYTHIC_TEST_CODES.includes(normalizedCode)) {
    return {
      success: true,
      message: "ACESSO MÍTICO DE TESTE CONCEDIDO",
      profile: {
        name: "Membro de Teste",
        status: "MYTHIC",
        theme: "mythic"
      }
    };
  }

  // 3. Verificação de Chaves Míticas Únicas (Firestore - Uso Único)
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
        codeId: codeDoc.id // Usado no AuthGate para marcar como 'activated'
      }
    };
  } catch (error) {
    console.error("Erro na validação de segurança:", error);
    return { success: false, message: "Falha na sincronização com os servidores Hall Black." };
  }
}
