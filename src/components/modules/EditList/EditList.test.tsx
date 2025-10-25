import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { EditList } from './EditList'

mock.module('@tanstack/react-router', () => ({
  useRouter: () => ({
    navigate: mock(() => {}),
  })
}))

mock.module('@/services', () => ({
  updateWishlist: mock(() => Promise.resolve({
    uuid: '1234-4321-1234-4321',
  })),
}))

describe('EditList Component', () => {
  const mockProps = {
    onSuccess: mock(() => {}),
    onOpenChange: mock(() => {}),
    isOpen: true,
    list: {
      id: 1,
      name: 'Test List',
      description: 'Test Description',
      event_date: null,
      author_id: '1234-4321-1234-4321',
      created_at: '2021-01-01',
      updated_at: '2021-01-01',
      uuid: '1234-4321-1234-4321',
    },
  }

  beforeEach(() => {
    cleanup()
    mock.clearAllMocks()
  })

  it('should open the EditList modal', async () => {
    render(<EditList {...mockProps} />)
    screen.getByText('Update the details of your wishlist.')
  })

  it('should disable submit when invalid and enable when valid', async () => {
    render(<EditList {...mockProps} />)
    const nameInput = screen.getByDisplayValue(mockProps.list.name)
    const updateButton = screen.getByRole('button', { name: /update list/i }) as HTMLButtonElement

    // Make invalid
    fireEvent.change(nameInput, { target: { value: '' } })

    await waitFor(() => {
      expect(updateButton.disabled).toBe(true)
    })

    // Make valid
    fireEvent.change(nameInput, { target: { value: 'New Name' } })

    await waitFor(() => {
      expect(updateButton.disabled).toBe(false)
    })
  })

  it('should update the list name when form is submitted', async () => {
    const newName = 'New List Name'
    render(<EditList {...mockProps} />)
    const nameInput = screen.getByDisplayValue(mockProps.list.name)
    fireEvent.change(nameInput, { target: { value: newName } })

    const updateButton = screen.getByRole('button', { name: /update list/i }) as HTMLButtonElement

    await waitFor(() => {
      expect(updateButton.disabled).toBe(false)
    })

    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled()
    })
  })
})