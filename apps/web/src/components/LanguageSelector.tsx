'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check } from 'lucide-react'
import type { LanguageCode } from '@/types/multilang-event'
import { SUPPORTED_LANGUAGES } from '@/types/multilang-event'

interface LanguageSelectorProps {
  currentLanguage: LanguageCode
  availableLanguages: LanguageCode[]
  onLanguageChange: (language: LanguageCode) => void
  className?: string
}

export function LanguageSelector({
  currentLanguage,
  availableLanguages,
  onLanguageChange,
  className = '',
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4 text-white" />
        <span className="text-white font-medium">
          {SUPPORTED_LANGUAGES[currentLanguage].nativeName}
        </span>
        <svg
          className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-md rounded-lg border border-white/20 shadow-xl overflow-hidden z-50"
            >
              <div className="p-2 max-h-96 overflow-y-auto">
                {availableLanguages.map((lang) => {
                  const langInfo = SUPPORTED_LANGUAGES[lang]
                  const isSelected = lang === currentLanguage

                  return (
                    <button
                      key={lang}
                      onClick={() => {
                        onLanguageChange(lang)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-white/10 text-gray-300'
                      }`}
                      dir={langInfo.rtl ? 'rtl' : 'ltr'}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{langInfo.nativeName}</span>
                        <span className="text-sm opacity-75">{langInfo.name}</span>
                      </div>
                      {isSelected && <Check className="w-5 h-5" />}
                    </button>
                  )
                })}
              </div>

              {availableLanguages.length === 0 && (
                <div className="p-4 text-center text-gray-400">
                  No translations available
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact version for mobile/smaller spaces
export function LanguageSelectorCompact({
  currentLanguage,
  availableLanguages,
  onLanguageChange,
  className = '',
}: LanguageSelectorProps) {
  return (
    <select
      value={currentLanguage}
      onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
      className={`px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label="Select language"
    >
      {availableLanguages.map((lang) => (
        <option key={lang} value={lang} className="bg-slate-800">
          {SUPPORTED_LANGUAGES[lang].nativeName}
        </option>
      ))}
    </select>
  )
}
