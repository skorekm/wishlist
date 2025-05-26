import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EditList } from './EditList'
import userEvent from '@testing-library/user-event'

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({
    navigate: vi.fn(),
  })
}))

vi.mock('@/services', () => ({
  updateWishlist: vi.fn().mockResolvedValue({
    uuid: '1234-4321-1234-4321',
  }),
}))

const mockProps = {
  onSuccess: vi.fn(),
  onOpenChange: vi.fn(),
  isOpen: true,
  list: {
    id: 1,
    name: 'Test List',
    description: 'Test Description',
    author_id: '1234-4321-1234-4321',
    created_at: '2021-01-01',
    updated_at: '2021-01-01',
    uuid: '1234-4321-1234-4321',
  },
}

describe('EditList Component', () => {
  it('should open the EditList modal', async () => {
    render(<EditList {...mockProps} />)
    const modalTitle = screen.getByText('Update the details of your wishlist.')
    expect(modalTitle).not.toBeNull()
  })

  it('should throw validation error when form is submitted with no name', async () => {
    render(<EditList {...mockProps} />)
    const nameInput = screen.getByDisplayValue(mockProps.list.name)
    await userEvent.clear(nameInput)

    const updateButton = screen.getByText('Update List')
    await userEvent.click(updateButton)

    expect(screen.getByText('List name is required')).not.toBeNull()
  })

  it('should update the list name when form is submitted', async () => {
    const newName = 'New List Name'
    render(<EditList {...mockProps} />)
    const nameInput = screen.getByDisplayValue(mockProps.list.name)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, newName)

    const updateButton = screen.getByText('Update List')
    await userEvent.click(updateButton)

    expect(mockProps.onSuccess).toHaveBeenCalled()
  })
})