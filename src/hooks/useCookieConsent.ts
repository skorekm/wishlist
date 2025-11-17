import { useState, useEffect } from 'react'

const CONSENT_KEY = 'cookie-consent'
const CONSENT_VERSION = '1.0'

export interface ConsentPreferences {
  necessary: boolean // Always true
  functional: boolean // For theme preferences
  analytics: boolean // If analytics are added later
  version: string
  timestamp: number
}

export type ConsentCategory = 'necessary' | 'functional' | 'analytics'

/**
 * Hook for managing cookie consent preferences
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentPreferences | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  // Load consent on mount
  useEffect(() => {
    loadConsent()
  }, [])

  // Automatically apply preferences whenever consent changes
  useEffect(() => {
    if (consent) {
      applyConsentPreferences(consent)
    }
  }, [consent])

  const loadConsent = () => {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) {
      setShowBanner(true)
      return
    }

    try {
      const parsed: ConsentPreferences = JSON.parse(stored)
      // Show banner again if version changed (re-consent required)
      if (parsed.version !== CONSENT_VERSION) {
        setShowBanner(true)
      } else {
        setConsent(parsed)
      }
    } catch {
      setShowBanner(true)
    }
  }

  const saveConsent = (preferences: Omit<ConsentPreferences, 'version' | 'timestamp'>) => {
    const newConsent: ConsentPreferences = {
      ...preferences,
      necessary: true, // Always true
      version: CONSENT_VERSION,
      timestamp: Date.now(),
    }
    
    localStorage.setItem(CONSENT_KEY, JSON.stringify(newConsent))
    setConsent(newConsent)
    setShowBanner(false)
  }

  return {
    consent,
    showBanner,
    setShowBanner,
    saveConsent,
  }
}

/**
 * Check if user has consented to a specific cookie category
 */
export function hasConsent(category: ConsentCategory): boolean {
  if (typeof window === 'undefined') return false
  
  // Necessary cookies are always allowed
  if (category === 'necessary') return true
  
  const stored = localStorage.getItem(CONSENT_KEY)
  if (!stored) return false
  
  try {
    const consent: ConsentPreferences = JSON.parse(stored)
    return consent[category] === true
  } catch {
    return false
  }
}

/**
 * Get current consent preferences
 */
export function getConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem(CONSENT_KEY)
  if (!stored) return null
  
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Apply consent preferences (clear data if consent withdrawn)
 */
function applyConsentPreferences(consent: ConsentPreferences) {
  if (typeof window === 'undefined') return
  
  // If user rejected functional cookies, clear theme preference
  if (!consent.functional) {
    localStorage.removeItem('wishlist-theme')
    // Reset to light theme
    document.documentElement.classList.remove('dark')
  }
  
  // Future: Initialize/disable analytics based on consent.analytics
}

