import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock browser APIs that aren't available in jsdom
Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  value: vi.fn(),
})

// Object.defineProperty(Element.prototype, 'setPointerCapture', {
//   value: vi.fn(),
// })

// Object.defineProperty(Element.prototype, 'releasePointerCapture', {
//   value: vi.fn(),
// })

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
})

// Mock ResizeObserver
global.ResizeObserver = global.ResizeObserver || vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))