// Bundle analysis configuration and performance budgets

module.exports = {
  // Performance budgets (kb)
  budgets: {
    initial: 200, // Initial bundle size ≤ 200KB gzipped
    total: 500,   // Total bundle size ≤ 500KB gzipped
    route: 100    // Individual routes ≤ 100KB gzipped
  },
  
  // Performance monitoring thresholds
  thresholds: {
    FCP: 2000,    // First Contentful Paint ≤ 2s on 3G
    LCP: 2500,    // Largest Contentful Paint ≤ 2.5s
    FID: 100,     // First Input Delay ≤ 100ms
    CLS: 0.1,     // Cumulative Layout Shift ≤ 0.1
    TTI: 3000     // Time to Interactive ≤ 3s
  },
  
  // Bundle analysis enabled
  analyze: process.env.ANALYZE === 'true',
  
  // Optimization targets
  targets: {
    images: {
      maxEventCoverWidth: 1200,
      maxEventCoverHeight: 630,
      maxAvatarSize: 200,
      quality: 85,
      formats: ['image/webp', 'image/avif', 'image/jpeg']
    },
    
    pagination: {
      events: 20,
      attendees: 20,
      messages: 50,
      notifications: 20
    },
    
    caching: {
      events: 5 * 60 * 1000,    // 5 minutes
      attendees: 1 * 60 * 1000, // 1 minute
      recommendations: 5 * 60 * 1000, // 5 minutes
      staticAssets: 24 * 60 * 60 * 1000 // 24 hours
    }
  }
}