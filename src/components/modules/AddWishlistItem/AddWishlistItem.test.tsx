import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddWishlistItem } from './AddWishlistItem'
import * as services from '@/services'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock external dependencies
vi.mock('@/services', () => ({
  createWishlistItem: vi.fn(),
  getCurrencies: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock currency data
const mockCurrencies = [
  { value: '1', label: 'USD (US Dollar)', code: 'USD', isPopular: true },
  { value: '2', label: 'EUR (Euro)', code: 'EUR', isPopular: true },
  { value: '3', label: 'PLN (Polish Zloty)', code: 'PLN', isPopular: true },
]

const mockProps = {
  onSuccess: vi.fn(),
  wishlistId: 123,
  isOpen: false,
}

// Helper to render component with QueryClient
const renderWithQueryClient = (props = mockProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AddWishlistItem {...props} />
    </QueryClientProvider>
  )
}

describe('AddWishlistItem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(services.getCurrencies).mockResolvedValue(mockCurrencies)
  })

  describe('Rendering and Initial State', () => {
    it('should show loading state when currencies are being fetched', () => {
      vi.mocked(services.getCurrencies).mockReturnValue(new Promise(() => {})) // Never resolves
      renderWithQueryClient()
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should open dialog automatically when isOpen prop is true', async () => {
      renderWithQueryClient({ ...mockProps, isOpen: true })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Add to Wishlist' })).toBeInTheDocument()
      })
    })
  })

  describe('Form Fields and Validation', () => {
    beforeEach(async () => {
      renderWithQueryClient({ ...mockProps, isOpen: true })
      
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })
    })

    it('should render all required form fields', () => {
      expect(screen.getByLabelText(/item name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
      expect(screen.getByText('Select a currency')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Medium')).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/link/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })

    it('should show validation errors when submitting empty form', async () => {
      const user = userEvent.setup()
      
      const submitButton = screen.getByRole('button', { name: /add to wishlist/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('List name is required')).toBeInTheDocument()
        expect(screen.getByText('Price is required')).toBeInTheDocument()
        expect(screen.getByText('Currency is required')).toBeInTheDocument()
        expect(screen.getByText('Category is required')).toBeInTheDocument()
      })
    })

    it('should validate item name length constraints', async () => {
      const user = userEvent.setup()
      const nameInput = screen.getByLabelText(/item name/i)
      
      // Test minimum length (empty string)
      await user.clear(nameInput)
      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        expect(screen.getByText('List name is required')).toBeInTheDocument()
      })
      
      // Test maximum length (51 characters)
      const longName = 'a'.repeat(51)
      await user.clear(nameInput)
      await user.type(nameInput, longName)
      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        expect(screen.getByText('List name cannot be longer than 50 characters')).toBeInTheDocument()
      })
    })

    it('should validate price constraints', async () => {
      const user = userEvent.setup()
      const priceInput = screen.getByLabelText(/price/i)
      
      // Test negative price
      await user.type(priceInput, '-10')
      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument()
      })
      
      // Test price too high
      await user.clear(priceInput)
      await user.type(priceInput, '10001')
      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Price cannot be greater than 10000')).toBeInTheDocument()
      })
    })

    it('should validate category length constraints', async () => {
      const user = userEvent.setup()
      const categoryInput = screen.getByLabelText(/category/i)
      
      // Test maximum length (51 characters)
      const longCategory = 'a'.repeat(51)
      await user.type(categoryInput, longCategory)
      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Category cannot be longer than 50 characters')).toBeInTheDocument()
      })
    })

    it('should validate link format', async () => {
      const user = userEvent.setup()
      const linkInput = screen.getByLabelText(/link/i)
      
      await user.type(linkInput, 'invalid-url')
      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Invalid link address')).toBeInTheDocument()
      })
    })

    it('should validate notes length constraint', async () => {
      const user = userEvent.setup()
      const notesInput = screen.getByLabelText(/notes/i)
      
      const longNotes = 'a'.repeat(251)
      await user.type(notesInput, longNotes)
      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Notes cannot be longer than 250 characters')).toBeInTheDocument()
      })
    })

    it('should allow empty link field', async () => {
      // Fill required fields
      fireEvent.change(screen.getByLabelText(/item name/i), { target: { value: 'Test Item' } })
      fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '100' } })
      fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Electronics' } })
      
      // Select currency
      const currencySelect = screen.getAllByRole('combobox')[0]
      fireEvent.click(currencySelect)
      fireEvent.click(screen.getByRole('option', { name: /USD \(US Dollar\)/i }))
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      // Should not show link validation error
      await waitFor(() => {
        expect(screen.queryByText('Invalid link address')).not.toBeInTheDocument()
      })
    })
  })
})
