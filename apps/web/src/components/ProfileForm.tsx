'use client'

import { useState, useEffect, useRef } from 'react'
import { useSignMessage } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Save,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  Camera,
  X
} from 'lucide-react'

interface ProfileFormProps {
  walletAddress: string
}

interface ProfileData {
  wallet_address: string
  display_name?: string
  global_bio?: string
  avatar_ipfs_hash?: string
}

export function ProfileForm({ walletAddress }: ProfileFormProps) {
  const { signMessageAsync } = useSignMessage()

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarHash, setAvatarHash] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch existing profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/users/profile/${walletAddress}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setDisplayName(data.data.display_name || '')
            setBio(data.data.global_bio || '')
            setAvatarHash(data.data.avatar_ipfs_hash || '')
            if (data.data.avatar_ipfs_hash) {
              const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
              const url = gateway.endsWith('/')
                ? `${gateway}${data.data.avatar_ipfs_hash}`
                : `${gateway}/${data.data.avatar_ipfs_hash}`
              setAvatarPreview(url)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setFetchingProfile(false)
      }
    }

    fetchProfile()
  }, [walletAddress])

  // Calculate profile completeness
  const calculateCompleteness = () => {
    let score = 0
    if (displayName.trim()) score += 40
    if (bio.trim()) score += 30
    if (avatarHash) score += 30
    return score
  }

  const completeness = calculateCompleteness()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to IPFS
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setAvatarHash(data.cid)
      setSuccessMessage('Avatar uploaded successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload avatar')
      setAvatarPreview('')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarHash('')
    setAvatarPreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Generate message for signing
      const timestamp = Date.now()
      const message = `Sign this message to authenticate with Eventura\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost any gas fees.`

      // Sign the message
      const signature = await signMessageAsync({ message })

      // Submit profile
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          display_name: displayName.trim() || undefined,
          global_bio: bio.trim() || undefined,
          avatar_ipfs_hash: avatarHash || undefined,
          message,
          signature,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save profile')
      }

      setSuccessMessage('Profile saved successfully!')
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err: any) {
      console.error('Profile save error:', err)
      setError(err.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Completeness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Profile Completeness</h3>
          <span className="text-sm font-bold text-purple-400">{completeness}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completeness}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
        <p className="text-xs text-white/60 mt-2">
          {completeness === 100
            ? 'Your profile is complete!'
            : 'Complete your profile to make better connections'}
        </p>
      </motion.div>

      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-6"
      >
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-2 border-white/20 flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-white/40" />
              )}
            </div>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Upload Avatar
              </>
            )}
          </button>
        </div>

        {/* Wallet Address (read-only) */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            value={walletAddress}
            readOnly
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 text-sm cursor-not-allowed"
          />
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Display Name
            <span className="text-white/40 ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            placeholder="Enter your display name"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-white/40 mt-1">
            {displayName.length}/50 characters
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Bio
            <span className="text-white/40 ml-1">(Optional)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          />
          <p className="text-xs text-white/40 mt-1">
            {bio.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Profile
            </>
          )}
        </button>
      </motion.form>
    </div>
  )
}
