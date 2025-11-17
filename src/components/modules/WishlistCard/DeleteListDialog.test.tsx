import { describe, it, expect, mock, beforeEach, afterEach, spyOn } from 'bun:test'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { DeleteListDialog } from './DeleteListDialog'

// Mock services
const mockDeleteWishlist = mock(() => Promise.resolve())

mock.module('@/services', () => ({
  deleteWishlist: mockDeleteWishlist,
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

describe('DeleteListDialog Component', () => {
  const mockOnOpenChange = mock(() => {})
  const mockOnSuccess = mock(() => {})

  const defaultProps = {
    wishlistId: 1,
    wishlistName: 'Test Wishlist',
    isOpen: true,
    onOpenChange: mockOnOpenChange,
    onSuccess: mockOnSuccess,
  }

  let consoleErrorSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    cleanup()
    mock.clearAllMocks()
    // Suppress console.error for error tests
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy?.mockRestore()
  })

  it('should render dialog when isOpen is true', () => {
    render(<DeleteListDialog {...defaultProps} />)
    
    expect(screen.getByText('Delete List')).toBeTruthy()
    expect(screen.getByText(/Are you sure you want to delete/)).toBeTruthy()
  })

  it('should not render dialog when isOpen is false', () => {
    render(<DeleteListDialog {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Delete List')).toBeFalsy()
  })

  it('should display the wishlist name in the confirmation message', () => {
    render(<DeleteListDialog {...defaultProps} />)
    
    expect(screen.getByText(/"Test Wishlist"/)).toBeTruthy()
  })

  it('should close dialog when Cancel button is clicked', async () => {
    render(<DeleteListDialog {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('should call deleteWishlist when Delete button is clicked', async () => {
    mockDeleteWishlist.mockResolvedValueOnce(undefined)

    render(<DeleteListDialog {...defaultProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteWishlist).toHaveBeenCalledWith(1)
    })
  })

  it('should call onSuccess after successful deletion', async () => {
    mockDeleteWishlist.mockResolvedValueOnce(undefined)

    render(<DeleteListDialog {...defaultProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should show success toast after successful deletion', async () => {
    mockDeleteWishlist.mockResolvedValueOnce(undefined)

    render(<DeleteListDialog {...defaultProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Wishlist deleted successfully!')
    })
  })

  it('should close dialog after successful deletion', async () => {
    mockDeleteWishlist.mockResolvedValueOnce(undefined)

    render(<DeleteListDialog {...defaultProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('should show error toast when deletion fails', async () => {
    mockDeleteWishlist.mockRejectedValueOnce(new Error('Failed to delete'))

    render(<DeleteListDialog {...defaultProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to delete wishlist. Please try again.')
    })
  })

  it('should close dialog even when deletion fails', async () => {
    mockDeleteWishlist.mockRejectedValueOnce(new Error('Failed to delete'))

    render(<DeleteListDialog {...defaultProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('should disable delete button while deleting', async () => {
    // Create a promise that we can control
    let resolveDelete: () => void
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve
    })
    mockDeleteWishlist.mockReturnValueOnce(deletePromise)

    render(<DeleteListDialog {...defaultProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i }) as HTMLButtonElement
    expect(deleteButton.disabled).toBe(false)
    
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(deleteButton.disabled).toBe(true)
    })

    // Resolve the promise to finish the test
    resolveDelete!()
  })

  it('should not call onSuccess when deletion fails', async () => {
    mockDeleteWishlist.mockRejectedValueOnce(new Error('Failed to delete'))

    render(<DeleteListDialog {...defaultProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
  })
})

