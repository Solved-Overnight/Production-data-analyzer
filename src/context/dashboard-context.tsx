
"use client";

import type { ProductionData, AccentColor, IndustryProductionData } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// import { mockProductionData as initialMockData } from '@/lib/mock-data'; // No longer primary source
import { extractProductionData } from '@/ai/flows/extract-production-data-flow';
import type { ExtractProductionDataOutput, IndustryProductionDataOutput } from '@/ai/flows/extract-production-data-flow';
import { useToast } from "@/hooks/use-toast";


interface DashboardContextType {
  productionData: ProductionData | null;
  setProductionData: (data: ProductionData | null) => void; // Technically, this is now an internal detail post-extraction
  extractedText: string;
  // setExtractedText: (text: string) => void; // Driven by productionData
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
  text += `Total = ${data.total.toLocaleString()} kg\n`;
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
  text += `LAB RFT: ${data.labRft !== undefined ? data.labRft : ''}\n`;
  text += `Total this month: ${data.totalThisMonth.toLocaleString()} kg\n`;
  if (data.avgPerDay !== undefined) {
    text += `Avg/day: ${data.avgPerDay.toLocaleString(undefined, {maximumFractionDigits: 2})} kg\n`;
  }
  return text;
};


const formatProductionDataToText = (data: ProductionData | null): string => {
  if (!data) return "No data available.";

  let output = `Date: ${data.date}\n\n`;
  output += formatIndustryDataToText("Lantabur", data.lantabur);
  output += `\n`;
  output += formatIndustryDataToText("Taqwa", data.taqwa);
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

  // This function now primarily serves to update text when productionData changes
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

        const processIndustryData = (rawData: IndustryProductionDataOutput): IndustryProductionData => {
          const industryData: IndustryProductionData = {
            total: rawData.total,
            loadingCapacity: rawData.loadingCapacity.map(item => ({ name: item.name, value: item.value })),
            inHouse: { value: rawData.inHouse.value },
            subContract: { value: rawData.subContract.value },
            labRft: rawData.labRft || "",
            totalThisMonth: rawData.totalThisMonth,
            avgPerDay: rawData.totalThisMonth / daysInMonth,
          };

          industryData.loadingCapacity.forEach(item => {
            item.percentage = industryData.total > 0 ? parseFloat((item.value / industryData.total * 100).toFixed(2)) : 0;
          });
          industryData.inHouse.percentage = industryData.total > 0 ? parseFloat((industryData.inHouse.value / industryData.total * 100).toFixed(2)) : 0;
          industryData.subContract.percentage = industryData.total > 0 ? parseFloat((industryData.subContract.value / industryData.total * 100).toFixed(2)) : 0;
          
          return industryData;
        };
        
        const processedData: ProductionData = {
          date: rawExtractedData.date,
          lantabur: processIndustryData(rawExtractedData.lantabur),
          taqwa: processIndustryData(rawExtractedData.taqwa),
        };
        
        updateProductionDataAndText(processedData);
        toast({ title: "PDF Processed", description: "Data extracted successfully." });

      } catch (error) {
        console.error("Error extracting data from PDF:", error);
        updateProductionDataAndText(null); 
        let errorMessage = "Could not extract data from the PDF.";
        if (error instanceof Error) {
            errorMessage = error.message.includes("model did not return the expected output structure") 
            ? "AI model failed to return data in the expected format. The PDF might not match the fixed format." 
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
        setProductionData: updateProductionDataAndText, 
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
