'use server';
/**
 * @fileOverview Black Advisor AI Agent.
 * Provê consultoria de alto nível para membros do Hall Black Club.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdvisoryInputSchema = z.object({
  query: z.string().describe('A consulta técnica ou de estilo de vida do membro.'),
  memberRank: z.string().describe('O ranking atual do membro (MYTHIC, AMBER, LEGENDARY).'),
});

const AdvisoryOutputSchema = z.object({
  response: z.string().describe('A resposta solene e precisa do advisor.'),
  actionableInsights: z.array(z.string()).describe('Pontos práticos de ação.'),
  confidentialityNote: z.string().describe('Nota de sigilo do sistema.'),
});

export type AdvisoryInput = z.infer<typeof AdvisoryInputSchema>;
export type AdvisoryOutput = z.infer<typeof AdvisoryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'blackAdvisorPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: AdvisoryInputSchema },
  output: { schema: AdvisoryOutputSchema },
  prompt: `Você é o Black Advisor, o consultor supremo do Hall Black Club. 
Seu tom é extremamente formal, minimalista, preciso e direto. Você não usa emojis, exclamações ou informalidades.

Membro Rank: {{{memberRank}}}
Consulta: {{{query}}}

Sua missão é prover conhecimento de elite sobre saúde pet avançada, genética, longevidade e lifestyle de luxo. 
Se a pergunta for irrelevante ao prestígio do clube, recuse educadamente informando que seu intelecto é reservado a assuntos de linhagem.

Responda em um formato de dossiê técnico. O campo 'confidentialityNote' deve conter um código de protocolo fictício e uma nota de sigilo.`,
});

export async function askBlackAdvisor(input: AdvisoryInput): Promise<AdvisoryOutput> {
  return advisorFlow(input);
}

const advisorFlow = ai.defineFlow(
  {
    name: 'advisorFlow',
    inputSchema: AdvisoryInputSchema,
    outputSchema: AdvisoryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('O Advisor não retornou dados válidos para esta consulta de linhagem.');
    }
    return output;
  }
);
