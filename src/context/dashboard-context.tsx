
"use client";

import type { ProductionData, AccentColor, IndustryProductionData, ColorGroupItem } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { extractProductionData } from '@/ai/flows/extract-production-data-flow';
import type { ExtractProductionDataOutput, IndustryProductionDataOutput as AiIndustryDataOutput } from '@/ai/flows/extract-production-data-flow';
import { useToast } from "@/hooks/use-toast";

interface DashboardContextType {
  productionData: ProductionData | null;
  extractedText: string;
  apiKey: string;
  setApiKey: (key: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  clearDashboard: () => void;
  triggerFileUpload: (file: File) => void;
  currentAccent: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const availableAccentColors: AccentColor[] = [
  { name: 'Light Green', value: '120 73% 75%' },
  { name: 'Sky Blue', value: '197 71% 73%' },
  { name: 'Thistle', value: '300 24% 80%' },
  { name: 'Coral', value: '16 100% 70%' },
];

const formatIndustryDataToText = (name: string, data: IndustryProductionData): string => {
  let text = `╰─>${name} Data:\n`;
  text += `Total = ${data.dailyProductionTotal.toLocaleString()} kg\n`;
  text += `Loading cap:\n`;
  data.loadingCapacity.forEach(item => {
    const percentage = item.percentage !== undefined ? item.percentage.toFixed(2) : "0.00";
    text += `${item.name}: ${item.value.toLocaleString()} kg (${percentage}%)\n`;
  });
  text += `\n`;
  
  const inHousePercentage = data.inHouse.percentage !== undefined ? data.inHouse.percentage.toFixed(2) : "0.00";
  text += `Inhouse: ${data.inHouse.value.toLocaleString()} kg (${inHousePercentage}%)\n`;
  
  const subContractPercentage = data.subContract.percentage !== undefined ? data.subContract.percentage.toFixed(2) : "0.00";
  text += `Sub Contract: ${data.subContract.value.toLocaleString()} kg (${subContractPercentage}%)\n`;
  text += `\n`;
  
  text += `LAB RFT: ${data.labRft !== undefined && data.labRft !== "" ? data.labRft : ''}\n`; // Show empty if undefined or empty string
  text += `Total this month: ${data.totalThisMonth !== undefined ? data.totalThisMonth.toLocaleString() + ' kg' : ''}\n`;
  text += `Avg/day: ${data.avgPerDay !== undefined ? data.avgPerDay.toLocaleString(undefined, {maximumFractionDigits: 2}) + ' kg' : ''}\n`;
  
  return text;
};

const formatProductionDataToText = (data: ProductionData | null): string => {
  if (!data) return "No data available.";

  let output = `Date: ${data.date}\n\n`;
  output += formatIndustryDataToText("Lantabur", data.lantabur);
  output += `\n`;
  output += formatIndustryDataToText("Taqwa", data.taqwa);

  // Optionally, include overallGrandTotal if it exists and you want to display it
  // if (data.overallGrandTotal !== undefined) {
  //   output += `\nOverall Grand Total: ${data.overallGrandTotal.toLocaleString()} kg\n`;
  // }
  return output.trim();
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [productionDataState, setProductionDataState] = useState<ProductionData | null>(null);
  const [extractedText, setExtractedTextState] = useState<string>("");
  const [apiKey, setApiKeyState] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentAccent, setCurrentAccent] = useState<AccentColor>(availableAccentColors[0]);
  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
      setApiKeyState(storedApiKey);
    }
    const storedAccentName = localStorage.getItem('dashboardAccentColor');
    const foundAccent = availableAccentColors.find(ac => ac.name === storedAccentName);
    if (foundAccent) {
      setCurrentAccent(foundAccent);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', currentAccent.value);
    localStorage.setItem('dashboardAccentColor', currentAccent.name);
  }, [currentAccent]);

  const updateProductionDataAndText = (data: ProductionData | null) => {
    setProductionDataState(data);
    const formattedText = formatProductionDataToText(data);
    setExtractedTextState(formattedText);
  };

  const setApiKeyGlobal = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('geminiApiKey', key);
  };

  const setAccentColorGlobal = (accent: AccentColor) => {
    setCurrentAccent(accent);
  };
  
  const clearDashboardGlobal = () => {
    updateProductionDataAndText(null);
  };

  const triggerFileUploadGlobal = (file: File) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key in settings to process PDFs.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const pdfDataUri = reader.result as string;
      try {
        const rawExtractedData: ExtractProductionDataOutput = await extractProductionData({ pdfDataUri });

        const daysInMonth = 30; // Assumption for Avg/day calculation

        const processIndustryData = (aiData: AiIndustryDataOutput): IndustryProductionData => {
          const industryTotal = aiData.dailyProductionTotal || 0;
          
          const processedLoadingCapacity: ColorGroupItem[] = (aiData.loadingCapacity || []).map(item => ({
            name: item.name,
            value: item.value,
            percentage: industryTotal > 0 ? parseFloat(((item.value || 0) / industryTotal * 100).toFixed(2)) : 0,
          }));

          const inHouseValue = aiData.inHouse?.value || 0;
          const subContractValue = aiData.subContract?.value || 0;

          const processedIndustryData: IndustryProductionData = {
            dailyProductionTotal: industryTotal,
            loadingCapacity: processedLoadingCapacity,
            inHouse: { 
              value: inHouseValue,
              percentage: industryTotal > 0 ? parseFloat((inHouseValue / industryTotal * 100).toFixed(2)) : 0,
            },
            subContract: { 
              value: subContractValue,
              percentage: industryTotal > 0 ? parseFloat((subContractValue / industryTotal * 100).toFixed(2)) : 0,
            },
            labRft: aiData.labRft, // Directly from AI (optional)
            totalThisMonth: aiData.totalThisMonth, // Directly from AI (optional)
            avgPerDay: aiData.totalThisMonth !== undefined ? (aiData.totalThisMonth / daysInMonth) : undefined,
          };
          return processedIndustryData;
        };
        
        const processedData: ProductionData = {
          date: rawExtractedData.date || "N/A",
          lantabur: processIndustryData(rawExtractedData.lantabur),
          taqwa: processIndustryData(rawExtractedData.taqwa),
          overallGrandTotal: rawExtractedData.overallGrandTotal,
        };
        
        updateProductionDataAndText(processedData);
        toast({ title: "PDF Processed", description: "Data extracted successfully." });

      } catch (error) {
        console.error("Error extracting data from PDF:", error);
        updateProductionDataAndText(null); 
        let errorMessage = "Could not extract data from the PDF.";
        if (error instanceof Error) {
            errorMessage = error.message.includes("model did not return the expected output structure") 
            ? "AI model failed to return data in the expected format. The PDF might not match the fixed format or required data is missing." 
            : error.message;
        }
        toast({ title: "PDF Processing Failed", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      console.error("Error reading file.");
      setIsLoading(false);
      toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
    };

    reader.readAsDataURL(file);
  };

  return (
    <DashboardContext.Provider
      value={{
        productionData: productionDataState,
        extractedText,
        apiKey,
        setApiKey: setApiKeyGlobal,
        isLoading,
        setIsLoading,
        clearDashboard: clearDashboardGlobal,
        triggerFileUpload: triggerFileUploadGlobal,
        currentAccent,
        setAccentColor: setAccentColorGlobal,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

