import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { act, render, screen, waitFor } from '@testing-library/react'
import { AddList } from './AddList'

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({
    navigate: vi.fn(),
  })
}))

vi.mock('@/services', () => ({
  createWishlist: vi.fn().mockResolvedValue({
    uuid: '1234-4321-1234-4321',
  }),
}))

const mockProps = {
  onSuccess: vi.fn(),
}

describe('AddList Component', () => {
  it('should open the AddList modal', async () => {
    render(<AddList {...mockProps} />)
    const newList = screen.getByText('New List')
    await userEvent.click(newList)
    expect(screen.getByText('Create New List')).not.toBeNull()
  })

  it('should throw validation error when form is submitted with no data', async () => {
    render(<AddList {...mockProps} />)
    const newList = screen.getByText('New List')
    await userEvent.click(newList)

    const createButton = screen.getByText('Create List')
    await userEvent.click(createButton)

    waitFor(() => {
      expect(screen.getByText('List name is required')).not.toBeNull()
    })
  })

  it('should create a new list when form is submitted with valid data', async () => {
    render(<AddList {...mockProps} />)
    const newList = screen.getByText('New List')
    act(() => {
      newList.click();
    });

    // fill in the form
    const nameInput = screen.getByPlaceholderText('e.g., Birthday Wishlist')
    await userEvent.type(nameInput, 'Test List')

    const descriptionInput = screen.getByPlaceholderText('e.g., Things I\'d love to receive for my birthday')
    await userEvent.type(descriptionInput, 'Test Description')

    const createButton = screen.getByText('Create List')
    await userEvent.click(createButton)

    waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled()
    })
  })
})