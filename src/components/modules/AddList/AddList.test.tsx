import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { AddList } from './AddList'

mock.module('@tanstack/react-router', () => ({
  useRouter: () => ({
    navigate: mock(() => {}),
  })
}))

mock.module('@/services', () => ({
  createWishlist: mock(() => Promise.resolve({
    uuid: '1234-4321-1234-4321',
  })),
}))

describe('AddList Component', () => {
  const mockProps = {
    onSuccess: mock(() => {}),
  }

  beforeEach(() => {
    cleanup()
    mock.clearAllMocks()
  })

  it('should open the AddList modal', async () => {
    render(<AddList {...mockProps} />)
    const newList = screen.getByText('New List')
    fireEvent.click(newList)
    
    await waitFor(() => {
      screen.getByText('Create New List')
    })
  })

  it('should throw validation error when form is submitted with no data', async () => {
    render(<AddList {...mockProps} />)
    const newList = screen.getByText('New List')
    fireEvent.click(newList)

    await waitFor(() => {
      screen.getByText('Create New List')
    })

    const createButton = screen.getByText('Create List')
    fireEvent.click(createButton)

    await waitFor(() => {
      screen.getByText('List name is required')
    })
  })

  it('should create a new list when form is submitted with valid data', async () => {
    render(<AddList {...mockProps} />)
    const newList = screen.getByText('New List')
    fireEvent.click(newList)

    await waitFor(() => {
      screen.getByText('Create New List')
    })

    // fill in the form
    const nameInput = screen.getByPlaceholderText('e.g., Birthday Wishlist')
    fireEvent.change(nameInput, { target: { value: 'Test List' } })

    const descriptionInput = screen.getByPlaceholderText('e.g., Things I\'d love to receive for my birthday')
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })

    const createButton = screen.getByText('Create List')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled()
    })
  })
})