'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  ArrowLeft,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface ProfileData {
  wallet_address: string
  display_name?: string
  global_bio?: string
  avatar_ipfs_hash?: string
  created_at: string
  updated_at: string
}

export default function ProfileViewPage() {
  const params = useParams()
  const router = useRouter()
  const walletAddress = params.wallet as string

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/users/profile/${walletAddress}`)
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Profile not found')
        }

        setProfile(data.data)
      } catch (err: any) {
        console.error('Error fetching profile:', err)
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (walletAddress) {
      fetchProfile()
    }
  }, [walletAddress])

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAvatarUrl = (ipfsHash: string) => {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
    return gateway.endsWith('/')
      ? `${gateway}${ipfsHash}`
      : `${gateway}/${ipfsHash}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
            <p className="text-white/70 mb-6">
              {error || 'This wallet address does not have a profile yet.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
            >
              Go to Home
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 border-b border-white/10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-4 border-white/20 flex items-center justify-center flex-shrink-0">
                {profile.avatar_ipfs_hash ? (
                  <img
                    src={getAvatarUrl(profile.avatar_ipfs_hash)}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white/40" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profile.display_name || 'Anonymous User'}
                </h1>

                {/* Wallet Address */}
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <span className="text-white/70 font-mono text-sm">
                    {formatAddress(profile.wallet_address)}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                    title="Copy full address"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/70" />
                    )}
                  </button>
                  <a
                    href={`https://basescan.org/address/${profile.wallet_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                    title="View on BaseScan"
                  >
                    <ExternalLink className="w-4 h-4 text-white/70" />
                  </a>
                </div>

                {/* Joined Date */}
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-white/50">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile.global_bio && (
            <div className="p-8">
              <h2 className="text-lg font-semibold text-white mb-3">About</h2>
              <p className="text-white/70 whitespace-pre-wrap leading-relaxed">
                {profile.global_bio}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 bg-white/5 border-t border-white/10">
            <p className="text-xs text-white/40 text-center">
              Last updated {formatDate(profile.updated_at)}
            </p>
          </div>
        </motion.div>

        {/* Additional Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Profile Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-white/50 mb-1">Display Name</p>
              <p className="text-white font-medium">
                {profile.display_name || 'Not set'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-white/50 mb-1">Bio</p>
              <p className="text-white font-medium">
                {profile.global_bio ? 'Set' : 'Not set'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-white/50 mb-1">Avatar</p>
              <p className="text-white font-medium">
                {profile.avatar_ipfs_hash ? 'Set' : 'Not set'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-white/50 mb-1">Profile Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <p className="text-white font-medium">Active</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
