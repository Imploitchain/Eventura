import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockAttendee, mockUser } from '../utils/test-utils'

// Mock the API
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock AttendeeCard component to test integration
vi.mock('../../src/components/AttendeeCard', () => ({
  AttendeeCard: ({ attendee, isConnected, onConnect }: any) => (
    <div data-testid="attendee-card">
      <div>{attendee.display_name}</div>
      <div>{attendee.bio}</div>
      <div>{attendee.shared_interests_count} shared interests</div>
      {isConnected && <div>Connected</div>}
      {!isConnected && onConnect && (
        <button data-testid="connect-button" onClick={() => onConnect(attendee.id)}>
          Connect
        </button>
      )}
    </div>
  ),
}))

// Mock Supabase real-time
vi.mock('../../src/lib/supabase/client', () => ({
  supabase: {
    realtime: {
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      }),
    },
  },
}))

// Mock useSearch hook
vi.mock('../../src/hooks/useSearch', () => ({
  useSearch: () => ({
    attendees: [
      {
        ...mockAttendee,
        id: 'attendee-1',
        display_name: 'Alice Johnson',
        bio: 'Blockchain developer',
        shared_interests_count: 3,
        isConnected: false,
      },
      {
        ...mockAttendee,
        id: 'attendee-2',
        display_name: 'Bob Smith',
        bio: 'DeFi enthusiast',
        shared_interests_count: 2,
        isConnected: true,
      },
    ],
    loading: false,
    search: vi.fn(),
    applyFilter: vi.fn(),
  }),
}))

const AttendeeDiscoveryPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedFilter, setSelectedFilter] = React.useState('all')
  const { attendees, loading, search, applyFilter } = useSearch()
  
  const mockConnect = vi.fn()

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    search(term)
  }

  const handleFilter = (filter: string) => {
    setSelectedFilter(filter)
    applyFilter(filter)
  }

  const handleConnect = async (attendeeId: string) => {
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_attendee_id: attendeeId }),
      })
      
      if (response.ok) {
        mockConnect(attendeeId)
        // Show success modal or message
      }
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  return (
    <div>
      <h1>Discover Attendees</h1>
      
      {/* Search Bar */}
      <div>
        <input
          data-testid="search-input"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search attendees..."
        />
      </div>

      {/* Filters */}
      <div>
        <button
          data-testid="filter-all"
          className={selectedFilter === 'all' ? 'active' : ''}
          onClick={() => handleFilter('all')}
        >
          All Attendees
        </button>
        <button
          data-testid="filter-interests"
          className={selectedFilter === 'interests' ? 'active' : ''}
          onClick={() => handleFilter('interests')}
        >
          Shared Interests
        </button>
        <button
          data-testid="filter-connected"
          className={selectedFilter === 'connected' ? 'active' : ''}
          onClick={() => handleFilter('connected')}
        >
          Connected
        </button>
      </div>

      {/* Attendee List */}
      {loading ? (
        <div data-testid="loading">Loading attendees...</div>
      ) : (
        <div>
          {attendees.map((attendee: any) => (
            <AttendeeCard
              key={attendee.id}
              attendee={attendee}
              isConnected={attendee.isConnected}
              onConnect={handleConnect}
            />
          ))}
        </div>
      )}

      {/* Success Modal */}
      {mockConnect.called && (
        <div data-testid="success-modal">
          <div>Connection request sent successfully!</div>
        </div>
      )}
    </div>
  )
}

describe('Attendee Discovery Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    
    // Reset mock function call tracking
    vi.clearAllTimers()
  })

  it('loads attendees list successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    })

    render(<AttendeeDiscoveryPage />)

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.getByText('Bob Smith')).toBeInTheDocument()
    })
  })

  it('applies search filter when user types', async () => {
    const user = userEvent.setup()
    render(<AttendeeDiscoveryPage />)

    const searchInput = screen.getByTestId('search-input')
    
    await user.type(searchInput, 'Alice')

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })
  })

  it('toggles between different filter options', async () => {
    const user = userEvent.setup()
    render(<AttendeeDiscoveryPage />)

    // Click on "Shared Interests" filter
    const interestsFilter = screen.getByTestId('filter-interests')
    await user.click(interestsFilter)

    // Filter button should become active
    expect(interestsFilter).toHaveClass('active')

    // Click on "Connected" filter
    const connectedFilter = screen.getByTestId('filter-connected')
    await user.click(connectedFilter)

    // Connected filter should become active
    expect(connectedFilter).toHaveClass('active')
    expect(interestsFilter).not.toHaveClass('active')
  })

  it('sends connection request successfully', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 'connection-1' } }),
    })

    render(<AttendeeDiscoveryPage />)

    const connectButton = screen.getAllByTestId('connect-button')[0]
    await user.click(connectButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('attendee-1'),
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('success-modal')).toBeInTheDocument()
    })
  })

  it('handles connection request failure', async () => {
    const user = userEvent.setup()
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'Request already sent' }),
    })

    render(<AttendeeDiscoveryPage />)

    const connectButton = screen.getAllByTestId('connect-button')[0]
    await user.click(connectButton)

    await waitFor(() => {
      expect(screen.queryByTestId('success-modal')).not.toBeInTheDocument()
    })
  })

  it('shows connected attendees differently', async () => {
    render(<AttendeeDiscoveryPage />)

    const attendee1 = screen.getByText('Alice Johnson').closest('[data-testid="attendee-card"]')
    const attendee2 = screen.getByText('Bob Smith').closest('[data-testid="attendee-card"]')

    // Alice should have connect button (not connected)
    expect(attendee1?.querySelector('[data-testid="connect-button"]')).toBeInTheDocument()
    expect(attendee1?.textContent).not.toContain('Connected')

    // Bob should show "Connected" (no connect button)
    expect(attendee2?.querySelector('[data-testid="connect-button"]')).not.toBeInTheDocument()
    expect(attendee2?.textContent).toContain('Connected')
  })

  it('shows shared interests count for each attendee', async () => {
    render(<AttendeeDiscoveryPage />)

    expect(screen.getByText('3 shared interests')).toBeInTheDocument()
    expect(screen.getByText('2 shared interests')).toBeInTheDocument()
  })

  it('loads attendees with loading state', async () => {
    render(<AttendeeDiscoveryPage />)

    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument()

    // After mock data loads, should show attendees
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })
  })

  it('clears search and shows all attendees', async () => {
    const user = userEvent.setup()
    render(<AttendeeDiscoveryPage />)

    // Search for something specific
    const searchInput = screen.getByTestId('search-input')
    await user.type(searchInput, 'Alice')

    // Clear the search
    await user.clear(searchInput)

    // Should show all attendees again
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
  })

  it('responds to real-time connection status updates', async () => {
    // Mock real-time channel subscription
    const mockChannel = {
      on: vi.fn().mockImplementation((event, callback) => {
        // Simulate real-time update
        setTimeout(() => {
          callback({
            event: 'INSERT',
            new: {
              id: 'attendee-3',
              display_name: 'Charlie Brown',
              isConnected: true,
            },
          })
        }, 100)
        return mockChannel
      }),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn().mockReturnThis(),
    }

    vi.mocked(supabase.realtime.channel).mockReturnValue(mockChannel)

    render(<AttendeeDiscoveryPage />)

    // Wait for real-time update
    await waitFor(() => {
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument()
    })

    // Should show as connected
    const charlie = screen.getByText('Charlie Brown').closest('[data-testid="attendee-card"]')
    expect(charlie?.textContent).toContain('Connected')
  })

  it('handles empty search results', async () => {
    const user = userEvent.setup()
    
    // Mock empty search results
    const { useSearch } = await import('../../src/hooks/useSearch')
    vi.mocked(useSearch).mockReturnValue({
      attendees: [],
      loading: false,
      search: vi.fn(),
      applyFilter: vi.fn(),
    })

    render(<AttendeeDiscoveryPage />)

    const searchInput = screen.getByTestId('search-input')
    await user.type(searchInput, 'NonExistentUser')

    await waitFor(() => {
      expect(screen.getByText(/No attendees found/)).toBeInTheDocument()
    })
  })
})

// Mock React and hooks for the integration test component
import React from 'react'
const useSearch = vi.mocked(require('../../src/hooks/useSearch').useSearch)