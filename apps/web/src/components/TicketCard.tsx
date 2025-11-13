'use client'

import { useState } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Ticket, Download, Share2, ExternalLink, QrCode, RefreshCw, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import QRCodeReact from 'qrcode.react'
import type { EventWithMetadata, LanguageCode } from '@/types/multilang-event'
import { getTranslation, detectUserLanguage } from '@/utils/multilang'
import { formatEventDate } from '@/utils/multilang'

// TODO: Update with actual deployed contract address on Base L2
const EVENT_TICKETING_ADDRESS = process.env.NEXT_PUBLIC_EVENT_TICKETING_ADDRESS || '0x0000000000000000000000000000000000000000'

export interface TicketData {
  ticketId: bigint
  eventId: bigint
  owner: string
  used: boolean
  purchaseTime: bigint
  event: EventWithMetadata
}

interface TicketCardProps {
  ticket: TicketData
  language?: LanguageCode
  onTransferSuccess?: () => void
  onRefundSuccess?: () => void
  compact?: boolean
}

export function TicketCard({
  ticket,
  language = detectUserLanguage(),
  onTransferSuccess,
  onRefundSuccess,
  compact = false
}: TicketCardProps) {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [showQR, setShowQR] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferAddress, setTransferAddress] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translation = getTranslation(ticket.event.metadata, language)

  // Check if event has started or ended
  const now = Date.now() / 1000
  const hasStarted = now >= Number(ticket.event.startTime)
  const hasEnded = now >= Number(ticket.event.endTime)
  const canRefund = !hasStarted && !ticket.used

  // Generate QR code data
  const qrData = JSON.stringify({
    ticketId: ticket.ticketId.toString(),
    eventId: ticket.eventId.toString(),
    owner: ticket.owner,
    contract: EVENT_TICKETING_ADDRESS,
    network: 'base',
  })

  const handleDownloadQR = () => {
    const canvas = document.getElementById(`qr-${ticket.ticketId}`) as HTMLCanvasElement
    if (!canvas) return

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `ticket-${ticket.ticketId}.png`
    link.href = url
    link.click()
  }

  const handleTransfer = async () => {
    if (!walletClient || !address || !publicClient) {
      setError('Wallet not connected')
      return
    }

    if (!transferAddress || transferAddress.length !== 42) {
      setError('Please enter a valid Ethereum address')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // TODO: Replace with actual contract call
      // const hash = await walletClient.writeContract({
      //   address: EVENT_TICKETING_ADDRESS,
      //   abi: EventTicketingABI,
      //   functionName: 'safeTransferFrom',
      //   args: [address, transferAddress, ticket.ticketId]
      // })
      //
      // await publicClient.waitForTransactionReceipt({ hash })

      // Mock success for development
      await new Promise(resolve => setTimeout(resolve, 2000))

      setShowTransferModal(false)
      onTransferSuccess?.()
      alert('Ticket transferred successfully!')

    } catch (err: any) {
      console.error('Transfer error:', err)
      setError(err.message || 'Failed to transfer ticket')
    } finally {
      setProcessing(false)
    }
  }

  const handleRefund = async () => {
    if (!walletClient || !address || !publicClient) {
      alert('Wallet not connected')
      return
    }

    if (!confirm('Are you sure you want to refund this ticket? This action cannot be undone.')) {
      return
    }

    setProcessing(true)

    try {
      // TODO: Replace with actual contract call
      // const hash = await walletClient.writeContract({
      //   address: EVENT_TICKETING_ADDRESS,
      //   abi: EventTicketingABI,
      //   functionName: 'refundTicket',
      //   args: [ticket.ticketId]
      // })
      //
      // await publicClient.waitForTransactionReceipt({ hash })

      // Mock success for development
      await new Promise(resolve => setTimeout(resolve, 2000))

      onRefundSuccess?.()
      alert('Ticket refunded successfully!')

    } catch (err: any) {
      console.error('Refund error:', err)
      alert(err.message || 'Failed to refund ticket')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-lg overflow-hidden shadow-lg"
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          {ticket.used ? (
            <span className="px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              USED
            </span>
          ) : hasEnded ? (
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
              EXPIRED
            </span>
          ) : hasStarted ? (
            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full animate-pulse">
              ACTIVE
            </span>
          ) : (
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              VALID
            </span>
          )}
        </div>

        {/* Event Image Header */}
        {ticket.event.metadata.media?.coverImage && (
          <div className="relative h-32 overflow-hidden">
            <img
              src={ticket.event.metadata.media.coverImage.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt={translation.name}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
          </div>
        )}

        {/* Ticket Content */}
        <div className="p-6">
          {/* Ticket ID */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Ticket ID</span>
            </div>
            <span className="text-lg font-mono font-bold text-white">#{ticket.ticketId.toString()}</span>
          </div>

          {/* Event Details */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">{translation.name}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>{formatEventDate(ticket.event.startTime, language)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-green-400" />
                <span>{translation.location}</span>
              </div>
            </div>
          </div>

          {/* NFT Info */}
          <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400 mb-1">NFT Contract</p>
            <p className="text-xs font-mono text-white break-all">{EVENT_TICKETING_ADDRESS}</p>
            <p className="text-xs text-gray-400 mt-2 mb-1">Owner</p>
            <p className="text-xs font-mono text-white break-all">{ticket.owner}</p>
            <p className="text-xs text-gray-400 mt-2 mb-1">Network</p>
            <p className="text-xs text-white">Base L2</p>
          </div>

          {/* QR Code Section */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-white rounded-lg flex flex-col items-center"
            >
              <QRCodeReact
                id={`qr-${ticket.ticketId}`}
                value={qrData}
                size={200}
                level="H"
                includeMargin
              />
              <p className="text-xs text-gray-600 mt-2 text-center">
                Scan this QR code at the event entrance
              </p>
              <button
                onClick={handleDownloadQR}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>
            </motion.div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <QrCode className="w-4 h-4" />
              {showQR ? 'Hide' : 'Show'} QR
            </button>

            <Link
              href={`/events/${ticket.eventId}`}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Event
            </Link>

            <button
              onClick={() => setShowTransferModal(true)}
              disabled={ticket.used || hasStarted || processing}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Transfer
            </button>

            <button
              onClick={handleRefund}
              disabled={!canRefund || processing}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refund
            </button>
          </div>

          {/* Purchase Info */}
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400">
            <p>Purchased: {new Date(Number(ticket.purchaseTime) * 1000).toLocaleDateString()}</p>
            <p>Price: {(Number(ticket.event.ticketPrice) / 1e18).toFixed(4)} ETH</p>
          </div>
        </div>
      </motion.div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-white/20"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Transfer Ticket</h3>

            <p className="text-sm text-gray-300 mb-6">
              Transfer this ticket NFT to another wallet address. The recipient will become the new owner.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTransferModal(false)
                  setTransferAddress('')
                  setError(null)
                }}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={processing || !transferAddress}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Confirm Transfer'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
