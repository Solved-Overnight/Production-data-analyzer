
"use client";

import type { ProductionData, AccentColor, IndustryProductionData, ColorGroupItem } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockProductionData as initialMockData } from '@/lib/mock-data';

interface DashboardContextType {
  productionData: ProductionData | null;
  setProductionData: (data: ProductionData | null) => void;
  extractedText: string;
  setExtractedText: (text: string) => void; // Keep for flexibility, though mainly driven by productionData
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
    const percentage = data.total > 0 ? (item.value / data.total * 100).toFixed(2) : "0.00";
    text += `${item.name}: ${item.value.toLocaleString()} kg (${percentage}%)\n`;
  });
  text += `\n`; // Added newline as per user's visual format
  const inHousePercentage = data.total > 0 ? (data.inHouse.value / data.total * 100).toFixed(2) : "0.00";
  text += `Inhouse: ${data.inHouse.value.toLocaleString()} kg (${inHousePercentage}%)\n`;
  const subContractPercentage = data.total > 0 ? (data.subContract.value / data.total * 100).toFixed(2) : "0.00";
  text += `Sub Contract: ${data.subContract.value.toLocaleString()} kg (${subContractPercentage}%)\n`;
  text += `\n`; // Added newline
  text += `LAB RFT: ${data.labRft !== undefined ? data.labRft : ''}\n`; // Handle potentially undefined labRft
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
  const [productionData, setProductionDataState] = useState<ProductionData | null>(null);
  const [extractedText, setExtractedTextState] = useState<string>("");
  const [apiKey, setApiKeyState] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentAccent, setCurrentAccent] = useState<AccentColor>(availableAccentColors[0]);

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
    document.documentElement.style.setProperty('--accent', currentAccent.value); // Ensure this matches globals.css variable --accent
    localStorage.setItem('dashboardAccentColor', currentAccent.name);
  }, [currentAccent]);

  const setProductionData = (data: ProductionData | null) => {
    setProductionDataState(data);
    const formattedText = formatProductionDataToText(data);
    setExtractedTextState(formattedText);
  };

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('geminiApiKey', key);
  };

  const setAccentColor = (accent: AccentColor) => {
    setCurrentAccent(accent);
  };
  
  const clearDashboard = () => {
    setProductionData(null);
    setExtractedTextState("");
  };

  const triggerFileUpload = (file: File) => {
    setIsLoading(true);
    console.log("Uploaded file (first page processing simulated):", file.name);
    // Simulate PDF parsing and data extraction.
    // In a real app, this would involve a PDF parsing library and then
    // structuring the data into the ProductionData format.
    // For now, we use the updated mockData.
    setTimeout(() => {
      // Recalculate percentages for mock data before setting it
      const processedMockData = JSON.parse(JSON.stringify(initialMockData)) as ProductionData;

      const calculatePercentages = (industryData: IndustryProductionData) => {
        industryData.loadingCapacity.forEach(item => {
          item.percentage = industryData.total > 0 ? parseFloat((item.value / industryData.total * 100).toFixed(2)) : 0;
        });
        industryData.inHouse.percentage = industryData.total > 0 ? parseFloat((industryData.inHouse.value / industryData.total * 100).toFixed(2)) : 0;
        industryData.subContract.percentage = industryData.total > 0 ? parseFloat((industryData.subContract.value / industryData.total * 100).toFixed(2)) : 0;
      };

      calculatePercentages(processedMockData.lantabur);
      calculatePercentages(processedMockData.taqwa);
      
      setProductionData(processedMockData);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <DashboardContext.Provider
      value={{
        productionData,
        setProductionData,
        extractedText,
        setExtractedText: setExtractedTextState, // Allow direct setting if ever needed
        apiKey,
        setApiKey,
        isLoading,
        setIsLoading,
        clearDashboard,
        triggerFileUpload,
        currentAccent,
        setAccentColor,
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
