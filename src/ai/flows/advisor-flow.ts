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
  response: z.string().describe('A resposta solene, precisa e sem filtros do advisor sobre o negócio.'),
  actionableInsights: z.array(z.string()).describe('Pontos práticos de ação, melhorias ou correções críticas.'),
  confidentialityNote: z.string().describe('Nota de sigilo do sistema e protocolo de sessão.'),
  imagePrompt: z.string().optional().describe('Um prompt detalhado para gerar uma imagem conceitual de negócio ou interface de luxo.'),
  generatedImage: z.string().optional().describe('A URL (Data URI) da imagem gerada pelo sistema.'),
});

export type AdvisoryInput = z.infer<typeof AdvisoryInputSchema>;
export type AdvisoryOutput = z.infer<typeof AdvisoryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'blackAdvisorPrompt',
  input: { schema: AdvisoryInputSchema },
  output: { schema: AdvisoryOutputSchema },
  prompt: `Você é o Black Advisor, a inteligência central e consultor supremo de NEGÓCIOS do Hall Black Club. 
Seu tom é imperial, formal, minimalista e extremamente educado. Você é a autoridade máxima em estratégia.

CONTEXTO DO MEMBRO:
Patente: {{{memberRank}}}
Consulta: "{{{query}}}"

DIRETRIZES DE RESPOSTA:
1. EXPERTISE: Você é um especialista em SaaS, arquitetura de serviços, funis de vendas, conversão de sites e escala de negócios digitais.
2. SEM FILTROS: Seja direto. Se uma ideia for ruim, diga que é medíocre. Se um site estiver mal projetado, aponte as falhas técnicas. Se uma estratégia de vendas for fraca, exija a correção. Não use eufemismos; a elite exige a verdade para atingir a perfeição.
3. ESTRUTURA:
   - Responda de forma solene, reconhecendo a patente.
   - Forneça um diagnóstico brutalmente honesto (O que está bom, o que está ruim, o que deve ser descartado).
   - Apresente o caminho para a supremacia comercial no campo solicitado.
4. ESTILO: Sem emojis. Vocabulário rico e preciso.
5. VISUALIZAÇÃO: Para toda consulta, descreva um conceito visual (interface de luxo, arquitetura de sistema ou conceito de marca) no campo 'imagePrompt' em inglês.

O campo 'confidentialityNote' deve conter um código de protocolo único (ex: HB-BIZ-2026-XXXX) e um aviso de sigilo absoluto.`,
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

    // Geração de imagem para acompanhar a consultoria de negócios
    if (output.imagePrompt) {
      try {
        const { media } = await ai.generate({
          model: 'googleai/imagen-4.0-fast-generate-001',
          prompt: `Luxury business aesthetic, high-end SaaS dashboard, corporate elite style, cinematic lighting, professional photography, ${output.imagePrompt}`,
        });

        if (media && media.url) {
          output.generatedImage = media.url;
        }
      } catch (error) {
        console.error("Erro ao gerar visual de negócios:", error);
      }
    }

    return output;
  }
);

export async function askBlackAdvisor(input: AdvisoryInput): Promise<AdvisoryOutput> {
  return advisorFlow(input);
}
