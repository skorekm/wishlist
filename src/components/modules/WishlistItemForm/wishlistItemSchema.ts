import { z } from 'zod'
import { Database } from '@/database.types'

// Base type with common fields
export type WishlistItemFormDataBase = {
  name: string
  price: number
  priority: Database["public"]["Enums"]["priority"]
  category: string
  link: string | null
  notes?: string | null
}

// Type for adding items (includes required currency)
export type AddWishlistItemFormData = WishlistItemFormDataBase & {
  currency: string
}

// Type for editing items (no currency field)
export type EditWishlistItemFormData = WishlistItemFormDataBase

// Schema for adding new items (includes currency)
export const addWishlistItemSchema = z.object({
  name: z.string()
    .min(1, "Item name is required")
    .max(50, "Item name cannot be longer than 50 characters")
    .trim(),
  price: z.number({
    invalid_type_error: "Price must be a number",
    required_error: "Price is required"
  })
    .min(0, "Price must be greater than 0")
    .max(10000, "Price cannot be greater than 10000"),
  currency: z.string({
    required_error: "Currency is required"
  }),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string()
    .min(1, "Category is required")
    .max(50, "Category cannot be longer than 50 characters")
    .trim(),
  link: z.string()
    .trim()
    .transform(val => val === '' ? null : val)
    .nullable()
    .pipe(
      z.string().url("Invalid link address").nullable()
    ),
  notes: z.string()
    .max(250, "Notes cannot be longer than 250 characters")
    .trim()
    .optional()
    .nullable(),
})

// Schema for editing items (currency is read-only, not editable)
export const editWishlistItemSchema = z.object({
  name: z.string()
    .min(1, "Item name is required")
    .max(50, "Item name cannot be longer than 50 characters")
    .trim(),
  price: z.coerce.number()
    .min(0, "Price must be greater than 0")
    .max(10000, "Price cannot be greater than 10000"),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string()
    .min(1, "Category is required")
    .max(50, "Category cannot be longer than 50 characters")
    .trim(),
  link: z.string()
    .trim()
    .transform(val => val === '' ? null : val)
    .nullable()
    .pipe(
      z.string().url("Invalid link address").nullable()
    ),
  notes: z.string()
    .max(250, "Notes cannot be longer than 250 characters")
    .trim()
    .optional()
    .nullable(),
})

