
'use server';
/**
 * @fileOverview A Genkit flow for extracting structured production data from a PDF document.
 *
 * - extractProductionData - A function that takes PDF data URI and returns structured production data.
 * - ExtractProductionDataInput - The input type for the extractProductionData function.
 * - ExtractProductionDataOutput - The return type for the extractProductionData function (raw extracted data).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ColorGroupItemSchema = z.object({
  name: z.string().describe('Name of the color group or loading capacity item.'),
  value: z.number().describe('Production value in kg for this item.'),
});
export type ColorGroupItemOutput = z.infer<typeof ColorGroupItemSchema>;

const InHouseSubContractItemSchema = z.object({
  value: z.number().describe('Production value in kg.'),
});
export type InHouseSubContractItemOutput = z.infer<typeof InHouseSubContractItemSchema>;

const IndustryProductionDataSchema = z.object({
  total: z.number().describe('Total production in kg for the industry.'),
  loadingCapacity: z.array(ColorGroupItemSchema).describe('Array of loading capacity items with their names and values.'),
  inHouse: InHouseSubContractItemSchema.describe('In-house production value.'),
  subContract: InHouseSubContractItemSchema.describe('Sub-contracted production value.'),
  labRft: z.string().optional().describe('LAB RFT string, e.g., "0% (0 out of 1)". Can be empty if not present.'),
  totalThisMonth: z.number().describe('Total production this month in kg for the industry.'),
});
export type IndustryProductionDataOutput = z.infer<typeof IndustryProductionDataSchema>;


const ExtractProductionDataInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The first page of the PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractProductionDataInput = z.infer<typeof ExtractProductionDataInputSchema>;

const ExtractProductionDataOutputSchema = z.object({
  date: z.string().describe('Date of the report, e.g., "02 Jun 2025".'),
  lantabur: IndustryProductionDataSchema.describe('Extracted data for Lantabur industry.'),
  taqwa: IndustryProductionDataSchema.describe('Extracted data for Taqwa industry.'),
});
export type ExtractProductionDataOutput = z.infer<typeof ExtractProductionDataOutputSchema>;


export async function extractProductionData(input: ExtractProductionDataInput): Promise<ExtractProductionDataOutput> {
  return extractProductionDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractProductionDataPrompt',
  input: {schema: ExtractProductionDataInputSchema},
  output: {schema: ExtractProductionDataOutputSchema},
  prompt: `You are an expert data extraction tool specializing in parsing production reports from PDF documents.
You will be provided with a PDF document as a media URL. You should only process the first page of this PDF.
The PDF contains production data for 'Lantabur' and 'Taqwa' industries and follows a fixed, known format similar to the example structure provided in the output schema.

Extract the following information and structure it as a JSON object matching the output schema:

1.  **Date**: The date of the report (e.g., "02 Jun 2025").
2.  **Lantabur Data**:
    *   \`total\`: Total production in kg.
    *   \`loadingCapacity\`: An array of objects, each with \`name\` (string, e.g., "Black", "100% Polyster", "Double Part", "Average") and \`value\` (number in kg).
    *   \`inHouse\`: An object with \`value\` (number in kg for in-house production).
    *   \`subContract\`: An object with \`value\` (number in kg for subcontracted production).
    *   \`labRft\`: LAB RFT string (e.g., "0% (0 out of 1)"). If not present, use an empty string or omit if schema allows.
    *   \`totalThisMonth\`: Total production this month in kg.
3.  **Taqwa Data**:
    *   \`total\`: Total production in kg.
    *   \`loadingCapacity\`: An array of objects, each with \`name\` (string, e.g., "Double Part", "Average", "Royal", "Black", "White", "N/wash") and \`value\` (number in kg).
    *   \`inHouse\`: An object with \`value\` (number in kg for in-house production).
    *   \`subContract\`: An object with \`value\` (number in kg for subcontracted production).
    *   \`labRft\`: LAB RFT string. If not present, use an empty string or omit if schema allows.
    *   \`totalThisMonth\`: Total production this month in kg.

Important Considerations:
- Ensure all numerical values are extracted as numbers, not strings.
- The \`loadingCapacity\` names should match those typically found in the reports.
- The output MUST strictly conform to the provided JSON schema. If a specific field is not found (e.g. labRft for Taqwa), provide an empty string for string types or ensure optional fields are handled correctly by the schema.

PDF Document (first page):
{{media url=pdfDataUri}}
`,
});

const extractProductionDataFlow = ai.defineFlow(
  {
    name: 'extractProductionDataFlow',
    inputSchema: ExtractProductionDataInputSchema,
    outputSchema: ExtractProductionDataOutputSchema,
  },
  async (input) => {
    const {output} = await prompt({ pdfDataUri: input.pdfDataUri });
    if (!output) {
      throw new Error('AI failed to extract data from PDF. The model did not return the expected output structure.');
    }
    return output;
  }
);

