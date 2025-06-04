import type { ProductionData } from '@/types';

export const mockProductionData: ProductionData = {
  reportTitle: "Q3 Production Report 2024",
  industryName: "Lantabur & Taqwa Industries",
  period: "July 2024 - September 2024",
  totalUnitsProduced: 15000,
  productionBreakdown: {
    inHouse: 10000,
    subContracted: 5000,
  },
  loadingCapacity: {
    capacityUsed: 750,
    totalCapacity: 1000,
    unit: "tons",
  },
  monthlyProduction: [
    { month: "July", year: 2024, units: 4500 },
    { month: "August", year: 2024, units: 5000 },
    { month: "September", year: 2024, units: 5500 },
  ],
  keyObservations: [
    "Increased subcontracting in Q3 due to machinery maintenance.",
    "Loading capacity utilization at 75%, room for growth.",
    "Consistent month-over-month production increase.",
  ],
};

export const getMockExtractedText = (data: ProductionData | null): string => {
  if (!data) return "No data available.";
  return `
Report Title: ${data.reportTitle}
Industry: ${data.industryName}
Period: ${data.period}

Production Summary:
  Total Units: ${data.totalUnitsProduced}
  In-House: ${data.productionBreakdown.inHouse}
  Sub-Contracted: ${data.productionBreakdown.subContracted}

Loading Capacity (${data.loadingCapacity.unit}):
  Used: ${data.loadingCapacity.capacityUsed}
  Total: ${data.loadingCapacity.totalCapacity}
  Utilization: ${(data.loadingCapacity.capacityUsed / data.loadingCapacity.totalCapacity * 100).toFixed(1)}%

Monthly Output:
${data.monthlyProduction.map(m => `  - ${m.month} ${m.year}: ${m.units} units`).join('\n')}

Key Observations:
${data.keyObservations?.map(obs => `  - ${obs}`).join('\n') || '  N/A'}
`.trim();
};
