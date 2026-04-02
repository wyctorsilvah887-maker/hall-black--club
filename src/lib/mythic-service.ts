'use client';

import { doc, getDoc, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Serviço de validação de chaves de acesso para o Hall Black Club.
 * 
 * POLÍTICA DE USO:
 * O sistema busca o código diretamente pelo ID do documento na coleção 'mythicCodes'.
 * Chaves são inativadas (status: 'activated') após o primeiro registro bem-sucedido.
 */

export async function validateMythicCode(db: Firestore, code: string) {
  // Simula processamento de segurança para feedback visual de elite
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const normalizedCode = code.toUpperCase().trim();

  try {
    // Busca direta pelo ID do documento (o código é o ID)
    const codeRef = doc(db, 'mythicCodes', normalizedCode);
    const codeSnap = await getDoc(codeRef);

    if (!codeSnap.exists()) {
      return { success: false, message: "Chave de Acesso Inválida ou Não Localizada" };
    }

    const codeData = codeSnap.data();
    
    // Normaliza o status vindo do Firestore para evitar erros de digitação (case-insensitive)
    const currentStatus = (codeData.status || '').toString().toLowerCase().trim();

    if (currentStatus !== 'available') {
      return { 
        success: false, 
        message: "Esta chave de acesso já foi ativada por outro membro da elite." 
      };
    }

    return {
      success: true,
      message: "Acesso Validado. Bem-vindo à Elite.",
      profile: {
        name: "Candidato à Elite",
        status: codeData.status_rank || 'MYTHIC',
        theme: codeData.theme || 'mythic',
        codeId: codeSnap.id 
      }
    };
  } catch (error) {
    console.error("Erro na validação de segurança:", error);
    return { success: false, message: "Falha na sincronização com os servidores Hall Black." };
  }
}
