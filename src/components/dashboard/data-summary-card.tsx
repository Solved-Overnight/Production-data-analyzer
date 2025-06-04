"use client"

import { FileText, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDashboard } from '@/context/dashboard-context'
import { motion } from "framer-motion"

export function DataSummaryCard() {
  const { extractedText, productionData, isLoading } = useDashboard()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="shadow-lg h-full min-h-[300px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="text-primary" /> Extracted Data Summary
          </CardTitle>
          <CardDescription>
            Data parsed from the uploaded PDF, formatted for readability.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          ) : productionData ? (
            <ScrollArea className="h-[350px] w-full rounded-md border p-4 bg-secondary/30">
              <pre className="text-sm whitespace-pre-wrap break-all font-code">
                {extractedText}
              </pre>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 border border-dashed rounded-md">
              <Info size={36} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Upload a PDF to see the extracted data summary here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
