"use client"

import { Copy, Share2, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/context/dashboard-context'
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { useState, useEffect } from 'react'

export function ActionButtons() {
  const { extractedText, productionData, clearDashboard } = useDashboard()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!extractedText) {
      toast({ title: "No data to copy", variant: "destructive" })
      return
    }
    try {
      await navigator.clipboard.writeText(extractedText)
      setCopied(true)
      toast({ title: "Summary Copied!", description: "Data summary copied to clipboard." })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({ title: "Copy Failed", description: "Could not copy data to clipboard.", variant: "destructive" })
    }
  }

  const handleWhatsAppShare = () => {
    if (!extractedText) {
      toast({ title: "No data to share", variant: "destructive" })
      return
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(extractedText)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleClearAll = () => {
    clearDashboard()
    toast({ title: "Dashboard Cleared", description: "All uploaded data and charts have been cleared." })
  }

  const buttonsDisabled = !productionData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-wrap gap-3 justify-center md:justify-start"
    >
      <Button onClick={handleCopy} disabled={buttonsDisabled || copied} variant="outline">
        {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
        {copied ? "Copied!" : "Copy Summary"}
      </Button>
      <Button onClick={handleWhatsAppShare} disabled={buttonsDisabled} variant="outline">
        <Share2 className="mr-2 h-4 w-4" /> Send via WhatsApp
      </Button>
      <Button onClick={handleClearAll} disabled={buttonsDisabled} variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" /> Clear All
      </Button>
    </motion.div>
  )
}
