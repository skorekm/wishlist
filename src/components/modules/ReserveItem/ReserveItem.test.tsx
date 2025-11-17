import { describe, it, expect, mock, beforeEach, afterEach, spyOn } from 'bun:test'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReserveItem } from './ReserveItem'
import { Database } from '@/database.types'

// Mock Supabase
const mockInvoke = mock<(name: string, options?: unknown) => Promise<{ data: { success: boolean } | null; error: Record<string, unknown> | null }>>(() => Promise.resolve({ data: { success: true }, error: null }))

mock.module('@/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
  },
}))

// Mock sonner
const mockToastSuccess = mock(() => {})
const mockToastError = mock(() => {})

mock.module('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}))

describe('ReserveItem Component', () => {
  const mockItem = {
    id: 1,
    name: 'Test Item',
    author_id: 'user-123',
    category: null,
    notes: null,
    priority: 'medium' as const,
    link: 'https://example.com',
    price: 100,
    wishlist_id: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    currency: 1,
  } as Database['public']['Tables']['wishlist_items']['Row']
  
  const mockItemWithCurrency = {
    ...mockItem,
    currency: {
      code: 'USD',
    },
  } as Omit<Database['public']['Tables']['wishlist_items']['Row'], 'currency'> & { currency: { code: string } }

  let consoleErrorSpy: ReturnType<typeof spyOn>
  let queryClient: QueryClient

  beforeEach(() => {
    cleanup()
    mock.clearAllMocks()
    // Suppress console.error for error tests
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {})
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  afterEach(() => {
    consoleErrorSpy?.mockRestore()
  })

  // Helper to render with QueryClient
  const renderWithQueryClient = (item: typeof mockItemWithCurrency) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ReserveItem item={item} />
      </QueryClientProvider>
    )
  }

  it('should render the Grab button', () => {
    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    expect(grabButton).toBeTruthy()
  })

  it('should open the dialog when Grab button is clicked', async () => {
    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    fireEvent.click(grabButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy()
      expect(screen.getByText(/Fill out your information to reserve/)).toBeTruthy()
    })
  })

  it('should display the item name in the dialog description', async () => {
    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    fireEvent.click(grabButton)

    await waitFor(() => {
      const description = screen.getByText(/Fill out your information to reserve/)
      expect(description.textContent).toContain('Test Item')
    })
  })

  it('should disable submit button when form is invalid', async () => {
    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    fireEvent.click(grabButton)

    await waitFor(() => {
      screen.getByRole('dialog')
    })

    const reserveButton = screen.getByRole('button', { name: /reserve item/i }) as HTMLButtonElement
    expect(reserveButton.disabled).toBe(true)
  })

  it('should enable submit button when form is valid', async () => {
    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    fireEvent.click(grabButton)

    await waitFor(() => {
      screen.getByRole('dialog')
    })

    const nameInput = screen.getByPlaceholderText('Enter your name')
    const emailInput = screen.getByPlaceholderText('Enter your email')
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })

    const reserveButton = screen.getByRole('button', { name: /reserve item/i }) as HTMLButtonElement
    
    await waitFor(() => {
      expect(reserveButton.disabled).toBe(false)
    })
  })

  it('should show validation error for invalid email', async () => {
    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    fireEvent.click(grabButton)

    await waitFor(() => {
      screen.getByRole('dialog')
    })

    const nameInput = screen.getByPlaceholderText('Enter your name')
    const emailInput = screen.getByPlaceholderText('Enter your email')
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeTruthy()
    })
  })

  it('should show validation error for empty name', async () => {
    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    fireEvent.click(grabButton)

    await waitFor(() => {
      screen.getByRole('dialog')
    })

    const nameInput = screen.getByPlaceholderText('Enter your name')
    const emailInput = screen.getByPlaceholderText('Enter your email')
    
    fireEvent.change(nameInput, { target: { value: 'Test' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(nameInput, { target: { value: '' } })
    fireEvent.blur(nameInput)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeTruthy()
    })
  })

  it('should call supabase function and show success toast on successful reservation', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { success: true }, error: null })

    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    fireEvent.click(grabButton)

    await waitFor(() => {
      screen.getByRole('dialog')
    })

    const nameInput = screen.getByPlaceholderText('Enter your name')
    const emailInput = screen.getByPlaceholderText('Enter your email')
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })

    const reserveButton = screen.getByRole('button', { name: /reserve item/i })
    
    await waitFor(() => {
      expect((reserveButton as HTMLButtonElement).disabled).toBe(false)
    })

    fireEvent.click(reserveButton)

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('reserve-item', {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          itemId: 1,
        },
      })
      expect(mockToastSuccess).toHaveBeenCalledWith('Item reserved')
    })
  })

  it('should invalidate queries after successful reservation', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { success: true }, error: null })
    const invalidateSpy = spyOn(queryClient, 'invalidateQueries')

    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    fireEvent.click(grabButton)

    await waitFor(() => {
      screen.getByRole('dialog')
    })

    const nameInput = screen.getByPlaceholderText('Enter your name')
    const emailInput = screen.getByPlaceholderText('Enter your email')
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })

    const reserveButton = screen.getByRole('button', { name: /reserve item/i })
    
    await waitFor(() => {
      expect((reserveButton as HTMLButtonElement).disabled).toBe(false)
    })

    fireEvent.click(reserveButton)

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['shared-wishlist'] })
    })
  })

  it('should show error toast on failed reservation', async () => {
    mockInvoke.mockResolvedValueOnce({ 
      data: { success: true }, 
      error: { message: 'Failed' }
    })

    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    fireEvent.click(grabButton)

    await waitFor(() => {
      screen.getByRole('dialog')
    })

    const nameInput = screen.getByPlaceholderText('Enter your name')
    const emailInput = screen.getByPlaceholderText('Enter your email')
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })

    const reserveButton = screen.getByRole('button', { name: /reserve item/i })
    
    await waitFor(() => {
      expect((reserveButton as HTMLButtonElement).disabled).toBe(false)
    })

    fireEvent.click(reserveButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Error while reserving an item')
    })
  })

  it('should close dialog and reset form when Cancel button is clicked', async () => {
    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    fireEvent.click(grabButton)

    await waitFor(() => {
      screen.getByRole('dialog')
    })

    const nameInput = screen.getByPlaceholderText('Enter your name')
    const emailInput = screen.getByPlaceholderText('Enter your email')
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeFalsy()
    })

    // Open dialog again to verify form was reset
    fireEvent.click(grabButton)

    await waitFor(() => {
      const nameInputAfterReset = screen.getByPlaceholderText('Enter your name') as HTMLInputElement
      const emailInputAfterReset = screen.getByPlaceholderText('Enter your email') as HTMLInputElement
      expect(nameInputAfterReset.value).toBe('')
      expect(emailInputAfterReset.value).toBe('')
    })
  })

  it('should close dialog and reset form after successful submission', async () => {
    mockInvoke.mockResolvedValueOnce({ data: { success: true }, error: null })

    renderWithQueryClient(mockItemWithCurrency)
    const grabButton = screen.getByText('Grab')
    fireEvent.click(grabButton)

    await waitFor(() => {
      screen.getByRole('dialog')
    })

    const nameInput = screen.getByPlaceholderText('Enter your name')
    const emailInput = screen.getByPlaceholderText('Enter your email')
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })

    const reserveButton = screen.getByRole('button', { name: /reserve item/i })
    
    await waitFor(() => {
      expect((reserveButton as HTMLButtonElement).disabled).toBe(false)
    })

    fireEvent.click(reserveButton)

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Item reserved')
    }, { timeout: 3000 })
  })
})

