'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating textual descriptions of charts.
 *
 * - generateChartDescription - A function that takes chart data and generates a description.
 * - GenerateChartDescriptionInput - The input type for the generateChartDescription function.
 * - GenerateChartDescriptionOutput - The return type for the generateChartDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChartDescriptionInputSchema = z.object({
  chartType: z.string().describe('The type of chart, e.g., bar, pie, line.'),
  chartData: z.string().describe('The data used to generate the chart in JSON format.'),
  title: z.string().describe('The title of the chart.'),
});
export type GenerateChartDescriptionInput = z.infer<
  typeof GenerateChartDescriptionInputSchema
>;

const GenerateChartDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe('A concise textual description of the chart and its key insights.'),
});
export type GenerateChartDescriptionOutput = z.infer<
  typeof GenerateChartDescriptionOutputSchema
>;

export async function generateChartDescription(
  input: GenerateChartDescriptionInput
): Promise<GenerateChartDescriptionOutput> {
  return generateChartDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChartDescriptionPrompt',
  input: {schema: GenerateChartDescriptionInputSchema},
  output: {schema: GenerateChartDescriptionOutputSchema},
  prompt: `You are an expert data analyst. Generate a concise textual description of the following chart, highlighting the key insights.

Chart Title: {{{title}}}
Chart Type: {{{chartType}}}
Chart Data: {{{chartData}}}

Description:`, // The prompt should instruct the model to generate a description, not just reformat the data.
});

const generateChartDescriptionFlow = ai.defineFlow(
  {
    name: 'generateChartDescriptionFlow',
    inputSchema: GenerateChartDescriptionInputSchema,
    outputSchema: GenerateChartDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
