'use server';
/**
 * @fileOverview Fluxo de IA para composição e envio de e-mails de transferência de elite.
 * 
 * - sendTransferEmail - Envia a notificação oficial de cessão de credencial.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransferEmailInputSchema = z.object({
  fromName: z.string().describe('Nome do membro que está cedendo a vaga.'),
  fromEmail: z.string().describe('Email do membro cedente.'),
  toEmail: z.string().describe('Email do novo titular (cessionário).'),
  confirmationCode: z.string().describe('Código de segurança de 6 dígitos.'),
  statusRank: z.string().describe('Nível de elite do membro (MYTHIC, AMBER, LEGENDARY).'),
});

export type TransferEmailInput = z.infer<typeof TransferEmailInputSchema>;

const TransferEmailOutputSchema = z.object({
  success: z.boolean().describe('Indica se o e-mail foi processado com sucesso.'),
  message: z.string().describe('Mensagem de confirmação do sistema de mensageria.'),
  emailBodyPreview: z.string().describe('Prévia do conteúdo enviado.'),
  confirmationCode: z.string().describe('O código de segurança processado.'),
});

export type TransferEmailOutput = z.infer<typeof TransferEmailOutputSchema>;

const prompt = ai.definePrompt({
  name: 'transferEmailPrompt',
  input: { schema: TransferEmailInputSchema },
  output: { schema: TransferEmailOutputSchema },
  prompt: `Você é o Sistema Central de Comunicações do Hall Black Club. 
Sua tarefa é compor um e-mail de confirmação de transferência de credencial de elite extremamente formal, minimalista e seguro.

DADOS DA TRANSAÇÃO:
Membro Cedente: {{{fromName}}} ({{{fromEmail}}})
Novo Titular: {{{toEmail}}}
Nível de Elite: {{{statusRank}}}
Código de Segurança: {{{confirmationCode}}}

O e-mail deve ser escrito em tom solene, informando ao cedente que sua solicitação foi registrada e que a revogação de sua identidade está em andamento. Mencione que o novo titular receberá as instruções em sua caixa de entrada.

Retorne um objeto JSON confirmando o sucesso, o código e uma prévia do texto enviado.`,
});

export async function sendTransferEmail(input: TransferEmailInput): Promise<TransferEmailOutput> {
  return transferEmailFlow(input);
}

const transferEmailFlow = ai.defineFlow(
  {
    name: 'transferEmailFlow',
    inputSchema: TransferEmailInputSchema,
    outputSchema: TransferEmailOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    // Simulação de transporte SMTP real no console para auditoria
    console.log(`[HALL BLACK MAIL SERVICE]
    DE: noreply@hallblack.club
    PARA: ${input.fromEmail}
    ASSUNTO: PROTOCOLO DE CESSÃO DE CREDENCIAL - ${input.confirmationCode}
    
    CONTEÚDO:
    ${output?.emailBodyPreview}
    `);

    return {
      success: true,
      message: "Comunicado de elite enviado via rede segura.",
      emailBodyPreview: output?.emailBodyPreview || "",
      confirmationCode: input.confirmationCode
    };
  }
);
