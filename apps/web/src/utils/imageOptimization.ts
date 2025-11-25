// Simple image optimization utility
export function optimizeImageUrl(src: string, width?: number): string {
  // Convert IPFS URLs to gateway URLs
  if (src.startsWith('ipfs://')) {
    return src.replace('ipfs://', 'https://ipfs.io/ipfs/')
  }
  return src
}

// Generate blur placeholder
export function generateBlurPlaceholder(): string {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(59, 130, 246);stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:rgb(147, 51, 234);stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#a)" />
    </svg>
  `
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

// Calculate responsive image sizes
export function getImageSizes(isAvatar = false, isEventCover = false): string {
  if (isAvatar) {
    return '(max-width: 640px) 200px, 200px'
  }
  
  if (isEventCover) {
    return '(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
  }
  
  return '100vw'
}