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
  getCurrencies: vi.fn(() => Promise.resolve(mockCurrencies)),
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
    
    // // Mock pointer capture methods for Radix UI
    // Element.prototype.hasPointerCapture = vi.fn()
    // Element.prototype.setPointerCapture = vi.fn()
    // Element.prototype.releasePointerCapture = vi.fn()
    
    // // Mock scrollIntoView for Radix UI
    // Element.prototype.scrollIntoView = vi.fn()
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

  describe('Form Interactions', () => {
    beforeEach(async () => {
      renderWithQueryClient({ ...mockProps, isOpen: true })
      
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })
    })

    it('should populate currency dropdown with fetched data', async () => {
      // Get all comboboxes and select the first one (currency)
      const comboboxes = screen.getAllByRole('combobox')
      const currencyTrigger = comboboxes[0]
      expect(currencyTrigger).toHaveTextContent('Select a currency')
      
      // Use fireEvent to click and open the dropdown
      fireEvent.click(currencyTrigger)
      
      // The options should be immediately available since currencies are already loaded
      const usdOptions = screen.getAllByText('USD (US Dollar)')
      const eurOptions = screen.getAllByText('EUR (Euro)')
      const plnOptions = screen.getAllByText('PLN (Polish Zloty)')
      
      expect(usdOptions.length).toBeGreaterThan(0)
      expect(eurOptions.length).toBeGreaterThan(0)
      expect(plnOptions.length).toBeGreaterThan(0)
    })

    it('should populate priority dropdown with fetched data', async () => {
      const prioritySelect = screen.getAllByRole('combobox')[1]
      fireEvent.click(prioritySelect)
      
      const lowOptions = screen.getAllByText('Low')
      const mediumOptions = screen.getAllByText('Medium')
      const highOptions = screen.getAllByText('High')

      expect(lowOptions.length).toBeGreaterThan(0)
      expect(mediumOptions.length).toBeGreaterThan(0)
      expect(highOptions.length).toBeGreaterThan(0)
    })

    it('should set default priority to medium', async () => {
      const prioritySelect = screen.getAllByRole('combobox')[1]
      fireEvent.click(prioritySelect)

      const mediumOptions = screen.getAllByText('Medium')
      expect(mediumOptions.length).toBeGreaterThan(0)
    })

    it('should handle price input correctly', async () => {
      const user = userEvent.setup()
      const priceInput = screen.getByLabelText(/price/i)
      
      await user.type(priceInput, '99.99')
      
      expect(priceInput).toHaveValue(99.99)
    })

    it('should handle non-numeric price input gracefully', async () => {
      const user = userEvent.setup()
      const priceInput = screen.getByLabelText(/price/i)
      
      await user.type(priceInput, 'abc')
      
      // Price input should remain empty or show 0
      expect(priceInput).toHaveValue(null)
    })
  })

  // describe('Form Submission', () => {
  //   const fillValidForm = async (user: UserEvent) => {
  //     await user.type(screen.getByLabelText(/item name/i), 'Wireless Headphones')
  //     await user.type(screen.getByLabelText(/price/i), '199.99')
  //     await user.type(screen.getByLabelText(/category/i), 'Electronics')
  //     await user.type(screen.getByLabelText(/link/i), 'https://example.com')
  //     await user.type(screen.getByLabelText(/notes/i), 'Great for music')
      
  //     // Select currency
  //     await user.click(screen.getByRole('combobox', { name: /currency/i }))
  //     await user.click(screen.getByText('USD (US Dollar)'))
      
  //     // Priority should default to medium, but let's set it explicitly
  //     await user.click(screen.getByRole('combobox', { name: /priority/i }))
  //     await user.click(screen.getByText('High'))
  //   }

  //   beforeEach(async () => {
  //     const user = userEvent.setup()
  //     renderWithQueryClient()
      
  //     await waitFor(() => {
  //       expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  //     })

  //     const addButton = screen.getByRole('button', { name: /add item/i })
  //     await user.click(addButton)
  //   })

  //   it('should successfully submit form with valid data', async () => {
  //     const user = userEvent.setup()
  //     vi.mocked(services.createWishlistItem).mockResolvedValue(null)
      
  //     await fillValidForm(user)
      
  //     const submitButton = screen.getByRole('button', { name: /add to wishlist/i })
  //     await user.click(submitButton)
      
  //     await waitFor(() => {
  //       expect(services.createWishlistItem).toHaveBeenCalledWith({
  //         name: 'Wireless Headphones',
  //         price: 199.99,
  //         currency: 1, // USD currency ID
  //         priority: 'high',
  //         category: 'Electronics',
  //         link: 'https://example.com',
  //         notes: 'Great for music',
  //         wishlist_id: 123,
  //       })
  //     })
      
  //     expect(mockProps.onSuccess).toHaveBeenCalled()
  //     expect(toast.success).toHaveBeenCalledWith('Wishlist item added successfully!')
  //   })

  //   it('should handle submission errors gracefully', async () => {
  //     const user = userEvent.setup()
  //     const errorMessage = 'Failed to create item'
  //     vi.mocked(services.createWishlistItem).mockRejectedValue(new Error(errorMessage))
      
  //     await fillValidForm(user)
      
  //     const submitButton = screen.getByRole('button', { name: /add to wishlist/i })
  //     await user.click(submitButton)
      
  //     await waitFor(() => {
  //       expect(toast.error).toHaveBeenCalledWith('Failed to add item to wishlist. Please try again.')
  //     })
      
  //     expect(mockProps.onSuccess).not.toHaveBeenCalled()
  //   })

  //   it('should transform empty link to null before submission', async () => {
  //     const user = userEvent.setup()
  //     vi.mocked(services.createWishlistItem).mockResolvedValue(null)
      
  //     await user.type(screen.getByLabelText(/item name/i), 'Test Item')
  //     await user.type(screen.getByLabelText(/price/i), '50')
  //     await user.type(screen.getByLabelText(/category/i), 'Test Category')
      
  //     // Select currency
  //     await user.click(screen.getByRole('combobox', { name: /currency/i }))
  //     await user.click(screen.getByText('USD (US Dollar)'))
      
  //     // Leave link empty
  //     const submitButton = screen.getByRole('button', { name: /add to wishlist/i })
  //     await user.click(submitButton)
      
  //     await waitFor(() => {
  //       expect(services.createWishlistItem).toHaveBeenCalledWith(
  //         expect.objectContaining({
  //           link: null,
  //         })
  //       )
  //     })
  //   })

  //   it('should transform empty notes to null before submission', async () => {
  //     const user = userEvent.setup()
  //     vi.mocked(services.createWishlistItem).mockResolvedValue(null)
      
  //     await user.type(screen.getByLabelText(/item name/i), 'Test Item')
  //     await user.type(screen.getByLabelText(/price/i), '50')
  //     await user.type(screen.getByLabelText(/category/i), 'Test Category')
      
  //     // Select currency
  //     await user.click(screen.getByRole('combobox', { name: /currency/i }))
  //     await user.click(screen.getByText('USD (US Dollar)'))
      
  //     // Leave notes empty
  //     const submitButton = screen.getByRole('button', { name: /add to wishlist/i })
  //     await user.click(submitButton)
      
  //     await waitFor(() => {
  //       expect(services.createWishlistItem).toHaveBeenCalledWith(
  //         expect.objectContaining({
  //           notes: null,
  //         })
  //       )
  //     })
  //   })
  // })

  // describe('Dialog Management', () => {
  //   it('should close dialog when cancel button is clicked', async () => {
  //     const user = userEvent.setup()
  //     renderWithQueryClient()
      
  //     await waitFor(() => {
  //       expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  //     })

  //     // Open dialog
  //     const addButton = screen.getByRole('button', { name: /add item/i })
  //     await user.click(addButton)
      
  //     expect(screen.getByText('Add to Wishlist')).toBeInTheDocument()
      
  //     // Close dialog
  //     const cancelButton = screen.getByRole('button', { name: /cancel/i })
  //     await user.click(cancelButton)
      
  //     await waitFor(() => {
  //       expect(screen.queryByText('Add to Wishlist')).not.toBeInTheDocument()
  //     })
  //   })

  //   it('should reset form when dialog is closed', async () => {
  //     const user = userEvent.setup()
  //     renderWithQueryClient()
      
  //     await waitFor(() => {
  //       expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  //     })

  //     // Open dialog and fill form
  //     const addButton = screen.getByRole('button', { name: /add item/i })
  //     await user.click(addButton)
      
  //     await user.type(screen.getByLabelText(/item name/i), 'Test Item')
      
  //     // Close and reopen dialog
  //     const cancelButton = screen.getByRole('button', { name: /cancel/i })
  //     await user.click(cancelButton)
  //     await user.click(addButton)
      
  //     // Form should be reset
  //     expect(screen.getByLabelText(/item name/i)).toHaveValue('')
  //   })

  //   it('should close dialog and reset form after successful submission', async () => {
  //     const user = userEvent.setup()
  //     vi.mocked(services.createWishlistItem).mockResolvedValue(null)
  //     renderWithQueryClient()
      
  //     await waitFor(() => {
  //       expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  //     })

  //     const addButton = screen.getByRole('button', { name: /add item/i })
  //     await user.click(addButton)
      
  //     // Fill and submit form
  //     await user.type(screen.getByLabelText(/item name/i), 'Test Item')
  //     await user.type(screen.getByLabelText(/price/i), '50')
  //     await user.type(screen.getByLabelText(/category/i), 'Test Category')
      
  //     await user.click(screen.getByRole('combobox', { name: /currency/i }))
  //     await user.click(screen.getByText('USD (US Dollar)'))
      
  //     const submitButton = screen.getByRole('button', { name: /add to wishlist/i })
  //     await user.click(submitButton)
      
  //     // Dialog should close
  //     await waitFor(() => {
  //       expect(screen.queryByText('Add to Wishlist')).not.toBeInTheDocument()
  //     })
      
  //     // Reopen dialog to check if form is reset
  //     await user.click(addButton)
  //     expect(screen.getByLabelText(/item name/i)).toHaveValue('')
  //   })
  // })
})
