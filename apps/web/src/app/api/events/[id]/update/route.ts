import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseEther, encodeFunctionData } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { EventFactoryABI, getContractAddresses } from '@/lib/contracts'
import { uploadToIPFS } from '@/utils/ipfs'

// Validate update data
function validateUpdateData(data: any) {
  const errors: string[] = []
  
  if (!data.eventId || typeof data.eventId !== 'number') {
    errors.push('Valid event ID is required')
  }
  
  if (data.title && (typeof data.title !== 'string' || data.title.length > 100)) {
    errors.push('Title must be 100 characters or less')
  }
  
  if (data.shortDescription && (typeof data.shortDescription !== 'string' || data.shortDescription.length > 200)) {
    errors.push('Short description must be 200 characters or less')
  }
  
  if (data.fullDescription && (typeof data.fullDescription !== 'string' || data.fullDescription.length > 5000)) {
    errors.push('Full description must be 5000 characters or less')
  }
  
  if (data.startDateTime && data.endDateTime) {
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
  
  if (data.ticketPrice && (typeof data.ticketPrice !== 'number' || data.ticketPrice < 0)) {
    errors.push('Valid ticket price is required')
  }
  
  if (data.capacity && (typeof data.capacity !== 'number' || data.capacity <= 0)) {
    errors.push('Valid capacity is required')
  }
  
  return errors
}

// Generate update transaction data
function generateUpdateTransactionData(eventId: number, newMetadataURI: string) {
  const updateEventFunction = EventFactoryABI.find(
    (abi) => abi.type === 'function' && abi.name === 'updateEventMetadata'
  ) as any
  
  if (!updateEventFunction) {
    throw new Error('updateEventMetadata function not found in ABI')
  }
  
  return encodeFunctionData({
    abi: [updateEventFunction],
    args: [BigInt(eventId), newMetadataURI],
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { walletAddress, chainId, eventId, ...updateData } = body
    
    // Validate wallet address
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }
    
    // Validate chain ID
    const validChainIds = [8453, 84532] // Base Mainnet, Base Sepolia
    if (!validChainIds.includes(chainId)) {
      return NextResponse.json({ error: 'Invalid chain ID' }, { status: 400 })
    }
    
    // Validate update data
    const validationErrors = validateUpdateData({ ...updateData, eventId })
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
    
    // Create IPFS metadata for updates if needed
    let metadataURI = updateData.metadataURI
    if (updateData.metadata) {
      const uploadResult = await uploadToIPFS(updateData.metadata)
      metadataURI = uploadResult.uri
    }
    
    // Set up viem client
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
    const transactionData = generateUpdateTransactionData(eventId, metadataURI)
    
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
      gasEstimate = 150000n // Default for update
    }
    
    return NextResponse.json({
      success: true,
      data: {
        to: contractAddress,
        data: transactionData,
        value: '0',
        metadataURI,
        estimatedGas: gasEstimate.toString(),
        eventId,
      },
      message: 'Event update ready for blockchain deployment.',
    })
    
  } catch (error: any) {
    console.error('Event update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}