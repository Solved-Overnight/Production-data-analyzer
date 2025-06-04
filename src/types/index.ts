export interface ProductionData {
  reportTitle: string;
  industryName: string;
  period: string;
  totalUnitsProduced: number;
  productionBreakdown: {
    inHouse: number;
    subContracted: number;
  };
  loadingCapacity: {
    capacityUsed: number;
    totalCapacity: number;
    unit: string;
  };
  monthlyProduction: Array<{ month: string; year: number; units: number }>;
  keyObservations?: string[];
}

export interface AccentColor {
  name: string;
  value: string; // HSL string for CSS variable
  tailwindClass?: string; // Optional: if we need specific tailwind classes for this accent
}
