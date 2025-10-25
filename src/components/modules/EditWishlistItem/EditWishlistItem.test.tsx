import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen, waitFor, fireEvent, cleanup, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EditWishlistItem } from './EditWishlistItem'
import * as services from '@/services'

// Mock external dependencies
mock.module('@/services', () => ({
  updateWishlistItem: mock(() => {}),
}))

mock.module('react-toastify', () => ({
  toast: {
    success: mock(() => {}),
    error: mock(() => {}),
  },
}))

// Mock item data for component props (with currency object)
const mockItem = {
  id: 1,
  name: 'Test Item',
  price: 99.99,
  priority: 'medium' as const,
  category: 'Electronics',
  link: 'https://example.com' as string | null,
  notes: 'Test notes' as string | null,
  currency: { code: 'USD' },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  wishlist_id: 123,
  purchased: false,
  purchased_at: null,
  author_id: 'user123'
}

// Mock item data for service return (with currency as number)
const mockServiceItem = {
  ...mockItem,
  currency: 1,
}

const mockProps = {
  item: mockItem,
  isOpen: false,
  onOpenChange: mock(() => {}),
  wishlistUuid: 'test-uuid-123',
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
      <EditWishlistItem {...props} />
    </QueryClientProvider>
  )
}

describe('EditWishlistItem Component', () => {
  beforeEach(() => {
    cleanup()
    mock.clearAllMocks()
  })

  describe('Rendering and Initial State', () => {
    it('should not render dialog when isOpen is false', async () => {
      await act(async () => {
        renderWithQueryClient()
      })
      
      expect(screen.queryByRole('heading', { name: 'Edit Wishlist Item' })).toBeNull()
    })

    it('should open dialog when isOpen prop is true', async () => {
      await act(async () => {
        renderWithQueryClient({ ...mockProps, isOpen: true })
      })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Edit Wishlist Item' })).not.toBeNull()
      })
    })

    it('should render dialog description', async () => {
      await act(async () => {
        renderWithQueryClient({ ...mockProps, isOpen: true })
      })
      
      await waitFor(() => {
        screen.getByText('Update the details of your wishlist item.')
      })
    })
  })

  describe('Form Fields and Pre-populated Values', () => {
    beforeEach(async () => {
      await act(async () => {
        renderWithQueryClient({ ...mockProps, isOpen: true })
      })
    })

    it('should render all form fields with pre-populated values', async () => {
      const nameInput = screen.getByLabelText(/item name/i) as HTMLInputElement
      const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement
      const prioritySelect = screen.getByDisplayValue('Medium')
      const categoryInput = screen.getByLabelText(/category/i) as HTMLInputElement
      const linkInput = screen.getByLabelText(/link/i) as HTMLInputElement
      const notesInput = screen.getByLabelText(/notes/i) as HTMLTextAreaElement

      await waitFor(() => {
        expect(nameInput.value).toBe('Test Item')
        expect(priceInput.valueAsNumber).toBe(99.99)
        expect(prioritySelect).not.toBeNull()
        expect(categoryInput.value).toBe('Electronics')
        expect(linkInput.value).toBe('https://example.com')
        expect(notesInput.value).toBe('Test notes')
      })
    })
  })

  describe('Handling Null Values', () => {
    it('should handle item with null optional fields', async () => {
      const itemWithNulls = {
        ...mockItem,
        link: null,
        notes: null,
        category: ''
      }
      
      await act(async () => {
        renderWithQueryClient({ ...mockProps, item: itemWithNulls, isOpen: true })
      })
      
      const linkInput = screen.getByLabelText(/link/i) as HTMLInputElement
      const notesInput = screen.getByLabelText(/notes/i) as HTMLTextAreaElement
      const categoryInput = screen.getByLabelText(/category/i) as HTMLInputElement
      
      await waitFor(() => {
        expect(linkInput.value).toBe('')
        expect(notesInput.value).toBe('')
        expect(categoryInput.value).toBe('')
      })
    })
  })

  describe('Form Validation', () => {
    beforeEach(async () => {
      mock.clearAllMocks()
      // Start with empty values in mockItem
      const emptyMockItem = {
        ...mockItem,
        name: '',
        price: 0,
        category: '',
        link: null,
        notes: null
      }
      await act(async () => {
        renderWithQueryClient({ ...mockProps, item: emptyMockItem, isOpen: true })
      })
    })

    it('should disable submit when required fields are empty, enable when valid', async () => {
      // Clear required fields
      const nameInput = screen.getByLabelText(/item name/i)
      const priceInput = screen.getByLabelText(/price/i)
      const categoryInput = screen.getByLabelText(/category/i)
      const submitButton = screen.getByRole('button', { name: /update item/i }) as HTMLButtonElement

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: '' } })
        fireEvent.change(priceInput, { target: { value: '' } })
        fireEvent.change(categoryInput, { target: { value: '' } })
      })

      await waitFor(() => {
        expect(submitButton.disabled).toBe(true)
      })

      // Fix fields
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Valid Name' } })
        fireEvent.change(priceInput, { target: { value: '123' } })
        fireEvent.change(categoryInput, { target: { value: 'Valid Category' } })
      })

      await waitFor(() => {
        expect(submitButton.disabled).toBe(false)
      })
    })

    it('should prevent submission and show error when item name is too long', async () => {
      const nameInput = screen.getByLabelText(/item name/i)
      const submitButton = screen.getByRole('button', { name: /update item/i })
      
      // Set the long value
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'a'.repeat(51) } })
      })
      fireEvent.click(submitButton)
      
      // Wait for validation and check form state
      await waitFor(() => {
        screen.getByText('Item name cannot be longer than 50 characters')
      })
      
      // Check if the form submission was prevented
      expect(services.updateWishlistItem).not.toHaveBeenCalled()
    })

    it('should validate price constraints', async () => {
      const priceInput = screen.getByLabelText(/price/i)
      
      // Test negative price
      await act(async () => {
        fireEvent.change(priceInput, { target: { value: '-10' } })
      })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        screen.getByText('Price must be greater than 0')
      })
      
      // Test price too high
      await act(async () => {
        fireEvent.change(priceInput, { target: { value: '10001' } })
      })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        screen.getByText('Price cannot be greater than 10000')
      })
    })

    it('should validate category length constraints', async () => {
      const categoryInput = screen.getByLabelText(/category/i)
      
      // Test maximum length (51 characters)
      const longCategory = 'a'.repeat(51)
      await act(async () => {
        fireEvent.change(categoryInput, { target: { value: longCategory } })
      })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        screen.getByText('Category cannot be longer than 50 characters')
      })
    })

    it('should validate link format', async () => {
      const linkInput = screen.getByLabelText(/link/i)
      
      await act(async () => {
        fireEvent.change(linkInput, { target: { value: 'invalid-url' } })
      })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        screen.getByText('Invalid URL')
      })
    })

    it('should validate notes length constraint', async () => {
      const notesInput = screen.getByLabelText(/notes/i)
      
      const longNotes = 'a'.repeat(251)
      await act(async () => {
        fireEvent.change(notesInput, { target: { value: longNotes } })
      })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        screen.getByText('Notes cannot be longer than 250 characters')
      })
    })

    it('should allow empty link field', async () => {
      const linkInput = screen.getByLabelText(/link/i)
      
      await act(async () => {
        fireEvent.change(linkInput, { target: { value: '' } })
      })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        expect(screen.queryByText('Invalid URL')).toBeNull()
      })
    })
  })

  describe('Form Interactions', () => {
    beforeEach(async () => {
      await act(async () => {
        renderWithQueryClient({ ...mockProps, isOpen: true })
      })
      
      // Wait for form to be ready
      await waitFor(() => {
        screen.getByLabelText(/item name/i)
      })
    })

    it('should handle priority selection', async () => {
      const prioritySelect = screen.getByRole('combobox')
      
      await act(async () => {
        fireEvent.click(prioritySelect)
      })
      
      await waitFor(async () => {
        const lowOption = screen.getByRole('option', { name: 'Low' })
        const mediumOption = screen.getByRole('option', { name: 'Medium' })
        const highOption = screen.getByRole('option', { name: 'High' })
        
        expect(lowOption).not.toBeNull()
        expect(mediumOption).not.toBeNull()
        expect(highOption).not.toBeNull()
        
        // Select high priority
        await act(async () => {
          fireEvent.click(highOption)
        })
      })
      
      await waitFor(() => {
        screen.getByDisplayValue('High')
      })
    })

    it('should handle price input correctly', async () => {
      const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement

      await act(async () => {
        fireEvent.change(priceInput, { target: { value: '199.99' } })
      })

      await waitFor(() => {
        expect(priceInput.value).toBe('199.99')
      })
    })

    it('should handle text field updates', async () => {
      const nameInput = screen.getByLabelText(/item name/i) as HTMLInputElement
      const categoryInput = screen.getByLabelText(/category/i) as HTMLInputElement
      const linkInput = screen.getByLabelText(/link/i) as HTMLInputElement
      const notesInput = screen.getByLabelText(/notes/i) as HTMLTextAreaElement

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Updated Item Name' } })
        fireEvent.change(categoryInput, { target: { value: 'Updated Category' } })
        fireEvent.change(linkInput, { target: { value: 'https://updated-link.com' } })
        fireEvent.change(notesInput, { target: { value: 'Updated notes' } })
      })

      await waitFor(() => {
        expect(nameInput.value).toBe('Updated Item Name')
        expect(categoryInput.value).toBe('Updated Category')
        expect(linkInput.value).toBe('https://updated-link.com')
        expect(notesInput.value).toBe('Updated notes')
      })
    })
  })

  describe('Form Submission', () => {
    beforeEach(async () => {
      await act(async () => {
        renderWithQueryClient({ ...mockProps, isOpen: true })
      })
    })

    it('should call updateWishlistItem with correct data on successful submission', async () => {
      mock(services.updateWishlistItem).mockResolvedValue(mockServiceItem)
      
      await act(async () => {
        // Update some fields
        const nameInput = screen.getByLabelText(/item name/i)
        fireEvent.change(nameInput, { target: { value: 'Updated Item' } })
        
        const priceInput = screen.getByLabelText(/price/i)
        fireEvent.change(priceInput, { target: { value: '150' } })
      })

      const submitButton = screen.getByRole('button', { name: /update item/i }) as HTMLButtonElement
      await waitFor(() => {
        expect(submitButton.disabled).toBe(false)
      })

      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(services.updateWishlistItem).toHaveBeenCalledWith(1, {
          name: 'Updated Item',
          price: 150,
          priority: 'medium',
          category: 'Electronics',
          link: 'https://example.com',
          notes: 'Test notes',
        })
      })
    })
  })
})
