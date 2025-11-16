import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Cookie, Settings } from 'lucide-react'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { CookieSettingsDialog } from './CookieSettingsDialog'

export function CookieConsent() {
  const { consent, showBanner, saveConsent } = useCookieConsent()
  const [showSettings, setShowSettings] = useState(false)

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: false,
    })
  }

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
    })
  }

  const openSettings = () => {
    setShowSettings(true)
  }

  const handleDialogClose = (open: boolean) => {
    setShowSettings(open)
  }

  return (
    <>
      {/* Main Banner */}
      <AnimatePresence>
        {showBanner && !showSettings && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <Card className="mx-auto max-w-5xl shadow-2xl border-2">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="shrink-0">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Cookie className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold">Cookie Consent</h3>
                    <p className="text-sm text-muted-foreground">
                      We use cookies to provide essential functionality and, with your consent, 
                      to remember your preferences like theme settings. You can customize your 
                      choices or accept all. You can change your preferences at any time.{' '}
                      <Link to="/privacy" className="text-primary hover:underline font-medium">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openSettings}
                      className="w-full sm:w-auto"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Customize
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={acceptNecessary}
                      className="w-full sm:w-auto"
                    >
                      Necessary Only
                    </Button>
                    <Button
                      size="sm"
                      onClick={acceptAll}
                      className="w-full sm:w-auto"
                    >
                      Accept All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Dialog */}
      <CookieSettingsDialog
        open={showSettings}
        onOpenChange={handleDialogClose}
        onSave={saveConsent}
        currentPreferences={consent ? {
          necessary: consent.necessary,
          functional: consent.functional,
          analytics: consent.analytics,
        } : undefined}
      />
    </>
  )
}
