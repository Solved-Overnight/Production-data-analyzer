'use server';

/**
 * @fileOverview A flow for suggesting potential explanations for production data.
 *
 * - suggestDataInsights - A function that takes production data as input and returns suggestions for potential insights.
 * - SuggestDataInsightsInput - The input type for the suggestDataInsights function.
 * - SuggestDataInsightsOutput - The return type for the suggestDataInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDataInsightsInputSchema = z.object({
  productionData: z
    .string()
    .describe('The production data extracted from the PDF.')
});
export type SuggestDataInsightsInput = z.infer<typeof SuggestDataInsightsInputSchema>;

const SuggestDataInsightsOutputSchema = z.object({
  insights: z.array(z.string()).describe('A list of potential explanations for the data.')
});
export type SuggestDataInsightsOutput = z.infer<typeof SuggestDataInsightsOutputSchema>;

export async function suggestDataInsights(input: SuggestDataInsightsInput): Promise<SuggestDataInsightsOutput> {
  return suggestDataInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDataInsightsPrompt',
  input: {schema: SuggestDataInsightsInputSchema},
  output: {schema: SuggestDataInsightsOutputSchema},
  prompt: `You are an expert production data analyst.

  Given the following production data, suggest a few potential explanations for the trends and patterns observed.
  Format your response as a bulleted list.

  Production Data:
  {{productionData}}`
});

const suggestDataInsightsFlow = ai.defineFlow(
  {
    name: 'suggestDataInsightsFlow',
    inputSchema: SuggestDataInsightsInputSchema,
    outputSchema: SuggestDataInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
