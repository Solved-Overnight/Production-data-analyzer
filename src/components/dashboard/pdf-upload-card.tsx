"use client"

import React, { useRef } from 'react'
import { UploadCloud, FileText, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDashboard } from '@/context/dashboard-context'
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export function PdfUploadCard() {
  const { triggerFileUpload, isLoading, productionData } = useDashboard()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === "application/pdf") {
        triggerFileUpload(file)
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        })
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="text-primary" /> Upload Production PDF
          </CardTitle>
          <CardDescription>
            Upload your PDF document (fixed format, first page only).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf"
            disabled={isLoading}
          />
          <Button
            onClick={handleButtonClick}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : productionData ? (
              <FileText className="mr-2 h-4 w-4" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Processing..." : productionData ? "Upload Another PDF" : "Select PDF"}
          </Button>
          {productionData && (
             <p className="mt-3 text-sm text-green-600 dark:text-green-400 flex items-center justify-center">
                <Check className="w-4 h-4 mr-1" /> PDF processed successfully.
             </p>
          )}
           <p className="mt-2 text-xs text-muted-foreground text-center">
            Only the first page of the PDF will be processed. <br/> Ensure it matches the known fixed format.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
