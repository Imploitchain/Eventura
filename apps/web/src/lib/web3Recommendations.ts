/**
 * Web3-Enhanced Recommendation System
 *
 * Integrates blockchain data via Reown/WalletConnect to provide
 * Web3-native recommendations based on:
 * - On-chain transaction history
 * - NFT ownership and collections
 * - Wallet activity patterns
 * - Token holdings
 * - Previous event attendance (NFT tickets)
 */

import type { Address } from 'viem'
import type { PublicClient } from 'viem'
import type { EventWithMetadata } from '@/types/multilang-event'
import { getEventCategory, getEventPrice, getEventId } from './eventHelpers'
import type { UserProfile } from './recommendations'
import { createPublicClient, http } from "viem";
/**
 * Web3 user profile enrichment
 */
export interface Web3Profile {
  address: Address
  nftCollections?: string[] // NFT collection addresses user owns
  attendedEvents?: string[] // Event IDs from owned ticket NFTs
  tokenBalances?: Record<string, bigint> // Token address -> balance
  transactionCount?: number
  accountAge?: number // Days since first transaction
  interactionScore?: number // Overall on-chain activity score
}

/**
 * Fetch user's NFT collections via Reown/WalletConnect
 *
 * This uses the publicClient from wagmi to query on-chain data
 * In a production app, you might use:
 * - Alchemy NFT API
 * - Moralis API
 * - The Graph protocol
 * - Direct contract calls via Reown
 */

const client = createPublicClient({
  chain : celoSepolia,
  transport: http(),
});
export async function fetchUserNFTCollections(
  address: Address,
  publicClient: PublicClient
): Promise<string[]> {
  try {
    // Example: Query user's NFT balance
    // In production, integrate with NFT indexing services
    // or use Reown's wallet_getCapabilities to check NFT support

    // For now, return empty array - this would be replaced with actual API calls
    const collections: string[] = []

    // TODO: Implement actual NFT fetching via:
    // 1. Reown wallet_watchAsset RPC method
    // 2. eth_call to NFT contracts (ERC-721/ERC-1155)
    // 3. Integration with Base NFT indexers

    return collections
  } catch (error) {
    console.error('Error fetching NFT collections:', error)
    return []
  }
}

/**
 * Fetch user's attended events from ticket NFTs
 *
 * Queries the Eventura smart contract to find events where user owns tickets
 */
export async function fetchAttendedEvents(
  address: Address,
  publicClient: PublicClient,
  eventContractAddress: Address
): Promise<string[]> {
  try {
    // Example contract interaction via Reown/WalletConnect
    // This would read from the Eventura ticket contract on Base

    const attendedEvents: string[] = []

    // TODO: Implement via:
    // 1. Query ticket NFT contract for user's ticket balance
    // 2. Get token IDs owned by address
    // 3. Map token IDs to event IDs
    // 4. Return event IDs user has attended

    /*
    const ticketBalance = await publicClient.readContract({
      address: eventContractAddress,
      abi: EventContractABI,
      functionName: 'balanceOf',
      args: [address],
    })

    // Get all ticket token IDs for this address
    for (let i = 0; i < ticketBalance; i++) {
      const tokenId = await publicClient.readContract({
        address: eventContractAddress,
        abi: EventContractABI,
        functionName: 'tokenOfOwnerByIndex',
        args: [address, BigInt(i)],
      })

      // Get event ID from token metadata
      const eventId = await publicClient.readContract({
        address: eventContractAddress,
        abi: EventContractABI,
        functionName: 'getEventIdForTicket',
        args: [tokenId],
      })

      attendedEvents.push(eventId.toString())
    }
    */

    return attendedEvents
  } catch (error) {
    console.error('Error fetching attended events:', error)
    return []
  }
}

/**
 * Calculate Web3 interaction score based on on-chain activity
 *
 * Uses Reown to analyze wallet activity and engagement
 */
export async function calculateWeb3Score(
  address: Address,
  publicClient: PublicClient
): Promise<number> {
  try {
    let score = 0

    // Get transaction count as a proxy for activity
    const txCount = await publicClient.getTransactionCount({ address })
    score += Math.min(txCount / 100, 5) // Max 5 points for transactions

    // Get account balance
    const balance = await publicClient.getBalance({ address })
    const ethBalance = Number(balance) / (10 ** 18)
    score += Math.min(ethBalance / 10, 3) // Max 3 points for balance

    // TODO: Add more sophisticated scoring:
    // - NFT collection diversity
    // - DeFi protocol interactions
    // - Social graph connections (Lens, Farcaster)
    // - ENS domain ownership
    // - POAPs collected

    return score
  } catch (error) {
    console.error('Error calculating Web3 score:', error)
    return 0
  }
}

/**
 * Build enhanced user profile with Web3 data
 *
 * Combines traditional user interactions with on-chain behavior
 */
export async function buildWeb3Profile(
  address: Address,
  publicClient: PublicClient,
  eventContractAddress?: Address
): Promise<Web3Profile> {
  const [nftCollections, attendedEvents, interactionScore] = await Promise.all([
    fetchUserNFTCollections(address, publicClient),
    eventContractAddress
      ? fetchAttendedEvents(address, publicClient, eventContractAddress)
      : Promise.resolve([]),
    calculateWeb3Score(address, publicClient),
  ])

  return {
    address,
    nftCollections,
    attendedEvents,
    interactionScore,
  }
}

/**
 * Enhance recommendations with Web3 data
 *
 * Boosts event scores based on blockchain activity and ownership
 */
export function applyWeb3Boost(
  events: EventWithMetadata[],
  web3Profile: Web3Profile,
  baseScores: Map<string, number>
): Map<string, { score: number; reasons: string[] }> {
  const enhancedScores = new Map<string, { score: number; reasons: string[] }>()

  events.forEach((event) => {
    const eventId = getEventId(event)
    const baseScore = baseScores.get(eventId) || 0
    let boost = 0
    const reasons: string[] = []

    // Boost based on Web3 activity score
    if (web3Profile.interactionScore && web3Profile.interactionScore > 5) {
      boost += 1
      reasons.push('Active Web3 user')
    }

    // Boost if organizer's address matches user's NFT collections
    // (suggests shared community/interests)
    if (
      web3Profile.nftCollections &&
      web3Profile.nftCollections.includes(event.organizer.toLowerCase())
    ) {
      boost += 2
      reasons.push('From collection you own')
    }

    // Boost based on previous event attendance
    if (web3Profile.attendedEvents && web3Profile.attendedEvents.length > 0) {
      // Check if this is by same organizer as attended events
      boost += 0.5
      reasons.push('Similar to events you attended')
    }

    // Boost high-value events for high-balance wallets
    const eventPrice = getEventPrice(event)
    if (web3Profile.tokenBalances) {
      const totalValue = Object.values(web3Profile.tokenBalances).reduce(
        (sum, balance) => sum + Number(balance),
        0
      )
      if (totalValue > 10 ** 18 && eventPrice > 100) {
        // Large balance + premium event
        boost += 1
        reasons.push('Premium event match')
      }
    }

    enhancedScores.set(eventId, {
      score: baseScore + boost,
      reasons,
    })
  })

  return enhancedScores
}

/**
 * Get wallet-based event recommendations
 *
 * Main entry point for Web3-enhanced recommendations via Reown/WalletConnect
 */
export async function getWeb3Recommendations(
  address: Address,
  publicClient: PublicClient,
  allEvents: EventWithMetadata[],
  userProfile: UserProfile,
  baseRecommendations: Map<string, number>,
  eventContractAddress?: Address
): Promise<Array<{ eventId: string; score: number; reasons: string[] }>> {
  // Build Web3 profile
  const web3Profile = await buildWeb3Profile(
    address,
    publicClient,
    eventContractAddress
  )

  // Apply Web3 boosts to base recommendations
  const enhancedScores = applyWeb3Boost(
    allEvents,
    web3Profile,
    baseRecommendations
  )

  // Convert to array and sort
  const recommendations = Array.from(enhancedScores.entries())
    .map(([eventId, { score, reasons }]) => ({
      eventId,
      score,
      reasons,
    }))
    .sort((a, b) => b.score - a.score)

  return recommendations
}

/**
 * Check if user can afford an event based on wallet balance
 *
 * Uses Reown to check user's token balances on Base
 */
export async function canAffordEvent(
  address: Address,
  publicClient: PublicClient,
  event: EventWithMetadata
): Promise<boolean> {
  try {
    const balance = await publicClient.getBalance({ address })
    const eventPrice = event.ticketPrice

    // Add 10% buffer for gas fees
    const priceWithGas = (eventPrice * BigInt(110)) / BigInt(100)

    return balance >= priceWithGas
  } catch (error) {
    console.error('Error checking affordability:', error)
    return false
  }
}

/**
 * Filter events user can afford
 */
export async function filterAffordableEvents(
  address: Address,
  publicClient: PublicClient,
  events: EventWithMetadata[]
): Promise<EventWithMetadata[]> {
  const affordabilityChecks = await Promise.all(
    events.map((event) => canAffordEvent(address, publicClient, event))
  )

  return events.filter((_, index) => affordabilityChecks[index])
}
