"use client"

import { useState } from "react"
import { Settings, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsPanel } from "@/components/dashboard/settings-panel"
import { motion } from "framer-motion"

export function SiteHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="container flex h-16 max-w-screen-2xl items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight font-headline">
              Lantabur Production Dashboard
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </motion.div>
      </header>
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
