import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Cookie } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { ConsentPreferences } from '@/hooks/useCookieConsent'

interface CookieSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (preferences: Omit<ConsentPreferences, 'version' | 'timestamp'>) => void
  currentPreferences?: Omit<ConsentPreferences, 'version' | 'timestamp'>
}

export function CookieSettingsDialog({ 
  open, 
  onOpenChange, 
  onSave,
  currentPreferences 
}: CookieSettingsDialogProps) {
  const [preferences, setPreferences] = useState<Omit<ConsentPreferences, 'version' | 'timestamp'>>({
    necessary: true,
    functional: currentPreferences?.functional ?? false,
    analytics: currentPreferences?.analytics ?? false,
  })

  useEffect(() => {
    if (currentPreferences) {
      setPreferences({
        necessary: true,
        functional: currentPreferences.functional,
        analytics: currentPreferences.analytics,
      })
    }
  }, [currentPreferences])

  const handleSaveCustom = () => {
    onSave(preferences)
    onOpenChange(false)
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: false, // Keep false as we don't have analytics yet
    }
    onSave(allAccepted)
    onOpenChange(false)
  }

  const handleNecessaryOnly = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
    }
    onSave(necessaryOnly)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Preferences
          </DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can enable or disable different types of cookies below. 
            Note that disabling some cookies may affect your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Necessary Cookies - Always On */}
          <div className="space-y-2 pb-3 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="text-base font-semibold">
                  Strictly Necessary Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies are essential for the website to function and cannot be disabled. 
                  They include authentication cookies and security features.
                </p>
              </div>
              <div className="shrink-0">
                <Button variant="secondary" size="sm" disabled>
                  Always Active
                </Button>
              </div>
            </div>
          </div>

          {/* Functional Cookies */}
          <div className="space-y-2 pb-3 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="text-base font-semibold">
                  Functional Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies enable enhanced functionality and personalization, such as 
                  remembering your theme preference (light/dark mode).
                </p>
                <p className="text-xs text-muted-foreground pt-1">
                  Cookies used: <code className="bg-muted px-1 rounded">wishlist-theme</code>
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button
                  variant={preferences.functional ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                >
                  {preferences.functional ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics Cookies - Placeholder for future */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <Label className="text-base font-semibold">
                  Analytics Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies help us understand how visitors interact with our website 
                  by collecting and reporting information anonymously.
                </p>
                <p className="text-xs text-muted-foreground pt-1">
                  Currently not in use.
                </p>
              </div>
              <div className="shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  Not Available
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleNecessaryOnly}
            className="flex-1"
          >
            Only Necessary
          </Button>
          <Button
            onClick={handleSaveCustom}
            className="flex-1"
          >
            Save Preferences
          </Button>
          <Button
            onClick={handleAcceptAll}
            className="flex-1"
          >
            Accept All
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          For more information, read our{' '}
          <Link to="/privacy" className="text-primary hover:underline" onClick={() => onOpenChange(false)}>
            Privacy Policy
          </Link>.
        </p>
      </DialogContent>
    </Dialog>
  )
}

