import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

// Fluxos de IA registrados para o ambiente de desenvolvimento e produção do Hall Black.
import './flows/advisor-flow';
import './flows/transfer-email-flow';
