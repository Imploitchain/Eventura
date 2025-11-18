'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Target, Sparkles, UserPlus, CheckCircle } from 'lucide-react'

interface AttendeeCardProps {
  attendee: {
    id: string
    wallet_address: string
    display_name: string
    bio?: string
    interests: string[]
    looking_for: string[]
    avatar_ipfs_hash?: string
    shared_interests_count: number
    match_score: number
  }
  isConnected?: boolean
  onConnect?: (attendeeId: string) => void
}

const LOOKING_FOR_COLORS: Record<string, string> = {
  'Co-founder': 'bg-purple-500/20 border-purple-500/30 text-purple-300',
  'Mentorship': 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  'Networking': 'bg-green-500/20 border-green-500/30 text-green-300',
  'Friends': 'bg-pink-500/20 border-pink-500/30 text-pink-300',
  'Job Opportunities': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
  'Business Partners': 'bg-orange-500/20 border-orange-500/30 text-orange-300',
  'Investors': 'bg-red-500/20 border-red-500/30 text-red-300',
  'Collaboration': 'bg-teal-500/20 border-teal-500/30 text-teal-300',
  'Learning': 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
  'Fun': 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-300'
}

export function AttendeeCard({ attendee, isConnected = false, onConnect }: AttendeeCardProps) {
  const [showFullBio, setShowFullBio] = useState(false)
  const [imageError, setImageError] = useState(false)

  const getAvatarUrl = (ipfsHash: string) => {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
    return gateway.endsWith('/')
      ? `${gateway}${ipfsHash}`
      : `${gateway}/${ipfsHash}`
  }

  const getBioSnippet = (bio: string, maxLength: number = 150) => {
    if (bio.length <= maxLength) return bio
    return bio.substring(0, maxLength) + '...'
  }

  const getLookingForColor = (item: string) => {
    return LOOKING_FOR_COLORS[item] || 'bg-gray-500/20 border-gray-500/30 text-gray-300'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
    >
      {/* Header with Avatar and Name */}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-2 border-white/20 flex items-center justify-center flex-shrink-0">
            {attendee.avatar_ipfs_hash && !imageError ? (
              <img
                src={getAvatarUrl(attendee.avatar_ipfs_hash)}
                alt={attendee.display_name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <User className="w-8 h-8 text-white/40" />
            )}
          </div>

          {/* Name and Badges */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-2 truncate">
              {attendee.display_name}
            </h3>

            {/* Shared Interests Badge */}
            {attendee.shared_interests_count > 0 && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50 rounded-full"
              >
                <Target className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-bold text-purple-200">
                  {attendee.shared_interests_count} shared interest{attendee.shared_interests_count > 1 ? 's' : ''}
                </span>
                <span className="text-lg">🎯</span>
              </motion.div>
            )}

            {/* Already Connected Badge */}
            {isConnected && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full ml-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Connected</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {attendee.bio && (
          <div className="mb-4">
            <p className="text-sm text-white/70 leading-relaxed">
              {showFullBio ? attendee.bio : getBioSnippet(attendee.bio)}
              {attendee.bio.length > 150 && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="ml-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  {showFullBio ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Interests */}
        {attendee.interests.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-semibold text-white/50">Interests</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {attendee.interests.slice(0, 5).map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300"
                >
                  {interest}
                </span>
              ))}
              {attendee.interests.length > 5 && (
                <span className="px-3 py-1 text-xs text-white/50">
                  +{attendee.interests.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Looking For */}
        {attendee.looking_for.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <p className="text-xs font-semibold text-white/50">Looking For</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {attendee.looking_for.map((item) => (
                <span
                  key={item}
                  className={`px-3 py-1 border rounded-full text-xs ${getLookingForColor(item)}`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer with Connect Button */}
      <div className="px-6 pb-6">
        {!isConnected && onConnect && (
          <button
            onClick={() => onConnect(attendee.id)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <UserPlus className="w-5 h-5" />
            Connect
          </button>
        )}
        {isConnected && (
          <div className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 text-green-300 font-semibold rounded-lg">
            <CheckCircle className="w-5 h-5" />
            Already Connected
          </div>
        )}
      </div>
    </motion.div>
  )
}
