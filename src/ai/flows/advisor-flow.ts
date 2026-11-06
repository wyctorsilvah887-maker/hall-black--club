'use server';
/**
 * @fileOverview Black Advisor AI Agent - Business & SaaS Edition.
 * Provê consultoria de alto nível em negócios, SaaS, vendas e tecnologia para membros do Hall Black Club.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdvisoryInputSchema = z.object({
  query: z.string().describe('A consulta de negócios, SaaS, vendas ou técnica do membro.'),
  memberRank: z.string().describe('O ranking atual do membro (MYTHIC, AMBER, LEGENDARY, HALL_BLACK).'),
});

const AdvisoryOutputSchema = z.object({
  response: z.string().describe('A resposta direta e sem filtros do advisor sobre o negócio.'),
  actionableInsights: z.array(z.string()).describe('Pontos práticos de ação (máximo 3).'),
  confidentialityNote: z.string().describe('Nota de sigilo do sistema.'),
});

export type AdvisoryInput = z.infer<typeof AdvisoryInputSchema>;
export type AdvisoryOutput = z.infer<typeof AdvisoryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'blackAdvisorPrompt',
  input: { schema: AdvisoryInputSchema },
  output: { schema: AdvisoryOutputSchema },
  prompt: `Você é o Black Advisor, inteligência de NEGÓCIOS do Hall Black Club. 
Seu tom padrão é imperial e formal, mas adapte-se caso o usuário peça para ser mais casual.

DIRETRIZES CRÍTICAS:
1. CONCISÃO: Seja breve e direto ao ponto. Respostas curtas e densas.
2. EXPERTISE: SaaS, Vendas, Estratégia e Branding.
3. SEM FILTROS: Diga a verdade brutal sobre a ideia do usuário.
4. SEM IMAGENS: Você NÃO gera imagens. Se o usuário pedir, informe que sua função é puramente estratégica e técnica, focada no sucesso comercial da linhagem.

Consulta: "{{{query}}}"
Patente: {{{memberRank}}}`,
});

const advisorFlow = ai.defineFlow(
  {
    name: 'advisorFlow',
    inputSchema: AdvisoryInputSchema,
    outputSchema: AdvisoryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Falha no link neural do Advisor.');
    }
    return output;
  }
);

export async function askBlackAdvisor(input: AdvisoryInput): Promise<AdvisoryOutput> {
  return advisorFlow(input);
}
