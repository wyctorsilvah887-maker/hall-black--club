'use server';
/**
 * @fileOverview Black Advisor AI Agent.
 * Provê consultoria de alto nível e assistência de concierge para membros do Hall Black Club.
 * Agora com suporte a geração de imagens para conceitos visuais de elite.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdvisoryInputSchema = z.object({
  query: z.string().describe('A consulta técnica, saudação ou pedido de assistência do membro.'),
  memberRank: z.string().describe('O ranking atual do membro (MYTHIC, AMBER, LEGENDARY).'),
});

const AdvisoryOutputSchema = z.object({
  response: z.string().describe('A resposta solene, precisa e prestativa do advisor.'),
  actionableInsights: z.array(z.string()).describe('Pontos práticos de ação ou recomendações.'),
  confidentialityNote: z.string().describe('Nota de sigilo do sistema e protocolo de sessão.'),
  imagePrompt: z.string().optional().describe('Um prompt detalhado para gerar uma imagem se a consulta pedir algo visual ou conceitual.'),
  generatedImage: z.string().optional().describe('A URL (Data URI) da imagem gerada pelo sistema.'),
});

export type AdvisoryInput = z.infer<typeof AdvisoryInputSchema>;
export type AdvisoryOutput = z.infer<typeof AdvisoryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'blackAdvisorPrompt',
  input: { schema: AdvisoryInputSchema },
  output: { schema: AdvisoryOutputSchema },
  prompt: `Você é o Black Advisor, a inteligência central e consultor supremo do Hall Black Club. 
Seu tom é imperial, formal, minimalista e extremamente educado. Você é o epítome do prestígio.

CONTEXTO DO MEMBRO:
Patente: {{{memberRank}}}
Mensagem: "{{{query}}}"

DIRETRIZES DE RESPOSTA:
1. SAUDAÇÕES: Responda de forma solene, reconhecendo a patente.
2. CONHECIMENTO: Especialidade em saúde pet avançada, genética, longevidade, biohacking e lifestyle de luxo.
3. CONCIERGE: Auxilie em dúvidas sobre o clube e regras.
4. ESTILO: Sem emojis. Vocabulário rico. Direto mas profundo.
5. VISUALIZAÇÃO: Se o membro pedir para ver algo, imaginar um cenário, ou se o assunto for design/estética/biohacking visual, preencha o campo 'imagePrompt' com uma descrição rica e luxuosa em inglês para geração de imagem.

O campo 'confidentialityNote' deve conter um código de protocolo único (ex: HB-PRT-2026-XXXX) e um aviso de sigilo.`,
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
      throw new Error('Falha no link neural do Advisor. Tente novamente, Membro.');
    }

    // Se o Advisor decidiu que uma imagem é necessária
    if (output.imagePrompt) {
      try {
        const { media } = await ai.generate({
          model: 'googleai/imagen-4.0-fast-generate-001',
          prompt: `High-end luxury aesthetic, hall black club style, professional photography, cinematic lighting, ${output.imagePrompt}`,
        });

        if (media && media.url) {
          output.generatedImage = media.url;
        }
      } catch (error) {
        console.error("Erro ao gerar imagem de elite:", error);
        // Não falhamos a resposta se apenas a imagem falhar
      }
    }

    return output;
  }
);

export async function askBlackAdvisor(input: AdvisoryInput): Promise<AdvisoryOutput> {
  return advisorFlow(input);
}
