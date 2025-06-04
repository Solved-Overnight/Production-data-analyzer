"use client"

import { SiteHeader } from '@/components/site-header'
import { DashboardProvider, useDashboard } from '@/context/dashboard-context'
import { PdfUploadCard } from '@/components/dashboard/pdf-upload-card'
import { DataSummaryCard } from '@/components/dashboard/data-summary-card'
import { ActionButtons } from '@/components/dashboard/action-buttons'
import { AiInsightsCard } from '@/components/dashboard/ai-insights-card'
import { ChartCard } from '@/components/dashboard/chart-card'
import { InhouseSubcontractChart } from '@/components/dashboard/inhouse-subcontract-chart'
import { LoadingCapacityChart } from '@/components/dashboard/loading-capacity-chart'
import { MonthlyComparisonChart } from '@/components/dashboard/monthly-comparison-chart'
import { motion } from "framer-motion"

function DashboardLayout() {
  const { productionData } = useDashboard();

  const chartContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1 flex flex-col gap-6">
            <PdfUploadCard />
            <AiInsightsCard />
          </div>
          <div className="md:col-span-2 flex flex-col gap-6">
            <DataSummaryCard />
            {productionData && <ActionButtons />}
          </div>
        </div>

        {productionData && (
           <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            variants={chartContainerVariants}
            initial="hidden"
            animate="visible"
           >
            <ChartCard
              title="Production Mix"
              chartType="Pie Chart"
              chartData={productionData.productionBreakdown}
              dataAiHint="pie chart production"
            >
              <InhouseSubcontractChart />
            </ChartCard>
            <ChartCard
              title="Loading Capacity Utilization"
              chartType="Bar Chart"
              chartData={productionData.loadingCapacity}
              dataAiHint="bar chart capacity"
            >
              <LoadingCapacityChart />
            </ChartCard>
            <ChartCard
              title="Monthly Production Trend"
              chartType="Line Chart"
              chartData={productionData.monthlyProduction}
              dataAiHint="line graph trend"
            >
              <MonthlyComparisonChart />
            </ChartCard>
          </motion.div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        Lantabur Production Dashboard &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  )
}
