
export interface ColorGroupItem {
  name: string;
  value: number;
  percentage?: number; // Calculated
}

export interface IndustryProductionData {
  total: number;
  loadingCapacity: ColorGroupItem[];
  inHouse: { value: number; percentage?: number };
  subContract: { value: number; percentage?: number };
  labRft?: string;
  totalThisMonth: number;
  avgPerDay?: number; // Calculated
}

export interface ProductionData {
  date: string; // e.g., "02 Jun 2025"
  lantabur: IndustryProductionData;
  taqwa: IndustryProductionData;
}

export interface AccentColor {
  name: string;
  value: string; // HSL string for CSS variable
  tailwindClass?: string; // Optional: if we need specific tailwind classes for this accent
}
