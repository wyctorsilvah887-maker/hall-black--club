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
  imagePrompt: z.string().optional().describe('Um prompt detalhado para gerar uma imagem conceitual de negócio ou interface de luxo.'),
  generatedImage: z.string().optional().describe('A URL (Data URI) da imagem gerada pelo sistema.'),
});

export type AdvisoryInput = z.infer<typeof AdvisoryInputSchema>;
export type AdvisoryOutput = z.infer<typeof AdvisoryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'blackAdvisorPrompt',
  input: { schema: AdvisoryInputSchema },
  output: { schema: AdvisoryOutputSchema },
  prompt: `Você é o Black Advisor, inteligência de NEGÓCIOS do Hall Black Club. 
Seu tom padrão é imperial e formal, mas você deve ser flexível: se o usuário pedir para ser "menos formal", "mais normal" ou "falar de boa", adapte seu tom imediatamente para algo direto e casual, mantendo a autoridade.

DIRETRIZES CRÍTICAS:
1. CONCISÃO ABSOLUTA: Seja extremamente breve. Evite introduções longas ou saudações excessivas. Vá direto ao ponto.
2. EXPERTISE: Especialista em SaaS, Vendas e Escala Digital.
3. SEM FILTROS: Diagnóstico brutal. Se algo é ruim, diga que é ruim.
4. ESTRUTURA:
   - Resposta curta e precisa.
   - Máximo 3 Actionable Insights.
5. VISUAL: Descreva um conceito visual de luxo (SaaS/Dashboard) em inglês no 'imagePrompt'.

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

    // Geração de imagem para acompanhar a consultoria
    if (output.imagePrompt) {
      try {
        const { media } = await ai.generate({
          model: 'googleai/imagen-4.0-fast-generate-001',
          prompt: `High-end business aesthetic, luxury SaaS interface, corporate elite style, professional studio lighting, ${output.imagePrompt}`,
        });

        if (media && media.url) {
          output.generatedImage = media.url;
        }
      } catch (error) {
        console.error("Erro ao gerar visual:", error);
      }
    }

    return output;
  }
);

export async function askBlackAdvisor(input: AdvisoryInput): Promise<AdvisoryOutput> {
  return advisorFlow(input);
}
