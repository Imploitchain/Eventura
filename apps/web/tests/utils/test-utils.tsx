import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { WagmiConfig, createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

// Mock Wagmi config for testing
const mockConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
})

// Custom render wrapper that provides all necessary providers
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={mockConfig}>
      {children}
    </WagmiConfig>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Mock data factories
export const mockUser = {
  id: 'user-1',
  wallet_address: '0x1234567890123456789012345678901234567890',
  username: 'testuser',
  display_name: 'Test User',
  bio: 'This is a test user',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  interests: ['blockchain', 'web3', 'events'],
  location: 'New York, NY',
  website: 'https://example.com',
  verified: true,
}

export const mockEvent = {
  id: 'event-1',
  title: 'Test Event',
  description: 'This is a test event description',
  start_date: '2025-12-25T18:00:00Z',
  end_date: '2025-12-25T22:00:00Z',
  location: 'Test Location',
  capacity: 100,
  price: 25.50,
  currency: 'ETH',
  image_url: 'https://example.com/event.jpg',
  created_by: mockUser.id,
  status: 'active',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  tags: ['test', 'blockchain'],
  max_tickets_per_person: 10,
  refund_policy: 'full_refund_24h',
  category: 'conference',
  is_private: false,
  requires_approval: false,
  sold_out: false,
  attendee_count: 25,
}

export const mockAttendee = {
  id: 'attendee-1',
  event_id: mockEvent.id,
  user_id: mockUser.id,
  status: 'confirmed',
  ticket_type: 'general',
  created_at: '2025-01-01T00:00:00Z',
  user: mockUser,
  ticket: {
    id: 'ticket-1',
    event_id: mockEvent.id,
    owner_id: mockUser.id,
    type: 'general',
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
  },
}

export const mockMessage = {
  id: 'message-1',
  sender_id: mockUser.id,
  receiver_id: 'user-2',
  content: 'Hello! This is a test message.',
  created_at: '2025-01-01T12:00:00Z',
  read_at: null,
  sender: mockUser,
  receiver: {
    id: 'user-2',
    wallet_address: '0x0987654321098765432109876543210987654321',
    username: 'otheruser',
    display_name: 'Other User',
    avatar_url: 'https://example.com/avatar2.jpg',
  },
}

export const mockConnection = {
  id: 'connection-1',
  requester_id: mockUser.id,
  receiver_id: 'user-2',
  status: 'pending',
  created_at: '2025-01-01T00:00:00Z',
  requester: mockUser,
  receiver: {
    id: 'user-2',
    wallet_address: '0x0987654321098765432109876543210987654321',
    username: 'otheruser',
    display_name: 'Other User',
    avatar_url: 'https://example.com/avatar2.jpg',
  },
}

export const mockNotification = {
  id: 'notification-1',
  user_id: mockUser.id,
  type: 'connection_request',
  title: 'New Connection Request',
  message: 'You have a new connection request',
  read: false,
  created_at: '2025-01-01T00:00:00Z',
  data: {
    connection_id: mockConnection.id,
  },
}

export const mockProfile = {
  id: 'profile-1',
  user_id: mockUser.id,
  display_name: 'Test User',
  bio: 'This is a test profile bio',
  location: 'San Francisco, CA',
  website: 'https://example.com',
  avatar_url: 'https://example.com/avatar.jpg',
  cover_image_url: 'https://example.com/cover.jpg',
  interests: ['blockchain', 'web3', 'events', 'networking'],
  skills: ['Solidity', 'React', 'Node.js'],
  experience_level: 'intermediate',
  social_links: {
    twitter: 'https://twitter.com/testuser',
    linkedin: 'https://linkedin.com/in/testuser',
    github: 'https://github.com/testuser',
  },
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}