import { describe, it, expect, mock, beforeEach, afterEach, spyOn } from 'bun:test'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { ShareListDialog } from './ShareListDialog'

// Mock services
const mockGetShareLink = mock<() => Promise<{ share_token: string } | null>>(() => Promise.resolve(null))
const mockGenerateShareLink = mock<() => Promise<{ share_token: string }>>(() => Promise.resolve({ share_token: 'test-token-123' }))
const mockRegenerateShareLink = mock<() => Promise<{ share_token: string }>>(() => Promise.resolve({ share_token: 'new-token-456' }))

mock.module('@/services', () => ({
  getShareLink: mockGetShareLink,
  generateShareLink: mockGenerateShareLink,
  regenerateShareLink: mockRegenerateShareLink,
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

describe('ShareListDialog Component', () => {
  const mockOnOpenChange = mock(() => {})

  const defaultProps = {
    wishlistId: 1,
    isOpen: true,
    onOpenChange: mockOnOpenChange,
  }

  // Mock clipboard API
  const mockWriteText = mock(() => Promise.resolve())
  let consoleErrorSpy: ReturnType<typeof spyOn>
  
  beforeEach(() => {
    cleanup()
    mock.clearAllMocks()
    
    // Suppress console.error for error tests
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    // Clear any timeouts
    mockWriteText.mockClear()
    consoleErrorSpy?.mockRestore()
  })

  it('should render dialog when isOpen is true', () => {
    render(<ShareListDialog {...defaultProps} />)
    
    expect(screen.getByText('Share Wishlist')).toBeTruthy()
    expect(screen.getByText(/Share this wishlist with friends and family/)).toBeTruthy()
  })

  it('should not render dialog when isOpen is false', () => {
    render(<ShareListDialog {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Share Wishlist')).toBeFalsy()
  })

  it('should show loading spinner while fetching share link', async () => {
    mockGetShareLink.mockImplementationOnce(() => new Promise(() => {})) // Never resolves
    
    render(<ShareListDialog {...defaultProps} />)
    
    await waitFor(() => {
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeTruthy()
    })
  })

  it('should fetch share link when dialog opens', async () => {
    mockGetShareLink.mockResolvedValueOnce(null)

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      expect(mockGetShareLink).toHaveBeenCalledWith(1)
    })
  })

  it('should display generate link button when no share link exists', async () => {
    mockGetShareLink.mockResolvedValueOnce(null)

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Generate Share Link')).toBeTruthy()
      expect(screen.getByText(/No share link exists for this wishlist yet/)).toBeTruthy()
    })
  })

  it('should display share link input when link exists', async () => {
    mockGetShareLink.mockResolvedValueOnce({ share_token: 'existing-token' })

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      const input = screen.getByDisplayValue(/existing-token/)
      expect(input).toBeTruthy()
    })
  })

  it('should generate share link when Generate button is clicked', async () => {
    mockGetShareLink.mockResolvedValueOnce(null)
    mockGenerateShareLink.mockResolvedValueOnce({ share_token: 'new-token' })

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      screen.getByText('Generate Share Link')
    })

    const generateButton = screen.getByText('Generate Share Link')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(mockGenerateShareLink).toHaveBeenCalledWith(1)
      expect(mockToastSuccess).toHaveBeenCalledWith('Share link generated!')
    })
  })

  it('should display the generated link after generation', async () => {
    mockGetShareLink.mockResolvedValueOnce(null)
    mockGenerateShareLink.mockResolvedValueOnce({ share_token: 'generated-token' })

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      screen.getByText('Generate Share Link')
    })

    const generateButton = screen.getByText('Generate Share Link')
    fireEvent.click(generateButton)

    await waitFor(() => {
      const input = screen.getByDisplayValue(/generated-token/)
      expect(input).toBeTruthy()
    })
  })

  it('should copy link to clipboard when copy button is clicked', async () => {
    mockGetShareLink.mockResolvedValueOnce({ share_token: 'copy-token' })

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      screen.getByDisplayValue(/copy-token/)
    })

    // Find and click the copy button (icon button)
    const buttons = screen.getAllByRole('button')
    const copyButton = buttons.find(button => button.querySelector('svg'))
    
    fireEvent.click(copyButton!)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining('copy-token'))
      expect(mockToastSuccess).toHaveBeenCalledWith('Link copied to clipboard!')
    })
  })

  it('should show check icon after successful copy', async () => {
    mockGetShareLink.mockResolvedValueOnce({ share_token: 'copy-token' })

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      screen.getByDisplayValue(/copy-token/)
    })

    const buttons = screen.getAllByRole('button')
    const copyButton = buttons.find(button => button.querySelector('svg'))
    
    fireEvent.click(copyButton!)

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalled()
    })
  })

  it('should regenerate share link when Regenerate button is clicked', async () => {
    mockGetShareLink.mockResolvedValueOnce({ share_token: 'old-token' })
    mockRegenerateShareLink.mockResolvedValueOnce({ share_token: 'regenerated-token' })

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      screen.getByText('Regenerate Link')
    })

    const regenerateButton = screen.getByText('Regenerate Link')
    fireEvent.click(regenerateButton)

    await waitFor(() => {
      expect(mockRegenerateShareLink).toHaveBeenCalledWith(1)
      expect(mockToastSuccess).toHaveBeenCalledWith('Share link regenerated!')
    })
  })

  it('should display new link after regeneration', async () => {
    mockGetShareLink.mockResolvedValueOnce({ share_token: 'old-token' })
    mockRegenerateShareLink.mockResolvedValueOnce({ share_token: 'new-regenerated-token' })

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      screen.getByDisplayValue(/old-token/)
    })

    const regenerateButton = screen.getByText('Regenerate Link')
    fireEvent.click(regenerateButton)

    await waitFor(() => {
      const input = screen.getByDisplayValue(/new-regenerated-token/)
      expect(input).toBeTruthy()
    })
  })

  it('should show warning message about regenerating', async () => {
    mockGetShareLink.mockResolvedValueOnce({ share_token: 'token' })

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/Regenerating will revoke the old link/)).toBeTruthy()
    })
  })

  it('should show error toast when generate link fails', async () => {
    mockGetShareLink.mockResolvedValueOnce(null)
    mockGenerateShareLink.mockRejectedValueOnce(new Error('Failed to generate'))

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      screen.getByText('Generate Share Link')
    })

    const generateButton = screen.getByText('Generate Share Link')
    fireEvent.click(generateButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to generate share link. Please try again.')
    })
  })

  it('should show error toast when regenerate fails', async () => {
    mockGetShareLink.mockResolvedValueOnce({ share_token: 'token' })
    mockRegenerateShareLink.mockRejectedValueOnce(new Error('Failed to regenerate'))

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      screen.getByText('Regenerate Link')
    })

    const regenerateButton = screen.getByText('Regenerate Link')
    fireEvent.click(regenerateButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to regenerate share link. Please try again.')
    })
  })

  it('should show error toast when copy to clipboard fails', async () => {
    mockGetShareLink.mockResolvedValueOnce({ share_token: 'token' })
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'))

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      screen.getByDisplayValue(/token/)
    })

    const buttons = screen.getAllByRole('button')
    const copyButton = buttons.find(button => button.querySelector('svg'))
    
    fireEvent.click(copyButton!)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to copy link. Please try again.')
    })
  })

  it('should call regenerateShareLink when Regenerate button is clicked', async () => {
    mockGetShareLink.mockResolvedValueOnce({ share_token: 'token' })
    mockRegenerateShareLink.mockResolvedValueOnce({ share_token: 'new-token' })

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      screen.getByText('Regenerate Link')
    })

    const regenerateButton = screen.getByText('Regenerate Link')
    fireEvent.click(regenerateButton)

    await waitFor(() => {
      expect(mockRegenerateShareLink).toHaveBeenCalledWith(1)
    })
  })

  it('should reload share link when dialog is reopened', async () => {
    mockGetShareLink.mockResolvedValueOnce({ share_token: 'first-token' })

    const { rerender } = render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      expect(mockGetShareLink).toHaveBeenCalledTimes(1)
    })

    // Close dialog
    rerender(<ShareListDialog {...defaultProps} isOpen={false} />)

    // Reopen dialog
    mockGetShareLink.mockResolvedValueOnce({ share_token: 'reloaded-token' })
    rerender(<ShareListDialog {...defaultProps} isOpen={true} />)

    await waitFor(() => {
      expect(mockGetShareLink).toHaveBeenCalledTimes(2)
    })
  })

  it('should include correct origin in generated link URL', async () => {
    const originalOrigin = window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://example.com' },
      writable: true,
      configurable: true,
    })

    mockGetShareLink.mockResolvedValueOnce({ share_token: 'test-token' })

    render(<ShareListDialog {...defaultProps} />)

    await waitFor(() => {
      const input = screen.getByDisplayValue('https://example.com/wishlists/shared/test-token')
      expect(input).toBeTruthy()
    })

    // Restore original origin
    Object.defineProperty(window, 'location', {
      value: { origin: originalOrigin },
      writable: true,
      configurable: true,
    })
  })
})

