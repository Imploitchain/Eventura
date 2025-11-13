import { useCallback, useMemo } from 'react'
import { useAccount, useChainId, useReadContract, useWriteContract } from 'wagmi'
import { EventTicketingABI, getContractAddresses } from '@/lib/contracts'

export function useEventTicketing() {
  const { address: walletAddress, isConnected } = useAccount()
  const chainId = useChainId()
  const { EventTicketing } = useMemo(() => getContractAddresses(chainId ?? 0), [chainId])

  const isReady = Boolean(EventTicketing && EventTicketing.length === 42 && isConnected)

  // Reads
  const getEvent = (eventId: bigint) =>
    useReadContract({
      address: EventTicketing as `0x${string}`,
      abi: EventTicketingABI,
      functionName: 'getEvent',
      args: [eventId],
      query: { enabled: isReady && typeof eventId !== 'undefined' },
    })

  const isSoldOut = (eventId: bigint) =>
    useReadContract({
      address: EventTicketing as `0x${string}`,
      abi: EventTicketingABI,
      functionName: 'isSoldOut',
      args: [eventId],
      query: { enabled: isReady && typeof eventId !== 'undefined' },
    })

  const getAvailableTickets = (eventId: bigint) =>
    useReadContract({
      address: EventTicketing as `0x${string}`,
      abi: EventTicketingABI,
      functionName: 'getAvailableTickets',
      args: [eventId],
      query: { enabled: isReady && typeof eventId !== 'undefined' },
    })

  // Writes
  const { writeContract, isPending: isWriting } = useWriteContract()

  const purchaseTicket = useCallback(
    async (eventId: bigint, priceWei: bigint) => {
      if (!isReady) throw new Error('Wallet not connected or contract not configured')
      return writeContract({
        address: EventTicketing as `0x${string}`,
        abi: EventTicketingABI,
        functionName: 'purchaseTicket',
        args: [eventId],
        value: priceWei,
      })
    },
    [EventTicketing, isReady, writeContract]
  )

  const refundTicket = useCallback(
    async (ticketId: bigint) => {
      if (!isReady) throw new Error('Wallet not connected or contract not configured')
      return writeContract({
        address: EventTicketing as `0x${string}`,
        abi: EventTicketingABI,
        functionName: 'refundTicket',
        args: [ticketId],
      })
    },
    [EventTicketing, isReady, writeContract]
  )

  const joinWaitlist = useCallback(
    async (eventId: bigint) => {
      if (!isReady) throw new Error('Wallet not connected or contract not configured')
      return writeContract({
        address: EventTicketing as `0x${string}`,
        abi: EventTicketingABI,
        functionName: 'joinWaitlist',
        args: [eventId],
      })
    },
    [EventTicketing, isReady, writeContract]
  )

  const leaveWaitlist = useCallback(
    async (eventId: bigint) => {
      if (!isReady) throw new Error('Wallet not connected or contract not configured')
      return writeContract({
        address: EventTicketing as `0x${string}`,
        abi: EventTicketingABI,
        functionName: 'leaveWaitlist',
        args: [eventId],
      })
    },
    [EventTicketing, isReady, writeContract]
  )

  return {
    walletAddress,
    chainId,
    isReady,
    isWriting,
    getEvent,
    isSoldOut,
    getAvailableTickets,
    purchaseTicket,
    refundTicket,
    joinWaitlist,
    leaveWaitlist,
  }
}
