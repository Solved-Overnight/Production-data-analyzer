"use client";

import type { ProductionData, AccentColor } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockProductionData } from '@/lib/mock-data'; // Default data on load

interface DashboardContextType {
  productionData: ProductionData | null;
  setProductionData: (data: ProductionData | null) => void;
  extractedText: string;
  setExtractedText: (text: string) => void;
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

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [productionData, setProductionDataState] = useState<ProductionData | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
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
    document.documentElement.style.setProperty('--accent-custom', currentAccent.value);
    localStorage.setItem('dashboardAccentColor', currentAccent.name);
  }, [currentAccent]);


  const setProductionData = (data: ProductionData | null) => {
    setProductionDataState(data);
    // Simulate text extraction
    if (data) {
        // This would be replaced by actual PDF parsing logic
        const yamlText = `
reportTitle: "${data.reportTitle}"
industryName: "${data.industryName}"
period: "${data.period}"
totalUnitsProduced: ${data.totalUnitsProduced}
productionBreakdown:
  inHouse: ${data.productionBreakdown.inHouse}
  subContracted: ${data.productionBreakdown.subContracted}
loadingCapacity:
  capacityUsed: ${data.loadingCapacity.capacityUsed}
  totalCapacity: ${data.loadingCapacity.totalCapacity}
  unit: "${data.loadingCapacity.unit}"
monthlyProduction:
${data.monthlyProduction.map(item => `  - month: "${item.month}"\n    year: ${item.year}\n    units: ${item.units}`).join('\n')}
keyObservations:
${data.keyObservations ? data.keyObservations.map(item => `  - "${item}"`).join('\n') : '  []'}
        `.trim();
        setExtractedText(yamlText);
    } else {
        setExtractedText("");
    }
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
    setExtractedText("");
    // Optionally clear file input if it's managed here or via ref
  };

  const triggerFileUpload = (file: File) => {
    setIsLoading(true);
    // Simulate PDF parsing from the first page of a fixed format PDF
    // In a real app, use a library like pdf.js here.
    // For now, we'll just use mock data after a short delay.
    console.log("Uploaded file (first page processing simulated):", file.name);
    setTimeout(() => {
      setProductionData(mockProductionData);
      setIsLoading(false);
    }, 1500);
  };


  return (
    <DashboardContext.Provider
      value={{
        productionData,
        setProductionData,
        extractedText,
        setExtractedText,
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
