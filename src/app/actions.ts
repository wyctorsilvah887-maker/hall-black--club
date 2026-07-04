
"use server"

/**
 * @fileOverview Arquivo de Server Actions unificado.
 */

import { sendTransferEmail, type TransferEmailInput } from '@/ai/flows/transfer-email-flow';
import { askBlackAdvisor, type AdvisoryInput } from '@/ai/flows/advisor-flow';

export async function sendTransferConfirmationEmail(input: TransferEmailInput) {
  try {
    const result = await sendTransferEmail(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Erro ao processar e-mail de transferência:", error);
    return { success: false, error: "Falha ao acionar sistema de mensageria." };
  }
}

export async function consultBlackAdvisor(input: AdvisoryInput) {
  try {
    const result = await askBlackAdvisor(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Erro no advisor:", error);
    return { success: false, error: "Sistema Advisor indisponível no momento." };
  }
}
