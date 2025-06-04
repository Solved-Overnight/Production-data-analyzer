"use client"

import React, { useState, useEffect } from 'react'
import { Bot, Lightbulb, Loader2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/context/dashboard-context'
import { generateChartDescription } from '@/ai/flows/generate-chart-description'
import type { GenerateChartDescriptionInput } from '@/ai/flows/generate-chart-description'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from "framer-motion"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ChartCardProps {
  title: string
  chartType: string // e.g., "Bar Chart", "Pie Chart"
  chartData: any // Data used for the chart, to be stringified for AI
  children: React.ReactNode
  dataAiHint?: string
}

export function ChartCard({ title, chartType, chartData, children, dataAiHint }: ChartCardProps) {
  const { apiKey, productionData, isLoading: isDashboardLoading } = useDashboard()
  const [aiDescription, setAiDescription] = useState<string | null>(null)
  const [isGeneratingAiDescription, setIsGeneratingAiDescription] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false)

  const handleGenerateDescription = async () => {
    if (!apiKey) {
      setAiError("API key is not set. Please configure it in settings.")
      return
    }
    if (!productionData) {
      setAiError("No production data available to generate description.")
      return
    }

    setIsGeneratingAiDescription(true)
    setAiDescription(null)
    setAiError(null)

    try {
      const input: GenerateChartDescriptionInput = {
        chartType,
        chartData: JSON.stringify(chartData),
        title,
      }
      const result = await generateChartDescription(input)
      setAiDescription(result.description)
    } catch (error) {
      console.error("Error generating chart description:", error)
      setAiError("Failed to generate AI description. Check console for details.")
    } finally {
      setIsGeneratingAiDescription(false)
    }
  }
  
  // Automatically generate description if data loads and API key exists
  useEffect(() => {
    if (productionData && apiKey && !aiDescription && !isGeneratingAiDescription && !aiError) {
      // handleGenerateDescription(); // Optionally auto-generate. For now, let user click.
    }
  }, [productionData, apiKey]);


  if (isDashboardLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-32" />
        </CardFooter>
      </Card>
    )
  }
  
  if (!productionData) {
     return (
      <Card className="shadow-lg" data-ai-hint={dataAiHint}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{chartType}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
          <p>No data to display chart.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg" data-ai-hint={dataAiHint}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{chartType}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
          <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" onClick={!aiDescription && !isGeneratingAiDescription ? handleGenerateDescription : undefined} disabled={isGeneratingAiDescription || !apiKey}>
                {isGeneratingAiDescription ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                {isGeneratingAiDescription ? "Generating..." : (aiDescription ? (isCollapsibleOpen ? "Hide" : "Show") + " AI Insights" : "Generate AI Insights")}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {aiError && (
                <p className="text-sm text-destructive flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" /> {aiError}
                </p>
              )}
              {aiDescription && (
                <div className="p-3 bg-muted/50 rounded-md text-sm">
                  <p className="font-medium flex items-center gap-1 mb-1"><Lightbulb size={16} className="text-yellow-500" /> AI Generated Description:</p>
                  {aiDescription}
                </div>
              )}
               {!apiKey && <p className="text-xs text-amber-600 dark:text-amber-400">Set your Gemini API key in settings to enable AI insights.</p>}
            </CollapsibleContent>
          </Collapsible>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
