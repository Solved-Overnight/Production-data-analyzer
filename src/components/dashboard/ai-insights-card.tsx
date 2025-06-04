"use client"

import React, { useState, useEffect } from 'react'
import { Lightbulb, Loader2, AlertTriangle, Bot } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/context/dashboard-context'
import { suggestDataInsights } from '@/ai/flows/suggest-data-insights'
import type { SuggestDataInsightsInput } from '@/ai/flows/suggest-data-insights'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from "framer-motion"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function AiInsightsCard() {
  const { apiKey, extractedText, productionData, isLoading: isDashboardLoading } = useDashboard()
  const [insights, setInsights] = useState<string[] | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false)

  const handleGenerateInsights = async () => {
    if (!apiKey) {
      setError("API key is not set. Please configure it in settings.")
      return
    }
    if (!extractedText || !productionData) {
      setError("No production data available to generate insights.")
      return
    }

    setIsGenerating(true)
    setInsights(null)
    setError(null)

    try {
      const input: SuggestDataInsightsInput = {
        productionData: extractedText,
      }
      const result = await suggestDataInsights(input)
      setInsights(result.insights)
    } catch (err) {
      console.error("Error generating AI insights:", err)
      setError("Failed to generate AI insights. Check console for details.")
    } finally {
      setIsGenerating(false)
    }
  }
  
  useEffect(() => {
    if (productionData && apiKey && !insights && !isGenerating && !error) {
      // handleGenerateInsights(); // Optionally auto-generate
    }
  }, [productionData, apiKey, extractedText]);


  if (isDashboardLoading) {
    return (
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-32" />
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary" /> AI Data Insights
          </CardTitle>
          <CardDescription>
            Potential explanations and trends suggested by AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!productionData ? (
             <div className="flex flex-col items-center justify-center h-full text-center p-4 border border-dashed rounded-md min-h-[150px]">
              <Bot size={36} className="text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Upload data to generate AI insights.
              </p>
            </div>
          ) : (
            <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen} className="w-full">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="mb-2 w-full" onClick={!insights && !isGenerating ? handleGenerateInsights : undefined} disabled={isGenerating || !apiKey}>
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating ? "Analyzing Data..." : (insights ? (isCollapsibleOpen ? "Hide" : "Show") + " AI Insights" : "Generate AI Insights")}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {error && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" /> {error}
                  </p>
                )}
                {insights && (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                    {insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                )}
                {!insights && !isGenerating && !error && (
                  <p className="text-sm text-muted-foreground">Click button above to generate insights.</p>
                )}
                {!apiKey && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Set your Gemini API key in settings to enable AI insights.</p>}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
