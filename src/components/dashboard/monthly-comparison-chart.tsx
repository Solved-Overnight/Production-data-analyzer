"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDashboard } from '@/context/dashboard-context'

export function MonthlyComparisonChart() {
  const { productionData } = useDashboard()

  if (!productionData) return null

  const data = productionData.monthlyProduction.map(item => ({
    name: `${item.month.substring(0,3)} ${item.year}`,
    Units: item.units,
  }))

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => `${value.toLocaleString()} units`} />
          <Legend />
          <Line type="monotone" dataKey="Units" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
