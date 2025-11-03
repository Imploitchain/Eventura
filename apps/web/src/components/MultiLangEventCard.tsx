'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Globe } from 'lucide-react'
import type { EventWithMetadata, LanguageCode } from '@/types/multilang-event'
import { SUPPORTED_LANGUAGES } from '@/types/multilang-event'
import { getTranslation, formatEventDate, formatPrice, getAvailableLanguages, getTextDirection } from '@/utils/multilang'
import { LanguageSelector } from './LanguageSelector'

interface MultiLangEventCardProps {
  event: EventWithMetadata
  defaultLanguage?: LanguageCode
  onLanguageChange?: (language: LanguageCode) => void
}

export function MultiLangEventCard({
  event,
  defaultLanguage = 'en',
  onLanguageChange,
}: MultiLangEventCardProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(defaultLanguage)
  const [translation, setTranslation] = useState(() =>
    getTranslation(event.metadata, selectedLanguage)
  )

  const availableLanguages = getAvailableLanguages(event.metadata)
  const textDirection = getTextDirection(selectedLanguage)

  useEffect(() => {
    setTranslation(getTranslation(event.metadata, selectedLanguage))
  }, [selectedLanguage, event.metadata])

  const handleLanguageChange = (lang: LanguageCode) => {
    setSelectedLanguage(lang)
    onLanguageChange?.(lang)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all hover:shadow-2xl"
    >
      {/* Cover Image */}
      {event.metadata.media?.coverImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.metadata.media.coverImage.replace('ipfs://', 'https://ipfs.io/ipfs/')}
            alt={translation.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

          {/* Language Selector Overlay */}
          <div className="absolute top-4 right-4">
            <LanguageSelector
              currentLanguage={selectedLanguage}
              availableLanguages={availableLanguages}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
              {translation.category}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6" dir={textDirection}>
        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3">
          {translation.name}
        </h3>

        {/* Description */}
        <p className="text-gray-300 mb-4 line-clamp-3">
          {translation.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm">
              {formatEventDate(event.startTime, selectedLanguage)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm">
              {translation.location} • {translation.venue}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm">
              {Number(event.ticketsSold)} / {Number(event.maxTickets)} tickets sold
            </span>
          </div>
        </div>

        {/* Tags */}
        {translation.tags && translation.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {translation.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-white">
            <div className="text-sm text-gray-400">Price</div>
            <div className="text-xl font-bold">{formatPrice(event.ticketPrice, selectedLanguage)}</div>
          </div>

          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
            Buy Ticket
          </button>
        </div>

        {/* Available Languages Indicator */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">
            Available in {availableLanguages.length} language{availableLanguages.length > 1 ? 's' : ''}: {' '}
            {availableLanguages.map(lang => SUPPORTED_LANGUAGES[lang].nativeName).join(', ')}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Simplified version for lists
export function MultiLangEventCardCompact({
  event,
  defaultLanguage = 'en',
}: Omit<MultiLangEventCardProps, 'onLanguageChange'>) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(defaultLanguage)
  const translation = getTranslation(event.metadata, selectedLanguage)
  const textDirection = getTextDirection(selectedLanguage)

  return (
    <div className="flex gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors" dir={textDirection}>
      {event.metadata.media?.coverImage && (
        <img
          src={event.metadata.media.coverImage.replace('ipfs://', 'https://ipfs.io/ipfs/')}
          alt={translation.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
      )}

      <div className="flex-1">
        <h4 className="text-white font-semibold mb-1">{translation.name}</h4>
        <p className="text-gray-400 text-sm mb-2 line-clamp-1">{translation.location}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{formatEventDate(event.startTime, selectedLanguage)}</span>
          <span>{formatPrice(event.ticketPrice, selectedLanguage)}</span>
        </div>
      </div>
    </div>
  )
}
