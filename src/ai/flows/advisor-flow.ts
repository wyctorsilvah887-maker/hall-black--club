'use server';
/**
 * @fileOverview Sovereign Advisor AI Agent - Business & Strategy Edition.
 * Provê consultoria de alto nível em negócios para membros do Sovereign Founders Club.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdvisoryInputSchema = z.object({
  query: z.string().describe('A consulta de negócios ou técnica do fundador.'),
  memberRank: z.string().describe('O ranking atual do membro (MYTHIC, AMBER, LEGENDARY, SOVEREIGN).'),
});

const AdvisoryOutputSchema = z.object({
  response: z.string().describe('A resposta direta e sem filtros do advisor sobre o negócio.'),
  actionableInsights: z.array(z.string()).describe('Pontos práticos de ação (máximo 3).'),
  confidentialityNote: z.string().describe('Nota de sigilo do sistema Sovereign.'),
});

export type AdvisoryInput = z.infer<typeof AdvisoryInputSchema>;
export type AdvisoryOutput = z.infer<typeof AdvisoryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'sovereignAdvisorPrompt',
  input: { schema: AdvisoryInputSchema },
  output: { schema: AdvisoryOutputSchema },
  prompt: `Você é o Sovereign Advisor, a inteligência de NEGÓCIOS do Sovereign Founders Club. 
Seu tom padrão é imperial, formal e altamente estratégico.

DIRETRIZES CRÍTICAS:
1. CONCISÃO: Seja breve e direto ao ponto. Respostas densas e sem enrolação.
2. EXPERTISE: SaaS, Escala, Engenharia Financeira, Equity e Branding de Luxo.
3. SEM FILTROS: Diga a verdade estratégica sobre o projeto do fundador.

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
      throw new Error('Falha no link neural do Sovereign Advisor.');
    }
    return output;
  }
);

export async function askBlackAdvisor(input: AdvisoryInput): Promise<AdvisoryOutput> {
  return advisorFlow(input);
}
