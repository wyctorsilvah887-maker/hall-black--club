'use client';

import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Serviço de validação de chaves de acesso para o Hall Black Club.
 * 
 * POLÍTICA DE USO:
 * O sistema agora aceita apenas Chaves Míticas Únicas (Firestore).
 * Chaves são inativadas após o primeiro registro bem-sucedido.
 */

export async function validateMythicCode(db: Firestore, code: string) {
  // Simula processamento de segurança para feedback visual de elite
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const normalizedCode = code.toUpperCase().trim();

  // Verificação de Chaves Míticas Únicas (Firestore - Uso Único)
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

    // O status do código será 'MYTHIC' por padrão, a menos que o documento especifique outro.
    return {
      success: true,
      message: "Acesso Mítico Concedido. Chave Validada.",
      profile: {
        name: "Candidato à Elite",
        status: codeData.status_rank || 'MYTHIC',
        theme: codeData.theme || 'mythic',
        codeId: codeDoc.id // Usado no AuthGate para marcar como 'activated'
      }
    };
  } catch (error) {
    console.error("Erro na validação de segurança:", error);
    return { success: false, message: "Falha na sincronização com os servidores Hall Black." };
  }
}
