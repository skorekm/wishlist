import { describe, it, expect, beforeEach } from 'bun:test'
import { renderHook, act } from '@testing-library/react'
import { useCookieConsent, hasConsent } from './useCookieConsent'

describe('useCookieConsent hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with showBanner true when no consent exists', () => {
    const { result } = renderHook(() => useCookieConsent())

    expect(result.current.showBanner).toBe(true)
  })

  it('should update consent state after saving', () => {
    const { result } = renderHook(() => useCookieConsent())

    act(() => {
      result.current.saveConsent({
        necessary: true,
        functional: true,
        analytics: false,
      })
    })

    expect(result.current.consent).toMatchObject({
      necessary: true,
      functional: true,
      analytics: false,
    })
  })

  it('should hide banner after saving consent', () => {
    const { result } = renderHook(() => useCookieConsent())

    expect(result.current.showBanner).toBe(true)

    act(() => {
      result.current.saveConsent({
        necessary: true,
        functional: true,
        analytics: false,
      })
    })

    expect(result.current.showBanner).toBe(false)
  })

  it('should enforce necessary cookies are always true', () => {
    const { result } = renderHook(() => useCookieConsent())

    act(() => {
      result.current.saveConsent({
        necessary: true,
        functional: false,
        analytics: false,
      })
    })

    expect(result.current.consent?.necessary).toBe(true)
  })

  it('should allow manually controlling banner visibility', () => {
    const { result } = renderHook(() => useCookieConsent())

    act(() => {
      result.current.saveConsent({
        necessary: true,
        functional: true,
        analytics: false,
      })
    })

    expect(result.current.showBanner).toBe(false)

    act(() => {
      result.current.setShowBanner(true)
    })

    expect(result.current.showBanner).toBe(true)
  })

  it('should include version and timestamp in saved consent', () => {
    const { result } = renderHook(() => useCookieConsent())

    act(() => {
      result.current.saveConsent({
        necessary: true,
        functional: true,
        analytics: false,
      })
    })

    expect(result.current.consent?.version).toBe('1.0')
    expect(result.current.consent?.timestamp).toBeNumber()
  })
})

describe('hasConsent helper function', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should always return true for necessary cookies', () => {
    expect(hasConsent('necessary')).toBe(true)
  })

  it('should return false when no consent exists', () => {
    expect(hasConsent('functional')).toBe(false)
    expect(hasConsent('analytics')).toBe(false)
  })
})

