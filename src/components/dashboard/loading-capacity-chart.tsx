"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDashboard } from '@/context/dashboard-context'

export function LoadingCapacityChart() {
  const { productionData } = useDashboard()

  if (!productionData) return null

  const data = [
    {
      name: `Capacity (${productionData.loadingCapacity.unit})`,
      Used: productionData.loadingCapacity.capacityUsed,
      Remaining: productionData.loadingCapacity.totalCapacity - productionData.loadingCapacity.capacityUsed,
      Total: productionData.loadingCapacity.totalCapacity,
    },
  ]

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 'dataMax + 100']} />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip formatter={(value: number, name: string) => [`${value.toLocaleString()} ${productionData.loadingCapacity.unit}`, name]} />
          <Legend />
          <Bar dataKey="Used" stackId="a" fill="hsl(var(--chart-1))" />
          <Bar dataKey="Remaining" stackId="a" fill="hsl(var(--chart-2))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
