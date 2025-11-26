import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AttendeeCard } from '../../src/components/AttendeeCard'
import { render, mockAttendee } from '../utils/test-utils'

const mockAttendeeData = {
  id: 'attendee-1',
  wallet_address: '0x1234567890123456789012345678901234567890',
  display_name: 'Alice Johnson',
  bio: 'Blockchain developer passionate about Web3 and decentralized technologies. I love building innovative solutions and networking with like-minded individuals.',
  interests: ['Blockchain', 'DeFi', 'NFTs', 'Smart Contracts', 'Web3'],
  looking_for: ['Networking', 'Collaboration', 'Co-founder'],
  avatar_ipfs_hash: 'QmTestHash123',
  shared_interests_count: 3,
  match_score: 85,
}

describe('AttendeeCard', () => {
  it('renders attendee data correctly', () => {
    render(<AttendeeCard attendee={mockAttendeeData} />)

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText(/Blockchain developer passionate/)).toBeInTheDocument()
    expect(screen.getByText('Blockchain')).toBeInTheDocument()
    expect(screen.getByText('DeFi')).toBeInTheDocument()
    expect(screen.getByText('Networking')).toBeInTheDocument()
    expect(screen.getByText('Collaboration')).toBeInTheDocument()
    expect(screen.getByText('Co-founder')).toBeInTheDocument()
  })

  it('shows shared interests badge when count > 0', () => {
    render(<AttendeeCard attendee={mockAttendeeData} />)

    expect(screen.getByText('3 shared interests')).toBeInTheDocument()
    expect(screen.getByText('🎯')).toBeInTheDocument()
  })

  it('does not show shared interests badge when count = 0', () => {
    const attendeeWithoutSharedInterests = {
      ...mockAttendeeData,
      shared_interests_count: 0,
    }

    render(<AttendeeCard attendee={attendeeWithoutSharedInterests} />)

    expect(screen.queryByText(/shared interest/)).not.toBeInTheDocument()
  })

  it('shows connected badge when isConnected is true', () => {
    render(<AttendeeCard attendee={mockAttendeeData} isConnected={true} />)

    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText(/CheckCircle/)).toBeInTheDocument()
  })

  it('does not show connected badge when isConnected is false', () => {
    render(<AttendeeCard attendee={mockAttendeeData} isConnected={false} />)

    expect(screen.queryByText('Connected')).not.toBeInTheDocument()
  })

  it('shows avatar image when avatar_ipfs_hash is provided', () => {
    render(<AttendeeCard attendee={mockAttendeeData} />)

    const avatarContainer = screen.getByRole('img', { name: 'Alice Johnson' })?.parentElement
    expect(avatarContainer).toBeTruthy()
  })

  it('shows fallback User icon when avatar_ipfs_hash is missing', () => {
    const attendeeWithoutAvatar = {
      ...mockAttendeeData,
      avatar_ipfs_hash: undefined,
    }

    render(<AttendeeCard attendee={attendeeWithoutAvatar} />)

    expect(screen.getByText(/User/)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Alice Johnson' })).not.toBeInTheDocument()
  })

  it('shows fallback User icon when avatar image fails to load', async () => {
    render(<AttendeeCard attendee={mockAttendeeData} />)

    const avatarImage = screen.getByRole('img', { name: 'Alice Johnson' })
    
    // Simulate image error
    fireEvent.error(avatarImage)

    await waitFor(() => {
      expect(screen.getByText(/User/)).toBeInTheDocument()
    })
  })

  it('truncates long bio and shows "Read more" button', () => {
    const attendeeWithLongBio = {
      ...mockAttendeeData,
      bio: 'A'.repeat(200), // Very long bio
    }

    render(<AttendeeCard attendee={attendeeWithLongBio} />)

    expect(screen.getByText('Read more')).toBeInTheDocument()
    
    // Bio should be truncated
    const bioText = screen.getByText((content) => 
      content.startsWith('AAAA') && content.includes('...')
    )
    expect(bioText).toBeInTheDocument()
  })

  it('expands bio when "Read more" is clicked', async () => {
    const user = userEvent.setup()
    const attendeeWithLongBio = {
      ...mockAttendeeData,
      bio: 'A'.repeat(200),
    }

    render(<AttendeeCard attendee={attendeeWithLongBio} />)

    const readMoreButton = screen.getByText('Read more')
    await user.click(readMoreButton)

    expect(screen.getByText('Show less')).toBeInTheDocument()
    
    // Bio should now show full text
    const fullBioText = screen.getByText((content) => 
      content.startsWith('AAAA') && !content.includes('...')
    )
    expect(fullBioText).toBeInTheDocument()
  })

  it('collapses bio when "Show less" is clicked', async () => {
    const user = userEvent.setup()
    const attendeeWithLongBio = {
      ...mockAttendeeData,
      bio: 'A'.repeat(200),
    }

    render(<AttendeeCard attendee={attendeeWithLongBio} />)

    // First click to expand
    const readMoreButton = screen.getByText('Read more')
    await user.click(readMoreButton)

    // Then click to collapse
    const showLessButton = screen.getByText('Show less')
    await user.click(showLessButton)

    expect(screen.getByText('Read more')).toBeInTheDocument()
  })

  it('shows full bio when it is shorter than 150 characters', () => {
    const attendeeWithShortBio = {
      ...mockAttendeeData,
      bio: 'Short bio',
    }

    render(<AttendeeCard attendee={attendeeWithShortBio} />)

    expect(screen.getByText('Short bio')).toBeInTheDocument()
    expect(screen.queryByText('Read more')).not.toBeInTheDocument()
  })

  it('shows only first 5 interests with "+N more" when there are more than 5', () => {
    const attendeeWithManyInterests = {
      ...mockAttendeeData,
      interests: ['Blockchain', 'DeFi', 'NFTs', 'Smart Contracts', 'Web3', 'DAO', 'Layer2', 'Metaverse'],
    }

    render(<AttendeeCard attendee={attendeeWithManyInterests} />)

    expect(screen.getByText('Blockchain')).toBeInTheDocument()
    expect(screen.getByText('DeFi')).toBeInTheDocument()
    expect(screen.getByText('NFTs')).toBeInTheDocument()
    expect(screen.getByText('Smart Contracts')).toBeInTheDocument()
    expect(screen.getByText('Web3')).toBeInTheDocument()
    expect(screen.getByText('+3 more')).toBeInTheDocument()
    expect(screen.queryByText('DAO')).not.toBeInTheDocument()
  })

  it('shows all interests when there are 5 or fewer', () => {
    const attendeeWithFewInterests = {
      ...mockAttendeeData,
      interests: ['Blockchain', 'DeFi', 'NFTs'],
    }

    render(<AttendeeCard attendee={attendeeWithFewInterests} />)

    expect(screen.getByText('Blockchain')).toBeInTheDocument()
    expect(screen.getByText('DeFi')).toBeInTheDocument()
    expect(screen.getByText('NFTs')).toBeInTheDocument()
    expect(screen.queryByText('+more')).not.toBeInTheDocument()
  })

  it('applies correct colors to "Looking For" badges', () => {
    render(<AttendeeCard attendee={mockAttendeeData} />)

    // Check for specific color classes
    const networkingBadge = screen.getByText('Networking')
    const collaborationBadge = screen.getByText('Collaboration')
    const coFounderBadge = screen.getByText('Co-founder')

    expect(networkingBadge.closest('span')).toHaveClass('bg-green-500/20', 'border-green-500/30', 'text-green-300')
    expect(collaborationBadge.closest('span')).toHaveClass('bg-teal-500/20', 'border-teal-500/30', 'text-teal-300')
    expect(coFounderBadge.closest('span')).toHaveClass('bg-purple-500/20', 'border-purple-500/30', 'text-purple-300')
  })

  it('shows default color for unknown "Looking For" items', () => {
    const attendeeWithUnknownItems = {
      ...mockAttendeeData,
      looking_for: ['Unknown Item'],
    }

    render(<AttendeeCard attendee={attendeeWithUnknownItems} />)

    const unknownBadge = screen.getByText('Unknown Item')
    expect(unknownBadge.closest('span')).toHaveClass('bg-gray-500/20', 'border-gray-500/30', 'text-gray-300')
  })

  it('shows Connect button when not connected and onConnect is provided', () => {
    const onConnect = vi.fn()
    render(
      <AttendeeCard 
        attendee={mockAttendeeData} 
        isConnected={false}
        onConnect={onConnect}
      />
    )

    expect(screen.getByText('Connect')).toBeInTheDocument()
    expect(screen.getByText(/UserPlus/)).toBeInTheDocument()
  })

  it('calls onConnect when Connect button is clicked', async () => {
    const user = userEvent.setup()
    const onConnect = vi.fn()
    
    render(
      <AttendeeCard 
        attendee={mockAttendeeData} 
        isConnected={false}
        onConnect={onConnect}
      />
    )

    const connectButton = screen.getByText('Connect')
    await user.click(connectButton)

    expect(onConnect).toHaveBeenCalledWith('attendee-1')
  })

  it('does not show Connect button when connected', () => {
    const onConnect = vi.fn()
    render(
      <AttendeeCard 
        attendee={mockAttendeeData} 
        isConnected={true}
        onConnect={onConnect}
      />
    )

    expect(screen.queryByText('Connect')).not.toBeInTheDocument()
    expect(screen.getByText('Already Connected')).toBeInTheDocument()
  })

  it('does not show Connect button when onConnect is not provided', () => {
    render(
      <AttendeeCard 
        attendee={mockAttendeeData} 
        isConnected={false}
      />
    )

    expect(screen.queryByText('Connect')).not.toBeInTheDocument()
    expect(screen.queryByText('Already Connected')).not.toBeInTheDocument()
  })

  it('renders without bio when bio is not provided', () => {
    const attendeeWithoutBio = {
      ...mockAttendeeData,
      bio: undefined,
    }

    render(<AttendeeCard attendee={attendeeWithoutBio} />)

    expect(screen.queryByText(/Blockchain developer/)).not.toBeInTheDocument()
    expect(screen.queryByText('Read more')).not.toBeInTheDocument()
  })

  it('renders without interests section when interests array is empty', () => {
    const attendeeWithoutInterests = {
      ...mockAttendeeData,
      interests: [],
    }

    render(<AttendeeCard attendee={attendeeWithoutInterests} />)

    expect(screen.queryByText('Interests')).not.toBeInTheDocument()
  })

  it('renders without "Looking For" section when looking_for array is empty', () => {
    const attendeeWithoutLookingFor = {
      ...mockAttendeeData,
      looking_for: [],
    }

    render(<AttendeeCard attendee={attendeeWithoutLookingFor} />)

    expect(screen.queryByText('Looking For')).not.toBeInTheDocument()
  })

  it('generates correct IPFS gateway URL', () => {
    // Mock the environment variable
    process.env.NEXT_PUBLIC_IPFS_GATEWAY = 'https://example-gateway.com/ipfs/'
    
    render(<AttendeeCard attendee={mockAttendeeData} />)

    const avatarImage = screen.getByRole('img', { name: 'Alice Johnson' })
    expect(avatarImage).toHaveAttribute('src', 'https://example-gateway.com/ipfs/QmTestHash123')

    // Reset environment
    delete process.env.NEXT_PUBLIC_IPFS_GATEWAY
  })

  it('handles IPFS gateway URL without trailing slash', () => {
    process.env.NEXT_PUBLIC_IPFS_GATEWAY = 'https://example-gateway.com/ipfs'
    
    render(<AttendeeCard attendee={mockAttendeeData} />)

    const avatarImage = screen.getByRole('img', { name: 'Alice Johnson' })
    expect(avatarImage).toHaveAttribute('src', 'https://example-gateway.com/ipfs/QmTestHash123')

    // Reset environment
    delete process.env.NEXT_PUBLIC_IPFS_GATEWAY
  })

  it('uses default IPFS gateway when environment variable is not set', () => {
    delete process.env.NEXT_PUBLIC_IPFS_GATEWAY
    
    render(<AttendeeCard attendee={mockAttendeeData} />)

    const avatarImage = screen.getByRole('img', { name: 'Alice Johnson' })
    expect(avatarImage).toHaveAttribute('src', 'https://ipfs.io/ipfs/QmTestHash123')
  })

  it('applies hover animations', () => {
    render(<AttendeeCard attendee={mockAttendeeData} />)

    const card = screen.getByRole('img', { name: 'Alice Johnson' }).closest('[data-motion]')
    expect(card).toBeTruthy()
  })
})