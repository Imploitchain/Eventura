import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseEther, encodeFunctionData } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { EventFactoryABI, getContractAddresses } from '@/lib/contracts'
import { uploadToIPFS } from '@/utils/ipfs'

// Validate event data
function validateEventData(data: any) {
  const errors: string[] = []
  
  // Required fields
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required')
  } else if (data.title.length > 100) {
    errors.push('Title must be 100 characters or less')
  }
  
  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required')
  }
  
  if (!data.shortDescription || typeof data.shortDescription !== 'string' || data.shortDescription.trim().length === 0) {
    errors.push('Short description is required')
  } else if (data.shortDescription.length > 200) {
    errors.push('Short description must be 200 characters or less')
  }
  
  if (!data.fullDescription || typeof data.fullDescription !== 'string') {
    errors.push('Full description is required')
  } else if (data.fullDescription.length > 5000) {
    errors.push('Full description must be 5000 characters or less')
  }
  
  if (!data.startDateTime || !data.endDateTime) {
    errors.push('Start and end date/time are required')
  } else {
    const startTime = new Date(data.startDateTime).getTime()
    const endTime = new Date(data.endDateTime).getTime()
    const now = Date.now()
    
    if (isNaN(startTime) || isNaN(endTime)) {
      errors.push('Invalid date format')
    } else if (startTime <= now) {
      errors.push('Start time must be in the future')
    } else if (endTime <= startTime) {
      errors.push('End time must be after start time')
    }
  }
  
  if (!data.locationType || !['physical', 'virtual', 'hybrid'].includes(data.locationType)) {
    errors.push('Valid location type is required (physical, virtual, or hybrid)')
  }
  
  if (!data.ticketPrice || typeof data.ticketPrice !== 'number' || data.ticketPrice < 0) {
    errors.push('Valid ticket price is required')
  }
  
  if (!data.capacity || typeof data.capacity !== 'number' || data.capacity <= 0) {
    errors.push('Valid capacity is required')
  }
  
  if (data.maxTicketsPerWallet && (typeof data.maxTicketsPerWallet !== 'number' || data.maxTicketsPerWallet <= 0)) {
    errors.push('Max tickets per wallet must be a positive number')
  }
  
  // Location validation
  if (data.locationType === 'physical' || data.locationType === 'hybrid') {
    if (!data.address || !data.city || !data.country) {
      errors.push('Address, city, and country are required for physical locations')
    }
  }
  
  if (data.locationType === 'virtual' || data.locationType === 'hybrid') {
    if (!data.meetingLink) {
      errors.push('Meeting link is required for virtual events')
    }
  }
  
  // Image validation
  if (!data.coverImageUrl) {
    errors.push('Cover image is required')
  }
  
  return errors
}

// Create IPFS metadata
async function createEventMetadata(data: any) {
  const metadata = {
    title: data.title,
    category: data.category,
    shortDescription: data.shortDescription,
    fullDescription: data.fullDescription,
    locationType: data.locationType,
    location: {
      address: data.address || '',
      city: data.city || '',
      country: data.country || '',
      meetingLink: data.meetingLink || '',
    },
    dates: {
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
    },
    ticketing: {
      ticketPrice: data.ticketPrice,
      capacity: data.capacity,
      maxTicketsPerWallet: data.maxTicketsPerWallet || 1,
      enableWaitlist: data.enableWaitlist || false,
      refundPolicy: data.refundPolicy || 'full_refund_until_event',
    },
    media: {
      coverImageUrl: data.coverImageUrl,
      additionalImages: data.additionalImages || [],
      videoUrl: data.videoUrl || '',
    },
    translations: data.translations || {},
    createdAt: new Date().toISOString(),
    version: '1.0',
  }
  
  const uploadResult = await uploadToIPFS(metadata)
  return uploadResult
}

// Generate transaction data for frontend
function generateTransactionData(metadataURI: string, startTime: number, endTime: number, ticketPrice: number, capacity: number) {
  const createEventFunction = EventFactoryABI.find(
    (abi) => abi.type === 'function' && abi.name === 'createEvent'
  ) as any
  
  if (!createEventFunction) {
    throw new Error('createEvent function not found in ABI')
  }
  
  return encodeFunctionData({
    abi: [createEventFunction],
    args: [
      metadataURI,
      BigInt(Math.floor(startTime / 1000)),
      BigInt(Math.floor(endTime / 1000)),
      BigInt(parseEther(ticketPrice.toString())),
      BigInt(capacity)
    ],
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { walletAddress, chainId, ...eventData } = body
    
    // Validate wallet address
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }
    
    // Validate chain ID
    const validChainIds = [8453, 84532] // Base Mainnet, Base Sepolia
    if (!validChainIds.includes(chainId)) {
      return NextResponse.json({ error: 'Invalid chain ID' }, { status: 400 })
    }
    
    // Validate event data
    const validationErrors = validateEventData(eventData)
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
    }
    
    // Get contract addresses
    const contractAddresses = getContractAddresses(chainId)
    const contractAddress = contractAddresses.EventFactory
    
    if (!contractAddress) {
      return NextResponse.json({ 
        error: 'EventFactory contract not deployed on this chain' 
      }, { status: 500 })
    }
    
    // Create IPFS metadata
    const ipfsResult = await createEventMetadata(eventData)
    const metadataURI = ipfsResult.uri
    
    // Set up viem client for gas estimation
    const chain = chainId === 8453 ? base : baseSepolia
    const rpcUrl = chainId === 8453 
      ? process.env.NEXT_PUBLIC_BASE_RPC_URL 
      : process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL
    
    if (!rpcUrl) {
      return NextResponse.json({ 
        error: 'RPC URL not configured for this chain' 
      }, { status: 500 })
    }
    
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    })
    
    // Generate transaction data
    const transactionData = generateTransactionData(
      metadataURI,
      new Date(eventData.startDateTime).getTime(),
      new Date(eventData.endDateTime).getTime(),
      eventData.ticketPrice,
      eventData.capacity
    )
    
    // Estimate gas
    let gasEstimate = 0n
    try {
      gasEstimate = await publicClient.estimateGas({
        account: walletAddress as `0x${string}`,
        to: contractAddress as `0x${string}`,
        data: transactionData,
        value: 0n,
      })
    } catch (gasError: any) {
      console.warn('Gas estimation failed:', gasError.message)
      // Use a reasonable default gas limit if estimation fails
      gasEstimate = 200000n
    }
    
    // Return transaction data for frontend to execute
    return NextResponse.json({
      success: true,
      data: {
        to: contractAddress,
        data: transactionData,
        value: '0',
        metadataURI,
        estimatedGas: gasEstimate.toString(),
        contractAddress,
        chainId,
        eventData: {
          title: eventData.title,
          category: eventData.category,
          startDateTime: eventData.startDateTime,
          endDateTime: eventData.endDateTime,
          ticketPrice: eventData.ticketPrice,
          capacity: eventData.capacity,
        },
      },
      message: 'Event metadata created. Ready for blockchain deployment.',
    })
    
  } catch (error: any) {
    console.error('Event creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}