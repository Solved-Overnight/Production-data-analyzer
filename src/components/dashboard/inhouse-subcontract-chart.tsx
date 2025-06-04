"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useDashboard } from '@/context/dashboard-context'
import { CardDescription } from '@/components/ui/card'

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))']; // Primary and a secondary color

export function InhouseSubcontractChart() {
  const { productionData } = useDashboard()

  if (!productionData) return null

  const data = [
    { name: 'In-House', value: productionData.productionBreakdown.inHouse },
    { name: 'Subcontracted', value: productionData.productionBreakdown.subContracted },
  ]

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toLocaleString()} units`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
