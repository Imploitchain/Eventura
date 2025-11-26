import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventCard } from '../../src/components/EventCard'
import { render } from '../utils/test-utils'

// Mock the dependencies
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useWalletClient: vi.fn(),
  usePublicClient: vi.fn(),
}))

vi.mock('@reown/appkit/react', () => ({
  useAppKit: () => ({ open: vi.fn() }),
}))

vi.mock('@/store/useOnboardingStore', () => ({
  useOnboardingStore: () => ({
    markMilestone: vi.fn(),
    markFeatureAsSeen: vi.fn(),
    seenFeatures: {},
  }),
}))

vi.mock('@/utils/multilang', () => ({
  getTranslation: vi.fn((metadata, language) => ({
    name: metadata.en?.name || 'Test Event',
    description: metadata.en?.description || 'Test description',
    category: metadata.en?.category || 'Conference',
    location: 'New York, NY',
    venue: 'Convention Center',
  })),
  detectUserLanguage: () => 'en' as const,
  formatEventDate: vi.fn((timestamp, language) => 'Dec 25, 2025'),
}))

vi.mock('@/utils/rateLimit', () => ({
  rateLimitWallet: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/utils/botDetection', () => ({
  detectBot: () => ({ isBot: false, confidence: 0 }),
}))

vi.mock('@/components/HCaptcha', () => ({
  HCaptcha: ({ onVerify }: { onVerify: (token: string) => void }) => (
    <button onClick={() => onVerify('mock-captcha-token')}>Complete CAPTCHA</button>
  ),
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className, ...props }: any) => (
    <a href={href} className={className} {...props}>{children}</a>
  ),
}))

const mockEvent = {
  id: 1,
  startTime: 1704067200n, // Dec 25, 2024
  endTime: 1704074400n, // Dec 25, 2024
  ticketPrice: 1000000000000000000n, // 1 ETH in wei
  maxTickets: 100n,
  ticketsSold: 25n,
  metadata: {
    en: {
      name: 'Test Event',
      description: 'A test event for testing purposes',
      category: 'Conference',
      location: 'New York, NY',
      venue: 'Convention Center',
      media: {
        coverImage: 'ipfs://test-cover-image',
      },
    },
  },
}

const mockProps = {
  event: mockEvent,
  onPurchaseSuccess: vi.fn(),
}

describe('EventCard', () => {
  const { useAccount, useWalletClient, usePublicClient } = await import('wagmi')

  beforeEach(() => {
    vi.clearAllMocks()
    useAccount.mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    })
    useWalletClient.mockReturnValue({
      data: { writeContract: vi.fn() },
    })
    usePublicClient.mockReturnValue({
      waitForTransactionReceipt: vi.fn(),
    })
  })

  it('renders event information correctly', () => {
    render(<EventCard {...mockProps} />)

    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText('A test event for testing purposes')).toBeInTheDocument()
    expect(screen.getByText('Conference')).toBeInTheDocument()
    expect(screen.getByText('New York, NY')).toBeInTheDocument()
    expect(screen.getByText('Convention Center')).toBeInTheDocument()
    expect(screen.getByText('1.0000 ETH')).toBeInTheDocument()
  })

  it('shows correct ticket availability', () => {
    render(<EventCard {...mockProps} />)

    expect(screen.getByText('75/100')).toBeInTheDocument()
    expect(screen.getByText('Available Tickets')).toBeInTheDocument()
  })

  it('shows progress bar with correct color', () => {
    render(<EventCard {...mockProps} />)

    const progressBar = document.querySelector('.h-full')
    expect(progressBar).toHaveClass('bg-green-500') // 25% sold = green
  })

  it('shows sold out badge when sold out', () => {
    const soldOutEvent = {
      ...mockEvent,
      ticketsSold: mockEvent.maxTickets,
    }

    render(<EventCard event={soldOutEvent} />)

    expect(screen.getByText('SOLD OUT')).toBeInTheDocument()
  })

  it('shows join waitlist button when sold out', () => {
    const soldOutEvent = {
      ...mockEvent,
      ticketsSold: mockEvent.maxTickets,
    }

    render(<EventCard event={soldOutEvent} />)

    expect(screen.getByText('Join Waitlist')).toBeInTheDocument()
  })

  it('shows "ENDED" badge when event has ended', () => {
    const endedEvent = {
      ...mockEvent,
      startTime: 1703808000n, // Dec 25, 2024 (past)
      endTime: 1703815200n, // Dec 25, 2024 (past)
    }

    // Mock current time to be after the event
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))

    render(<EventCard event={endedEvent} />)

    expect(screen.getByText('ENDED')).toBeInTheDocument()
  })

  it('shows "LIVE" badge when event is currently happening', () => {
    const liveEvent = {
      ...mockEvent,
      startTime: Math.floor(Date.now() / 1000) - 3600n, // Started 1 hour ago
      endTime: Math.floor(Date.now() / 1000) + 3600n, // Ends in 1 hour
    }

    render(<EventCard event={liveEvent} />)

    expect(screen.getByText('LIVE')).toBeInTheDocument()
  })

  it('shows "Started" button when event has started', () => {
    const startedEvent = {
      ...mockEvent,
      startTime: Math.floor(Date.now() / 1000) - 3600n, // Started 1 hour ago
    }

    render(<EventCard event={startedEvent} />)

    expect(screen.getByText('Started')).toBeInTheDocument()
  })

  it('disables buy button when wallet not connected', () => {
    useAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    })

    render(<EventCard {...mockProps} />)

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  it('enables buy button when wallet connected and event not started', () => {
    render(<EventCard {...mockProps} />)

    expect(screen.getByText('Buy Ticket')).toBeInTheDocument()
  })

  it('opens purchase modal when buy button clicked', async () => {
    const user = userEvent.setup()
    render(<EventCard {...mockProps} />)

    const buyButton = screen.getByText('Buy Ticket')
    await user.click(buyButton)

    expect(screen.getByText('Confirm Purchase')).toBeInTheDocument()
    expect(screen.getByText('Test Event')).toBeInTheDocument() // In modal
  })

  it('shows alert when user tries to buy without wallet connected', async () => {
    const user = userEvent.setup()
    useAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    })

    render(<EventCard {...mockProps} />)

    const buyButton = screen.getByText('Connect Wallet')
    
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {})

    await user.click(buyButton)

    expect(window.alert).toHaveBeenCalledWith('Please connect your wallet first')
  })

  it('shows alert when user tries to buy for started event', async () => {
    const user = userEvent.setup()
    const startedEvent = {
      ...mockEvent,
      startTime: Math.floor(Date.now() / 1000) - 3600n,
    }

    vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<EventCard event={startedEvent} />)

    const buyButton = screen.getByText('Started')
    await user.click(buyButton)

    expect(window.alert).toHaveBeenCalledWith('Event has already started')
  })

  it('handles purchase flow successfully', async () => {
    const user = userEvent.setup()
    const mockTicketId = BigInt(123)

    render(<EventCard {...mockProps} />)

    // Open purchase modal
    const buyButton = screen.getByText('Buy Ticket')
    await user.click(buyButton)

    // Complete CAPTCHA
    const captchaButton = screen.getByText('Complete CAPTCHA')
    await user.click(captchaButton)

    // Confirm purchase
    const confirmButton = screen.getByText('Confirm Purchase')
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockProps.onPurchaseSuccess).toHaveBeenCalledWith(mockTicketId)
    })
  })

  it('handles purchase failure', async () => {
    const user = userEvent.setup()
    
    // Mock failed purchase
    const { rateLimitWallet } = await import('@/utils/rateLimit')
    rateLimitWallet.mockRejectedValueOnce(new Error('Purchase failed'))

    render(<EventCard {...mockProps} />)

    // Open purchase modal
    const buyButton = screen.getByText('Buy Ticket')
    await user.click(buyButton)

    // Complete CAPTCHA
    const captchaButton = screen.getByText('Complete CAPTCHA')
    await user.click(captchaButton)

    // Confirm purchase
    const confirmButton = screen.getByText('Confirm Purchase')
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Purchase failed')).toBeInTheDocument()
    })
  })

  it('shows loading state during purchase', async () => {
    const user = userEvent.setup()
    
    // Mock slow purchase
    const { rateLimitWallet } = await import('@/utils/rateLimit')
    rateLimitWallet.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
    )

    render(<EventCard {...mockProps} />)

    // Open purchase modal
    const buyButton = screen.getByText('Buy Ticket')
    await user.click(buyButton)

    // Complete CAPTCHA
    const captchaButton = screen.getByText('Complete CAPTCHA')
    await user.click(captchaButton)

    // Confirm purchase
    const confirmButton = screen.getByText('Confirm Purchase')
    await user.click(confirmButton)

    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })

  it('shows tooltip on first view', () => {
    render(<EventCard {...mockProps} />)

    // Tooltip should appear after a delay
    setTimeout(() => {
      expect(screen.getByText('System Hint')).toBeInTheDocument()
    }, 1000)
  })

  it('dismisses tooltip when acknowledged', async () => {
    const user = userEvent.setup()
    
    render(<EventCard {...mockProps} />)

    // Wait for tooltip to appear
    setTimeout(async () => {
      const acknowledgeButton = screen.getByText('Acknowledge')
      await user.click(acknowledgeButton)

      expect(screen.queryByText('System Hint')).not.toBeInTheDocument()
    }, 1000)
  })

  it('navigates to event details when view data clicked', () => {
    render(<EventCard {...mockProps} />)

    const viewDataLink = screen.getByText('VIEW_DATA')
    expect(viewDataLink).toHaveAttribute('href', '/events/1')
  })

  it('navigates to waitlist when event is sold out', () => {
    const soldOutEvent = {
      ...mockEvent,
      ticketsSold: mockEvent.maxTickets,
    }

    render(<EventCard event={soldOutEvent} />)

    const waitlistLink = screen.getByText('Join Waitlist')
    expect(waitlistLink).toHaveAttribute('href', '/events/1#waitlist')
  })

  it('renders without cover image when not provided', () => {
    const eventWithoutImage = {
      ...mockEvent,
      metadata: {
        en: {
          name: 'Test Event',
          description: 'Test description',
          category: 'Conference',
          location: 'New York, NY',
          venue: 'Convention Center',
          // No media property
        },
      },
    }

    render(<EventCard event={eventWithoutImage} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('converts IPFS URL to HTTP for images', () => {
    render(<EventCard {...mockProps} />)

    const coverImage = screen.getByRole('img', { name: 'Test Event' })
    expect(coverImage).toHaveAttribute('src', 'https://ipfs.io/ipfs/test-cover-image')
  })

  it('shows compact version when compact prop is true', () => {
    render(<EventCard {...mockProps} compact={true} />)

    // Should still render all content but without the h-full class
    expect(screen.getByText('Test Event')).toBeInTheDocument()
  })

  it('shows different progress bar colors based on percentage sold', () => {
    // Test high percentage (red)
    const almostSoldOutEvent = {
      ...mockEvent,
      ticketsSold: 95n, // 95%
    }

    const { container: redContainer } = render(<EventCard event={almostSoldOutEvent} />)
    const redProgressBar = redContainer.querySelector('.h-full')
    expect(redProgressBar).toHaveClass('bg-red-500')

    // Test medium percentage (yellow)
    const halfSoldEvent = {
      ...mockEvent,
      ticketsSold: 75n, // 75%
    }

    const { container: yellowContainer } = render(<EventCard event={halfSoldEvent} />)
    const yellowProgressBar = yellowContainer.querySelector('.h-full')
    expect(yellowProgressBar).toHaveClass('bg-yellow-500')

    // Test low percentage (green)
    const fewSoldEvent = {
      ...mockEvent,
      ticketsSold: 25n, // 25%
    }

    const { container: greenContainer } = render(<EventCard event={fewSoldEvent} />)
    const greenProgressBar = greenContainer.querySelector('.h-full')
    expect(greenProgressBar).toHaveClass('bg-green-500')
  })

  it('disables confirm purchase button without CAPTCHA', async () => {
    const user = userEvent.setup()
    
    render(<EventCard {...mockProps} />)

    // Open purchase modal
    const buyButton = screen.getByText('Buy Ticket')
    await user.click(buyButton)

    // Confirm purchase should be disabled initially
    const confirmButton = screen.getByText('Confirm Purchase')
    expect(confirmButton).toBeDisabled()

    // Complete CAPTCHA
    const captchaButton = screen.getByText('Complete CAPTCHA')
    await user.click(captchaButton)

    // Now confirm button should be enabled
    expect(confirmButton).not.toBeDisabled()
  })

  it('closes purchase modal when cancel clicked', async () => {
    const user = userEvent.setup()
    render(<EventCard {...mockProps} />)

    // Open purchase modal
    const buyButton = screen.getByText('Buy Ticket')
    await user.click(buyButton)

    expect(screen.getByText('Confirm Purchase')).toBeInTheDocument()

    // Cancel
    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(screen.queryByText('Confirm Purchase')).not.toBeInTheDocument()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.setSystemTime()
  })
})