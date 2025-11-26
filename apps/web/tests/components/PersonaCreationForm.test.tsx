import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonaCreationForm } from '../../src/components/PersonaCreationForm'
import { render, mockUser } from '../utils/test-utils'

// Mock the API
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock the useSignMessage hook
vi.mock('wagmi', () => ({
  useSignMessage: () => ({
    signMessageAsync: vi.fn().mockResolvedValue('0xmock-signature'),
  }),
}))

const defaultProps = {
  walletAddress: '0x1234567890123456789012345678901234567890',
  eventId: 'event-1',
  onSuccess: vi.fn(),
  onSkip: vi.fn(),
}

describe('PersonaCreationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { id: 'persona-1' } }),
    })
  })

  it('renders all form fields', () => {
    render(<PersonaCreationForm {...defaultProps} />)

    expect(screen.getByLabelText(/Display Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Bio/)).toBeInTheDocument()
    expect(screen.getByText(/Interests/)).toBeInTheDocument()
    expect(screen.getByText(/Looking For/)).toBeInTheDocument()
    expect(screen.getByText(/Visibility Settings/)).toBeInTheDocument()
  })

  it('validates required display name', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    const displayNameInput = screen.getByLabelText(/Display Name/)
    await user.clear(displayNameInput)

    const submitButton = screen.getByRole('button', { name: /Create Persona/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Display name is required/)).toBeInTheDocument()
    })
  })

  it('validates bio length', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    const bioInput = screen.getByLabelText(/Bio/)
    await user.type(bioInput, 'Short bio') // Only 9 characters, needs 50 minimum

    const submitButton = screen.getByRole('button', { name: /Create Persona/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Bio must be at least 50 characters/)).toBeInTheDocument()
    })
  })

  it('validates bio maximum length', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    const bioInput = screen.getByLabelText(/Bio/)
    const longBio = 'A'.repeat(301) // Exceeds 300 character limit
    await user.type(bioInput, longBio)

    const submitButton = screen.getByRole('button', { name: /Create Persona/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Bio must be 300 characters or less/)).toBeInTheDocument()
    })
  })

  it('allows valid bio submission', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    // Fill in required fields
    await user.type(screen.getByLabelText(/Display Name/), 'Test User')
    await user.type(
      screen.getByLabelText(/Bio/),
      'This is a valid bio that meets the minimum character requirement for testing purposes.'
    )

    const submitButton = screen.getByRole('button', { name: /Create Persona/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Test User'),
      })
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Mock a slow API call
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, data: { id: 'persona-1' } }),
      }), 1000))
    )

    render(<PersonaCreationForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/Display Name/), 'Test User')
    await user.type(
      screen.getByLabelText(/Bio/),
      'This is a valid bio that meets the minimum character requirement.'
    )

    const submitButton = screen.getByRole('button', { name: /Create Persona/ })
    await user.click(submitButton)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(screen.getByText(/Loader2/)).toBeInTheDocument()
  })

  it('shows success message on successful submission', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/Display Name/), 'Test User')
    await user.type(
      screen.getByLabelText(/Bio/),
      'This is a valid bio that meets the minimum character requirement.'
    )

    const submitButton = screen.getByRole('button', { name: /Create Persona/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Persona created successfully!')).toBeInTheDocument()
    })
  })

  it('shows error message on failed submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'Network error' }),
    })

    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/Display Name/), 'Test User')
    await user.type(
      screen.getByLabelText(/Bio/),
      'This is a valid bio that meets the minimum character requirement.'
    )

    const submitButton = screen.getByRole('button', { name: /Create Persona/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('adds interests correctly', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    const interestInput = screen.getByPlaceholderText(/Add an interest/)
    const addButton = screen.getByRole('button', { name: '' })

    await user.type(interestInput, 'Blockchain')
    await user.click(addButton)

    expect(screen.getByText('Blockchain')).toBeInTheDocument()
    expect(interestInput).toHaveValue('')
  })

  it('removes interests correctly', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    // Add an interest first
    const interestInput = screen.getByPlaceholderText(/Add an interest/)
    const addButton = screen.getByRole('button', { name: '' })

    await user.type(interestInput, 'Blockchain')
    await user.click(addButton)

    // Remove the interest
    const removeButton = screen.getByRole('button', { name: 'X' })
    await user.click(removeButton)

    expect(screen.queryByText('Blockchain')).not.toBeInTheDocument()
  })

  it('limits interests to maximum of 10', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    const interestInput = screen.getByPlaceholderText(/Add an interest/)
    const addButton = screen.getByRole('button', { name: '' })

    // Add 10 interests
    for (let i = 1; i <= 10; i++) {
      await user.type(interestInput, `Interest ${i}`)
      await user.click(addButton)
    }

    // Try to add an 11th interest
    await user.type(interestInput, 'Too Many')
    await user.click(addButton)

    expect(screen.queryByText('Too Many')).not.toBeInTheDocument()
    expect(screen.getByText(/Maximum 10 interests allowed/)).toBeInTheDocument()
  })

  it('allows selection of looking for options', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    const coFounderButton = screen.getByRole('button', { name: 'Co-founder' })
    await user.click(coFounderButton)

    expect(coFounderButton).toHaveClass('bg-blue-500/30', 'border-blue-500', 'text-blue-300')

    // Click again to deselect
    await user.click(coFounderButton)
    expect(coFounderButton).not.toHaveClass('bg-blue-500/30')
  })

  it('selects visibility option', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    const publicButton = screen.getByRole('button', { name: /Public.*Anyone can see your persona/ })
    await user.click(publicButton)

    expect(publicButton).toHaveClass('bg-purple-500/20', 'border-purple-500')
  })

  it('toggles preview visibility', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    const previewButton = screen.getByRole('button', { name: /Preview/ })
    
    // Initially preview should be hidden
    expect(screen.queryByText(/How Others See You/)).not.toBeInTheDocument()

    // Click to show preview
    await user.click(previewButton)
    expect(screen.getByText(/How Others See You/)).toBeInTheDocument()

    // Click to hide preview
    await user.click(previewButton)
    expect(screen.queryByText(/How Others See You/)).not.toBeInTheDocument()
  })

  it('shows character count for display name', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    const displayNameInput = screen.getByLabelText(/Display Name/)
    await user.type(displayNameInput, 'Test')

    expect(screen.getByText('4/50 characters')).toBeInTheDocument()
  })

  it('shows character count for bio with color coding', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    const bioInput = screen.getByLabelText(/Bio/)
    await user.type(bioInput, 'Short bio')

    expect(screen.getByText(/49\/300 characters \(minimum 50\)/)).toBeInTheDocument()
    
    // With minimum characters, should show green check
    const longBio = 'This is a longer bio that meets the minimum character requirement and should show green color'
    await user.clear(bioInput)
    await user.type(bioInput, longBio)

    expect(screen.getByText('✓ Perfect length')).toBeInTheDocument()
  })

  it('handles skip action when provided', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    const skipButton = screen.getByRole('button', { name: /Skip for now/ })
    await user.click(skipButton)

    expect(defaultProps.onSkip).toHaveBeenCalledOnce()
  })

  it('calls onSuccess callback after successful submission', async () => {
    const user = userEvent.setup()
    render(<PersonaCreationForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/Display Name/), 'Test User')
    await user.type(
      screen.getByLabelText(/Bio/),
      'This is a valid bio that meets the minimum character requirement.'
    )

    const submitButton = screen.getByRole('button', { name: /Create Persona/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalledWith({ id: 'persona-1' })
    })
  })

  it('supports edit mode with initial data', () => {
    const initialData = {
      display_name: 'Existing User',
      bio: 'This is an existing bio that is valid for testing.',
      interests: ['Web3', 'DeFi'],
      looking_for: ['Networking', 'Collaboration'],
      visibility: 'public' as const,
    }

    render(
      <PersonaCreationForm 
        {...defaultProps} 
        isEdit={true}
        initialData={initialData}
      />
    )

    expect(screen.getByDisplayValue('Existing User')).toBeInTheDocument()
    expect(screen.getByDisplayValue('This is an existing bio that is valid for testing.')).toBeInTheDocument()
    expect(screen.getByText('Web3')).toBeInTheDocument()
    expect(screen.getByText('DeFi')).toBeInTheDocument()
    expect(screen.getByText('Networking')).toBeInTheDocument()
    expect(screen.getByText('Collaboration')).toBeInTheDocument()
  })

  it('submits with PATCH method in edit mode', async () => {
    const user = userEvent.setup()
    const initialData = {
      display_name: 'Existing User',
      bio: 'This is an existing bio that is valid for testing.',
      interests: ['Web3'],
      looking_for: ['Networking'],
      visibility: 'public' as const,
    }

    render(
      <PersonaCreationForm 
        {...defaultProps} 
        isEdit={true}
        initialData={initialData}
      />
    )

    const submitButton = screen.getByRole('button', { name: /Update Persona/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/personas', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Existing User'),
      })
    })
  })
})