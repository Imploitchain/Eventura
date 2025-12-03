import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  query: {},
  asPath: '/',
  route: '/',
  pathname: '/',
  isFallback: false,
  isReady: true,
  isPreview: false,
  isLocaleDomain: true,
  locales: ['en'],
  locale: 'en',
  defaultLocale: 'en',
  domainLocales: [],
  isHydrating: true,
  basePath: '',
  localePath: vi.fn(),
  pathnameWithQuery: '/',
  getPathname: vi.fn(),
  isDynamicRoute: vi.fn(),
  isPathnameNew: vi.fn(),
  isMiddleware: vi.fn(),
  isShallowNavigation: vi.fn(),
  isHmrRefresh: vi.fn(),
  beforePopState: vi.fn(),
  afterNextTick: vi.fn(),
}

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}))

// Mock Next.js usePathname
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation')
  return {
    ...actual,
    usePathname: () => '/',
    useRouter: () => mockRouter,
    useSearchParams: () => new URLSearchParams(),
  }
})

// Mock Wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    isConnecting: false,
    isDisconnected: false,
  }),
  useConnect: () => ({
    connect: vi.fn(),
    connectors: [],
    error: null,
    isLoading: false,
    isPending: false,
    reset: vi.fn(),
  }),
  useDisconnect: () => ({
    disconnect: vi.fn(),
    isPending: false,
  }),
  useNetwork: () => ({
    chain: null,
    chains: [],
    isLoading: false,
    error: null,
    status: 'connected',
  }),
  useBalance: () => ({
    data: { formatted: '1.23', symbol: 'ETH', value: BigInt(1230000000000000000) },
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

// Mock Supabase client
vi.mock('./src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    realtime: {
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn().mockReturnThis(),
      }),
    },
  },
}))

// Mock IPFS utilities
vi.mock('./src/utils/ipfs', () => ({
  uploadToIPFS: vi.fn().mockResolvedValue('ipfs://example'),
  uploadImageToIPFS: vi.fn().mockResolvedValue('ipfs://example-image'),
}))

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
  }),
}))

// Mock react-big-calendar
vi.mock('react-big-calendar', () => ({
  Calendar: ({ children }: { children: React.ReactNode }) => children,
  momentLocalizer: () => ({}),
  eventPropGetter: () => ({}),
  views: ['month', 'week', 'day', 'agenda'],
}))

// Mock moment
vi.mock('moment', () => ({
  default: {
    format: vi.fn().mockReturnValue('2025-11-25'),
    add: vi.fn().mockReturnThis(),
    subtract: vi.fn().mockReturnThis(),
    isAfter: vi.fn().mockReturnValue(false),
    isBefore: vi.fn().mockReturnValue(false),
    toDate: vi.fn().mockReturnValue(new Date()),
  },
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})