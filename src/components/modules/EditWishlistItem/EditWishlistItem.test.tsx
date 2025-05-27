import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EditWishlistItem } from './EditWishlistItem'
import * as services from '@/services'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock external dependencies
vi.mock('@/services', () => ({
  updateWishlistItem: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock item data
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

const mockProps = {
  item: mockItem,
  isOpen: false,
  onOpenChange: vi.fn(),
  onSuccess: vi.fn(),
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
    vi.clearAllMocks()
  })

  describe('Rendering and Initial State', () => {
    it('should not render dialog when isOpen is false', () => {
      renderWithQueryClient()
      
      expect(screen.queryByRole('heading', { name: 'Edit Wishlist Item' })).not.toBeInTheDocument()
    })

    it('should open dialog when isOpen prop is true', async () => {
      renderWithQueryClient({ ...mockProps, isOpen: true })
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Edit Wishlist Item' })).toBeInTheDocument()
      })
    })

    it('should render dialog description', async () => {
      renderWithQueryClient({ ...mockProps, isOpen: true })
      
      await waitFor(() => {
        expect(screen.getByText('Update the details of your wishlist item.')).toBeInTheDocument()
      })
    })
  })

  describe('Form Fields and Pre-populated Values', () => {
    beforeEach(async () => {
      renderWithQueryClient({ ...mockProps, isOpen: true })
    })

    it('should render all form fields with pre-populated values', async () => {
      const nameInput = screen.getByLabelText(/item name/i)
      const priceInput = screen.getByLabelText(/price/i)
      const prioritySelect = screen.getByDisplayValue('Medium')
      const categoryInput = screen.getByLabelText(/category/i)
      const linkInput = screen.getByLabelText(/link/i)
      const notesInput = screen.getByLabelText(/notes/i)

      await waitFor(() => {
        expect(nameInput).toHaveValue('Test Item')
        expect(priceInput).toHaveValue(99.99)
        expect(prioritySelect).toBeInTheDocument()
        expect(categoryInput).toHaveValue('Electronics')
        expect(linkInput).toHaveValue('https://example.com')
        expect(notesInput).toHaveValue('Test notes')
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
      
      renderWithQueryClient({ ...mockProps, item: itemWithNulls, isOpen: true })
      
      const linkInput = screen.getByLabelText(/link/i)
      const notesInput = screen.getByLabelText(/notes/i)
      const categoryInput = screen.getByLabelText(/category/i)
      
      await waitFor(() => {
        expect(linkInput).toHaveValue('')
        expect(notesInput).toHaveValue('')
        expect(categoryInput).toHaveValue('')
      })
    })
  })

  describe('Form Validation', () => {
    beforeEach(async () => {
      vi.clearAllMocks()
      // Start with empty values in mockItem
      const emptyMockItem = {
        ...mockItem,
        name: '',
        price: 0,
        category: '',
        link: null,
        notes: null
      }
      renderWithQueryClient({ ...mockProps, item: emptyMockItem, isOpen: true })
    })

    it('should show validation errors when clearing required fields', async () => {
      // Clear required fields
      const nameInput = screen.getByLabelText(/item name/i)
      const priceInput = screen.getByLabelText(/price/i)
      const categoryInput = screen.getByLabelText(/category/i)
      
      fireEvent.change(nameInput, { target: { value: '' } })
      fireEvent.change(priceInput, { target: { value: '' } })
      fireEvent.change(categoryInput, { target: { value: '' } })
      
      const submitButton = screen.getByRole('button', { name: /update item/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Item name is required')).toBeInTheDocument()
        expect(screen.getByText('Category is required')).toBeInTheDocument()
      })
    })

    it('should prevent submission and show error when item name is too long', async () => {
      const nameInput = screen.getByLabelText(/item name/i)
      const submitButton = screen.getByRole('button', { name: /update item/i })
      
      // Set the long value
      fireEvent.change(nameInput, { target: { value: 'a'.repeat(51) } })
      fireEvent.click(submitButton)
      
      // Wait for validation and check form state
      await waitFor(() => {
        expect(screen.getByText('Item name cannot be longer than 50 characters')).toBeInTheDocument()
      })
      
      // Check if the form submission was prevented
      expect(services.updateWishlistItem).not.toHaveBeenCalled()
    })

    it('should validate price constraints', async () => {
      const priceInput = screen.getByLabelText(/price/i)
      
      // Test negative price
      fireEvent.change(priceInput, { target: { value: '-10' } })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument()
      })
      
      // Test price too high
      fireEvent.change(priceInput, { target: { value: '10001' } })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Price cannot be greater than 10000')).toBeInTheDocument()
      })
    })

    it('should validate category length constraints', async () => {
      const categoryInput = screen.getByLabelText(/category/i)
      
      // Test maximum length (51 characters)
      const longCategory = 'a'.repeat(51)
      fireEvent.change(categoryInput, { target: { value: longCategory } })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Category cannot be longer than 50 characters')).toBeInTheDocument()
      })
    })

    it('should validate link format', async () => {
      const linkInput = screen.getByLabelText(/link/i)
      
      fireEvent.change(linkInput, { target: { value: 'invalid-url' } })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Invalid URL')).toBeInTheDocument()
      })
    })

    it('should validate notes length constraint', async () => {
      const notesInput = screen.getByLabelText(/notes/i)
      
      const longNotes = 'a'.repeat(251)
      fireEvent.change(notesInput, { target: { value: longNotes } })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Notes cannot be longer than 250 characters')).toBeInTheDocument()
      })
    })

    it('should allow empty link field', async () => {
      const linkInput = screen.getByLabelText(/link/i)
      
      fireEvent.change(linkInput, { target: { value: '' } })
      fireEvent.click(screen.getByRole('button', { name: /update item/i }))
      
      await waitFor(() => {
        expect(screen.queryByText('Invalid URL')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Interactions', () => {
    beforeEach(async () => {
      renderWithQueryClient({ ...mockProps, isOpen: true })
    })

    it('should handle priority selection', async () => {
      const prioritySelect = screen.getByRole('combobox')
      fireEvent.click(prioritySelect)
      
      const lowOption = screen.getByRole('option', { name: 'Low' })
      const mediumOption = screen.getByRole('option', { name: 'Medium' })
      const highOption = screen.getByRole('option', { name: 'High' })
      
      expect(lowOption).toBeInTheDocument()
      expect(mediumOption).toBeInTheDocument()
      expect(highOption).toBeInTheDocument()
      
      // Select high priority
      fireEvent.click(highOption)
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('High')).toBeInTheDocument()
      })
    })

    it('should handle price input correctly', async () => {
      const user = userEvent.setup()
      const priceInput = screen.getByLabelText(/price/i)
      
      // Clear existing value and type new one
      await user.clear(priceInput)
      await user.type(priceInput, '199.99')
      
      expect(priceInput).toHaveValue(199.99)
    })

    it('should handle text field updates', async () => {
      const user = userEvent.setup()
      const nameInput = screen.getByLabelText(/item name/i)
      const categoryInput = screen.getByLabelText(/category/i)
      const linkInput = screen.getByLabelText(/link/i)
      const notesInput = screen.getByLabelText(/notes/i)
      
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Item Name')
      
      await user.clear(categoryInput)
      await user.type(categoryInput, 'Updated Category')
      
      await user.clear(linkInput)
      await user.type(linkInput, 'https://updated-link.com')
      
      await user.clear(notesInput)
      await user.type(notesInput, 'Updated notes')
      
      expect(nameInput).toHaveValue('Updated Item Name')
      expect(categoryInput).toHaveValue('Updated Category')
      expect(linkInput).toHaveValue('https://updated-link.com')
      expect(notesInput).toHaveValue('Updated notes')
    })
  })

  describe('Form Submission', () => {
    beforeEach(async () => {
      renderWithQueryClient({ ...mockProps, isOpen: true })
    })

    it('should call updateWishlistItem with correct data on successful submission', async () => {
      vi.mocked(services.updateWishlistItem).mockResolvedValue(null)
      
      // Update some fields
      const nameInput = screen.getByLabelText(/item name/i)
      fireEvent.change(nameInput, { target: { value: 'Updated Item' } })
      
      const priceInput = screen.getByLabelText(/price/i)
      fireEvent.change(priceInput, { target: { value: '150' } })
      
      const submitButton = screen.getByRole('button', { name: /update item/i })
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
