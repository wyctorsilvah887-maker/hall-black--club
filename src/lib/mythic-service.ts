'use client';

import { doc, getDoc, Firestore, collection, query, where, getDocs, limit } from 'firebase/firestore';

/**
 * @fileOverview Serviço de validação de chaves e transferências para o Hall Black Club.
 */

export async function validateMythicCode(db: Firestore, code: string) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const normalizedCode = code.toUpperCase().trim();

  try {
    const codeRef = doc(db, 'mythicCodes', normalizedCode);
    const codeSnap = await getDoc(codeRef);

    if (!codeSnap.exists()) {
      return { success: false, message: "Chave de Acesso Inválida ou Não Localizada" };
    }

    const codeData = codeSnap.data();
    const rawStatus = (codeData.status || '').toString().toLowerCase().trim();
    const currentStatus = rawStatus.replace(/['"]+/g, ''); 

    if (currentStatus !== 'available') {
      return { 
        success: false, 
        message: "Esta chave de acesso já foi ativada ou está indisponível." 
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
    console.error("Erro na validação:", error);
    return { success: false, message: "Falha na sincronização Hall Black." };
  }
}

/**
 * Valida uma solicitação de transferência pendente.
 */
export async function validateTransferClaim(db: Firestore, email: string, code: string) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  try {
    const transferRef = collection(db, 'transferRequests');
    const q = query(
      transferRef, 
      where('toUserEmail', '==', email.toLowerCase().trim()),
      where('confirmationCode', '==', code.trim()),
      where('status', '==', 'pending'),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { 
        success: false, 
        message: "Protocolo de transferência não localizado ou código inválido." 
      };
    }

    const transferDoc = querySnapshot.docs[0];
    const transferData = transferDoc.data();

    return {
      success: true,
      message: "Identidade Cessionária Validada.",
      profile: {
        name: "Novo Titular",
        status: transferData.statusRank || 'MYTHIC',
        theme: transferData.statusRank?.toLowerCase() || 'mythic',
        transferRequestId: transferDoc.id,
        isTransfer: true
      }
    };
  } catch (error) {
    console.error("Erro na validação de transferência:", error);
    return { success: false, message: "Erro ao consultar rede de elite." };
  }
}
