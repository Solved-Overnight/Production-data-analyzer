
'use server';
/**
 * @fileOverview A Genkit flow for extracting structured production data from a PDF document.
 *
 * - extractProductionData - A function that takes PDF data URI and returns structured production data.
 * - ExtractProductionDataInput - The input type for the extractProductionData function.
 * - ExtractProductionDataOutput - The return type for the extractProductionData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ColorGroupItemSchema = z.object({
  name: z.string().describe('Name of the color group or loading capacity item (e.g., "Black", "100% Polyster", "Double Part -Blac").'),
  value: z.number().describe('Production value in kg for this item.'),
});

const InHouseSubContractItemSchema = z.object({
  value: z.number().describe('Production value in kg.'),
});

const IndustryProductionDataSchema = z.object({
  dailyProductionTotal: z.number().describe('Total production in kg for this specific industry for the reported day (e.g., value from "Lantabur Prod." or "Taqwa Prod.").'),
  loadingCapacity: z.array(ColorGroupItemSchema).describe('Array of loading capacity items with their names and values. Extract names exactly as they appear (e.g. "Double Part -Blac").'),
  inHouse: InHouseSubContractItemSchema.describe('In-house production value for this industry.'),
  subContract: InHouseSubContractItemSchema.describe('Sub-contracted production value for this industry.'),
  labRft: z.string().optional().describe('LAB RFT string, e.g., "0% (0 out of 1)". Can be empty or omitted if not present in the PDF.'),
  totalThisMonth: z.number().optional().describe('Total production this month in kg for the industry. This might be explicitly stated or absent in the PDF.'),
});
// Exporting types, not schemas
export type IndustryProductionDataOutput = z.infer<typeof IndustryProductionDataSchema>;
export type ColorGroupItemOutput = z.infer<typeof ColorGroupItemSchema>;


const ExtractProductionDataInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The first page of the PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractProductionDataInput = z.infer<typeof ExtractProductionDataInputSchema>;

const ExtractProductionDataOutputSchema = z.object({
  date: z.string().describe('Date of the report. Try to extract in "DD-MMM-YY" format (e.g., "03-JUN-25") if available, otherwise "DD Mon YYYY".'),
  lantabur: IndustryProductionDataSchema.describe('Extracted data for Lantabur industry.'),
  taqwa: IndustryProductionDataSchema.describe('Extracted data for Taqwa industry.'),
  overallGrandTotal: z.number().optional().describe('The grand total production for the day from all sources combined, if explicitly stated as a total sum in the PDF (e.g., the total under "Color Group Wise" or "Taqwa/Others").'),
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
You will be provided with the first page of a PDF document as a media URL.
The PDF contains production data for 'Lantabur' and 'Taqwa' industries. It usually has sections like "Color Group Wise", "Inhouse Sub Contract", and "Taqwa/Others".

Extract the following information and structure it as a JSON object matching the output schema:

1.  **Date**: The date of the report. Try to find a date like "DD-MMM-YY" (e.g., "03-JUN-25") or "DD Mon YYYY".

2.  **Lantabur Data**:
    *   \`dailyProductionTotal\`: Find Lantabur's specific production total for the day. This is often labeled as "Lantabur Prod." under a section like "Taqwa/Others" or a similar summary section.
    *   \`loadingCapacity\`: From the "Color Group Wise" section for Lantabur, extract an array of objects, each with \`name\` (string, e.g., "Black", "100% Polyster", "Double Part -Blac") and \`value\` (number in kg). Ensure names are exact.
    *   \`inHouse\`: From the "Inhouse Sub Contract" section, find the \`value\` (number in kg) for Lantabur's in-house production.
    *   \`subContract\`: From the "Inhouse Sub Contract" section, find the \`value\` (number in kg) for Lantabur's subcontracted production.
    *   \`labRft\`: Look for a "LAB RFT" string for Lantabur. If not present, this field can be omitted or be an empty string.
    *   \`totalThisMonth\`: Look for a "Total this month" value for Lantabur. If not present, this field can be omitted.

3.  **Taqwa Data**:
    *   \`dailyProductionTotal\`: Find Taqwa's specific production total for the day. This is often labeled as "Taqwa Prod." under a section like "Taqwa/Others" or a similar summary section.
    *   \`loadingCapacity\`: From the "Color Group Wise" section for Taqwa, extract an array of objects, each with \`name\` (string, e.g., "Double Part", "Average", "Royal") and \`value\` (number in kg). Ensure names are exact.
    *   \`inHouse\`: From the "Inhouse Sub Contract" section, find the \`value\` (number in kg) for Taqwa's in-house production.
    *   \`subContract\`: From the "Inhouse Sub Contract" section, find the \`value\` (number in kg) for Taqwa's subcontracted production.
    *   \`labRft\`: Look for a "LAB RFT" string for Taqwa. If not present, this field can be omitted or be an empty string.
    *   \`totalThisMonth\`: Look for a "Total this month" value for Taqwa. If not present, this field can be omitted.

4.  **Overall Grand Total**:
    *   \`overallGrandTotal\`: Look for an overall daily total sum, often labeled as "Total :" under "Color Group Wise" or "Taqwa/Others". This represents the sum of all production for the day. If not explicitly found, this field can be omitted.

Important Considerations:
- Ensure all numerical values are extracted as numbers (integers or floats), not strings. Remove commas from numbers if present.
- The \`loadingCapacity\` names should be extracted exactly as they appear in the PDF.
- The output MUST strictly conform to the provided JSON schema. If a specific optional field (like \`labRft\`, \`totalThisMonth\`, \`overallGrandTotal\`) is not found, it should be omitted from the JSON if the schema allows, or handled as per schema (e.g. empty string for optional string).

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
    // Ensure all values that should be numbers are numbers
    const castToNumber = (val: any): number | undefined => {
      if (val === undefined || val === null || val === '') return undefined;
      const num = Number(String(val).replace(/,/g, ''));
      return isNaN(num) ? undefined : num;
    };

    const transformIndustryData = (data: any): IndustryProductionDataOutput => ({
        ...data,
        dailyProductionTotal: castToNumber(data.dailyProductionTotal) || 0,
        loadingCapacity: (data.loadingCapacity || []).map((item: any) => ({
            name: String(item.name),
            value: castToNumber(item.value) || 0,
        })),
        inHouse: { value: castToNumber(data.inHouse?.value) || 0 },
        subContract: { value: castToNumber(data.subContract?.value) || 0 },
        totalThisMonth: castToNumber(data.totalThisMonth), // Will be undefined if not present or not a number
        labRft: data.labRft ? String(data.labRft) : undefined,
    });
    
    const transformedOutput: ExtractProductionDataOutput = {
        date: String(output.date || "N/A"),
        lantabur: transformIndustryData(output.lantabur),
        taqwa: transformIndustryData(output.taqwa),
        overallGrandTotal: castToNumber(output.overallGrandTotal),
    };

    return transformedOutput;
  }
);

