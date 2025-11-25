'use client'

import * as React from 'react'
import Image, { ImageProps } from 'next/image'

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string
  fallback?: string
  blurDataURL?: string
  optimizedSizes?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
  }
  isAvatar?: boolean
  isEventCover?: boolean
}

const OptimizedImage = React.forwardRef<HTMLDivElement, OptimizedImageProps>(
  ({
    src,
    fallback,
    blurDataURL,
    optimizedSizes,
    isAvatar = false,
    isEventCover = false,
    className,
    alt,
    ...props
  }, ref) => {
    const [imageError, setImageError] = React.useState(false)
    const [imageLoading, setImageLoading] = React.useState(true)

    // Generate blur placeholder using SVG gradient
    const generateBlurPlaceholder = () => {
      const color1 = 'rgb(59, 130, 246)' // Blue-500
      const color2 = 'rgb(147, 51, 234)' // Purple-500
      const svg = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${color1};stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:${color2};stop-opacity:0.3" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#a)" />
        </svg>
      `
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
    }

    // Calculate sizes based on component type
    const calculateSizes = () => {
      if (optimizedSizes) {
        return `(max-width: 640px) ${optimizedSizes.sm || '100vw'}, (max-width: 768px) ${optimizedSizes.md || '100vw'}, (max-width: 1024px) ${optimizedSizes.lg || '100vw'}, ${optimizedSizes.xl || '100vw'}`
      }

      if (isAvatar) {
        return '(max-width: 640px) 200px, 200px'
      }

      if (isEventCover) {
        return '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
      }

      return '100vw'
    }

    const handleError = () => {
      setImageError(true)
      setImageLoading(false)
    }

    const handleLoad = () => {
      setImageLoading(false)
    }

    // Convert IPFS URLs to gateway URLs
    const formatSrc = (src: string) => {
      if (src.startsWith('ipfs://')) {
        return src.replace('ipfs://', 'https://ipfs.io/ipfs/')
      }
      return src
    }

    if (imageError && fallback) {
      return (
        <div ref={ref} className={`bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center ${className}`}>
          <Image
            src={fallback}
            alt={alt}
            className={`opacity-50 ${className}`}
            width={isAvatar ? 200 : 400}
            height={isAvatar ? 200 : 300}
          />
        </div>
      )
    }

    return (
      <div ref={ref} className="relative overflow-hidden">
        <Image
          src={formatSrc(src)}
          alt={alt}
          className={`${className} ${imageLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL || generateBlurPlaceholder()}
          sizes={calculateSizes()}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
          quality={isAvatar ? 85 : 90}
          {...props}
        />
        {imageLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 animate-pulse" />
        )}
      </div>
    )
  }
)

OptimizedImage.displayName = 'OptimizedImage'

export { OptimizedImage }