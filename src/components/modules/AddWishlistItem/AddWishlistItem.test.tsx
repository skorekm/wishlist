import { expect, describe, it, beforeEach, mock } from 'bun:test'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddWishlistItem } from './AddWishlistItem'
import * as services from '@/services'

// Mock external dependencies
mock.module('@/services', () => ({
  createWishlistItem: mock(() => {}),
  getCurrencies: mock(() => Promise.resolve(mockCurrencies)),
}))

mock.module('react-toastify', () => ({
  toast: {
    success: mock(() => {}),
    error: mock(() => {}),
  },
}))

// Mock currency data
const mockCurrencies = [
  { value: '1', label: 'USD (US Dollar)', code: 'USD', isPopular: true },
  { value: '2', label: 'EUR (Euro)', code: 'EUR', isPopular: true },
  { value: '3', label: 'PLN (Polish Zloty)', code: 'PLN', isPopular: true },
]

const mockProps = {
  onSuccess: mock(() => {}),
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
    cleanup()
    mock.clearAllMocks()
    mock(services.getCurrencies).mockResolvedValue(mockCurrencies)
  })

  describe('Rendering and Initial State', () => {
    it('should show loading state when currencies are being fetched', () => {
      mock(services.getCurrencies).mockReturnValue(new Promise(() => {})) // Never resolves
      renderWithQueryClient()
      
      // getByText will throw if element is not found, so this is sufficient
      expect(screen.getByText('Loading...')).not.toBeNull()
    })

    it('should open dialog automatically when isOpen prop is true', async () => {
      renderWithQueryClient({ ...mockProps, isOpen: true })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Add to Wishlist' })).not.toBeNull()
      })
    })
  })

  describe('Form Fields and Validation', () => {
    beforeEach(async () => {
      renderWithQueryClient({ ...mockProps, isOpen: true })
      
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).toBeNull()
      })
    })

    it('should render all required form fields', () => {
      // getBy* queries throw if elements are not found, so just calling them is sufficient
      screen.getByLabelText(/item name/i)
      screen.getByLabelText(/price/i)
      screen.getByText('Select a currency')
      screen.getByDisplayValue('Medium')
      screen.getByLabelText(/category/i)
      screen.getByLabelText(/link/i)
      screen.getByLabelText(/notes/i)
    })

    it('should show validation errors when submitting empty form', async () => {
      const submitButton = screen.getByRole('button', { name: /add to wishlist/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        // getByText will throw if elements are not found
        screen.getByText('List name is required')
        screen.getByText('Price is required')
        screen.getByText('Currency is required')
        screen.getByText('Category is required')
      })
    })

    it('should validate item name length constraints', async () => {
      const nameInput = screen.getByLabelText(/item name/i)
      
      // Test minimum length (empty string)
      fireEvent.change(nameInput, { target: { value: '' } })
      fireEvent.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        screen.getByText('List name is required')
      })
      
      // Test maximum length (51 characters)
      const longName = 'a'.repeat(51)
      fireEvent.change(nameInput, { target: { value: longName } })
      fireEvent.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        screen.getByText('List name cannot be longer than 50 characters')
      })
    })

    it('should validate price constraints', async () => {
      const priceInput = screen.getByLabelText(/price/i)
      
      // Test negative price
      fireEvent.change(priceInput, { target: { value: '-10' } })
      fireEvent.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        screen.getByText('Price must be greater than 0')
      })
      
      // Test price too high
      fireEvent.change(priceInput, { target: { value: '' } })
      fireEvent.change(priceInput, { target: { value: '10001' } })
      fireEvent.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        screen.getByText('Price cannot be greater than 10000')
      })
    })

    it('should validate category length constraints', async () => {
      const categoryInput = screen.getByLabelText(/category/i)
      
      // Test maximum length (51 characters)
      const longCategory = 'a'.repeat(51)
      fireEvent.change(categoryInput, { target: { value: longCategory } })
      fireEvent.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        screen.getByText('Category cannot be longer than 50 characters')
      })
    })

    it('should validate link format', async () => {
      const linkInput = screen.getByLabelText(/link/i)
      
      fireEvent.change(linkInput, { target: { value: 'invalid-url' } })
      fireEvent.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        screen.getByText('Invalid link address')
      })
    })

    it('should validate notes length constraint', async () => {
      const notesInput = screen.getByLabelText(/notes/i)
      
      const longNotes = 'a'.repeat(251)
      await fireEvent.change(notesInput, { target: { value: longNotes } })
      await fireEvent.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      await waitFor(() => {
        screen.getByText('Notes cannot be longer than 250 characters')
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
      
      await waitFor(() => {
        fireEvent.click(screen.getByRole('option', { name: /USD \(US Dollar\)/i }))
      })
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /add to wishlist/i }))
      
      // Should not show link validation error
      await waitFor(() => {
        expect(screen.queryByText('Invalid link address')).toBeNull()
      })
    })
  })

  describe('Form Interactions', () => {
    beforeEach(async () => {
      renderWithQueryClient({ ...mockProps, isOpen: true })
      
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).toBeNull()
      })
    })

    it('should populate currency dropdown with fetched data', async () => {
      // Get all comboboxes and select the first one (currency)
      const comboboxes = screen.getAllByRole('combobox')
      const currencyTrigger = comboboxes[0]
      expect(currencyTrigger.textContent).toContain('Select a currency')
      
      // Use fireEvent to click and open the dropdown
      fireEvent.click(currencyTrigger)
      
      // Wait for the dropdown options to appear (handles async state updates)
      await waitFor(() => {
        const usdOptions = screen.getAllByText('USD (US Dollar)')
        const eurOptions = screen.getAllByText('EUR (Euro)')
        const plnOptions = screen.getAllByText('PLN (Polish Zloty)')
        
        expect(usdOptions.length).toBeGreaterThan(0)
        expect(eurOptions.length).toBeGreaterThan(0)
        expect(plnOptions.length).toBeGreaterThan(0)
      })
    })

    it('should populate priority dropdown with fetched data', async () => {
      const prioritySelect = screen.getAllByRole('combobox')[1]
      fireEvent.click(prioritySelect)
      
      await waitFor(() => {
        const lowOptions = screen.getAllByText('Low')
        const mediumOptions = screen.getAllByText('Medium')
        const highOptions = screen.getAllByText('High')

        expect(lowOptions.length).toBeGreaterThan(0)
        expect(mediumOptions.length).toBeGreaterThan(0)
        expect(highOptions.length).toBeGreaterThan(0)
      })
    })

    it('should set default priority to medium', async () => {
      const prioritySelect = screen.getAllByRole('combobox')[1]
      fireEvent.click(prioritySelect)

      await waitFor(() => {
        const mediumOptions = screen.getAllByText('Medium')
        expect(mediumOptions.length).toBeGreaterThan(0)
      })
    })

    it('should handle price input correctly', async () => {
      const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement
      
      fireEvent.change(priceInput, { target: { value: '99.99' } })
      
      expect(priceInput.value).toBe('99.99')
    })

    it('should handle non-numeric price input gracefully', async () => {
      const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement
      
      fireEvent.change(priceInput, { target: { value: 'abc' } })
      
      // Price input should remain empty or show 0
      expect(priceInput.value).toBe('')
    })
  })
})
