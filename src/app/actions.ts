"use server"

/**
 * @fileOverview Arquivo de Server Actions.
 */

import { sendTransferEmail, type TransferEmailInput } from '@/ai/flows/transfer-email-flow';

export async function sendTransferConfirmationEmail(input: TransferEmailInput) {
  try {
    const result = await sendTransferEmail(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Erro ao processar e-mail de transferência:", error);
    return { success: false, error: "Falha ao acionar sistema de mensageria." };
  }
}

export async function placeholderAction() {
  return { success: true };
}
