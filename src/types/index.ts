
export interface ColorGroupItem {
  name: string;
  value: number;
  percentage?: number; // Calculated client-side
}

export interface IndustryProductionData {
  dailyProductionTotal: number; // e.g., Lantabur Prod or Taqwa Prod from PDF
  loadingCapacity: ColorGroupItem[];
  inHouse: { value: number; percentage?: number }; // percentage calculated client-side
  subContract: { value: number; percentage?: number }; // percentage calculated client-side
  labRft?: string; // Optional, from PDF
  totalThisMonth?: number; // Optional, from PDF
  avgPerDay?: number; // Calculated client-side from totalThisMonth
}

export interface ProductionData {
  date: string; // e.g., "03-JUN-25"
  lantabur: IndustryProductionData;
  taqwa: IndustryProductionData;
  overallGrandTotal?: number; // Optional, grand total for the day from PDF
}

export interface AccentColor {
  name: string;
  value: string; // HSL string for CSS variable
  tailwindClass?: string; // Optional: if we need specific tailwind classes for this accent
}
