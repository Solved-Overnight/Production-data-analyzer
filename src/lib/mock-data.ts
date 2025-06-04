
import type { ProductionData } from '@/types';

// Data extracted from the provided image
const lantaburTotal = 13266.2;
const taqwaTotal = 24058;
const daysInMonth = 30; // Assumption for Avg/day calculation

export const mockProductionData: ProductionData = {
  date: "02 Jun 2025", // From user's example
  lantabur: {
    total: lantaburTotal,
    loadingCapacity: [
      { name: "Black", value: 2853 },
      { name: "100% Polyster", value: 717 }, // Mapping to user's "White" example structure if needed, but using image label
      { name: "Double Part", value: 5442 + 581.2 }, // Combined "Double Part" and "Double Part -Blac"
      { name: "Average", value: 3673 },
    ],
    inHouse: { value: 12934.2 },
    subContract: { value: 332 },
    labRft: "0% (0 out of 1)", // From user's example
    totalThisMonth: lantaburTotal,
    avgPerDay: lantaburTotal / daysInMonth,
  },
  taqwa: {
    total: taqwaTotal,
    loadingCapacity: [
      { name: "Double Part", value: 4766.5 + 2824 }, // Combined "Double Part" and "Double Part -Blac"
      { name: "Average", value: 13182 },
      { name: "Black", value: 1101.5 },
      { name: "White", value: 2156 },
      { name: "N/wash", value: 28 },
      // "Royal" from user example is not in the image data for Taqwa Color Group Wise
    ],
    inHouse: { value: 22954 },
    subContract: { value: 1104 },
    labRft: "", // From user's example
    totalThisMonth: taqwaTotal,
    avgPerDay: taqwaTotal / daysInMonth,
  },
};

// This function is no longer used as formatting is handled in DashboardContext
// export const getMockExtractedText = (data: ProductionData | null): string => { ... }
