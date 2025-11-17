import { useEffect, useMemo, useState } from 'react'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import { EventFactoryABI, getContractAddresses } from '@/lib/contracts'
import type { Event as ChainEvent, EventWithMetadata, EventMetadata } from '@/types/multilang-event'
import { fetchFromIPFS } from '@/utils/ipfs'

export function useOnchainEvents() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { EventFactory } = useMemo(() => getContractAddresses(chainId ?? 0), [chainId])

  const [events, setEvents] = useState<EventWithMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!publicClient || !EventFactory || EventFactory.length !== 42) return
      setLoading(true)
      setError(null)
      try {
        const total: bigint = await publicClient.readContract({
          address: EventFactory as `0x${string}`,
          abi: EventFactoryABI,
          functionName: 'getTotalEvents',
          args: [],
        })

        const items: EventWithMetadata[] = []
        for (let i = 0n; i < total; i++) {
          const ev = (await publicClient.readContract({
            address: EventFactory as `0x${string}`,
            abi: EventFactoryABI,
            functionName: 'getEvent',
            args: [i],
          })) as unknown as ChainEvent

          // Fetch and attach metadata
          let metadata: EventMetadata | undefined
          try {
            metadata = await fetchFromIPFS(ev.metadataURI)
          } catch (_e) {
            metadata = undefined
          }

          const withMeta: EventWithMetadata = {
            ...ev,
            metadata: metadata ?? {
              version: '1.0.0',
              defaultLanguage: 'en',
              translations: { en: { name: 'Untitled', description: '', location: '', venue: '', category: '' } },
            },
          }
          items.push(withMeta)
        }
        if (!cancelled) setEvents(items)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load events')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (isConnected) {
      load()
    } else {
      setEvents([])
    }

    return () => {
      cancelled = true
    }
  }, [isConnected, publicClient, EventFactory])

  return { events, loading, error }
}
