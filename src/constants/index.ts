export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

// Priority levels for visibility checks
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

export const VISIBLE_PRIORITIES = [PRIORITY_LEVELS.MEDIUM, PRIORITY_LEVELS.HIGH] as const

// Item status types
export const ITEM_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  PURCHASED: 'purchased',
  CANCELLED: 'cancelled',
} as const


export * from './permissions';
