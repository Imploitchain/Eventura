// Performance optimization utilities and hooks

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDebounce } from 'use-debounce'

// Debounced search hook for performance
export const useOptimizedSearch = (searchTerm: string, delay: number = 300) => {
  const [debouncedSearch] = useDebounce(searchTerm, delay)
  return debouncedSearch
}

// Memoized event card component with performance optimizations
export const createOptimizedEventCard = (EventCardComponent: React.ComponentType<any>) => {
  const MemoizedEventCard = useMemo(() => {
    const EventCard = (props: any) => {
      const { event, language = 'en', onPurchaseSuccess, compact = false } = props

      // Memoize expensive calculations
      const computedValues = useMemo(() => {
        const soldOut = event.ticketsSold >= event.maxTickets
        const availableTickets = event.maxTickets - event.ticketsSold
        const percentageSold = (Number(event.ticketsSold) / Number(event.maxTickets)) * 100
        const now = Date.now() / 1000
        const hasStarted = now >= Number(event.startTime)
        const hasEnded = now >= Number(event.endTime)
        
        return {
          soldOut,
          availableTickets,
          percentageSold,
          hasStarted,
          hasEnded
        }
      }, [event.ticketsSold, event.maxTickets, event.startTime, event.endTime])

      // Memoize callbacks
      const handlePurchaseClick = useCallback(() => {
        // Logic here
      }, [])

      const handlePurchase = useCallback(async () => {
        // Logic here
      }, [])

      return (
        <EventCardComponent
          {...props}
          computedValues={computedValues}
          handlePurchaseClick={handlePurchaseClick}
          handlePurchase={handlePurchase}
        />
      )
    }
    
    return EventCard
  }, [])
  
  return MemoizedEventCard
}

// Infinite scroll hook
export const useInfiniteScroll = (
  fetchMore: () => void,
  hasMore: boolean = true,
  threshold: number = 100
) => {
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - threshold
      ) {
        if (hasMore) {
          fetchMore()
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [fetchMore, hasMore, threshold])
}

// Image optimization hook
export const useImageOptimization = () => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const optimizeImageUrl = (src: string, width?: number, quality: number = 85) => {
    if (src.startsWith('ipfs://')) {
      return src.replace('ipfs://', 'https://ipfs.io/ipfs/')
    }
    return src
  }

  return {
    imageLoaded,
    imageError,
    setImageLoaded,
    setImageError,
    optimizeImageUrl
  }
}

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`)
      
      // Report to analytics if needed
      if (duration > 100) {
        console.warn(`[Performance] ${componentName} took longer than expected: ${duration.toFixed(2)}ms`)
      }
    }
  })
}

// Cache management utilities
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  clear() {
    this.cache.clear()
  }
  
  clearExpired() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const globalCache = new CacheManager()