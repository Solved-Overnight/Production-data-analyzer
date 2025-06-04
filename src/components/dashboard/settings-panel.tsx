"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Palette, KeyRound, Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { useDashboard, availableAccentColors } from "@/context/dashboard-context"
import type { AccentColor } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme()
  const { apiKey, setApiKey, currentAccent, setAccentColor } = useDashboard()
  const [localApiKey, setLocalApiKey] = useState(apiKey)
  const { toast } = useToast()

  const handleApiKeySave = () => {
    setApiKey(localApiKey)
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been updated.",
    })
  }

  const handleAccentChange = (value: string) => {
    const selectedAccent = availableAccentColors.find(ac => ac.name === value)
    if (selectedAccent) {
      setAccentColor(selectedAccent)
    }
  }
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize your dashboard appearance and API configurations.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="space-y-3">
            <Label htmlFor="theme" className="flex items-center gap-2">
              <Palette size={18} /> Theme
            </Label>
            <RadioGroup
              defaultValue={theme}
              onValueChange={(value) => setTheme(value)}
              className="flex space-x-2"
            >
              <Button
                variant={theme === 'light' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="mr-2 h-4 w-4" /> Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="mr-2 h-4 w-4" /> Dark
              </Button>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="accent-color" className="flex items-center gap-2">
              <Palette size={18} /> Accent Color
            </Label>
            <RadioGroup
              defaultValue={currentAccent.name}
              onValueChange={handleAccentChange}
              className="grid grid-cols-2 gap-2"
            >
              {availableAccentColors.map((accent) => (
                <Label
                  key={accent.name}
                  htmlFor={`accent-${accent.name}`}
                  className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent/50 cursor-pointer [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value={accent.name} id={`accent-${accent.name}`} />
                  <div className="flex items-center gap-2">
                     <span style={{ backgroundColor: `hsl(${accent.value})` }} className="h-4 w-4 rounded-full inline-block border"/>
                    <span>{accent.name}</span>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <KeyRound size={18} /> Gemini API Key
            </Label>
            <div className="flex space-x-2">
              <Input
                id="api-key"
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
              <Button onClick={handleApiKeySave} variant="secondary" size="icon" aria-label="Save API Key">
                <Check size={18} />
              </Button>
            </div>
             <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser.
            </p>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
