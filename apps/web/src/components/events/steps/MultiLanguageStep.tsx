'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MultiLanguageStepProps {
  formData: any
  onChange: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

const LANGUAGES = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
]

export function MultiLanguageStep({ formData, onChange, onNext, onPrevious }: MultiLanguageStepProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [currentLanguage, setCurrentLanguage] = useState('')

  const handleInputChange = (field: string, value: string, langCode: string) => {
    const translations = formData.translations || {}
    const langTranslations = translations[langCode] || {}
    
    const updated = {
      ...translations,
      [langCode]: {
        ...langTranslations,
        [field]: value,
      },
    }
    
    onChange({ ...formData, translations: updated })
  }

  const addLanguage = (langCode: string) => {
    if (!selectedLanguages.includes(langCode)) {
      setSelectedLanguages([...selectedLanguages, langCode])
    }
    setCurrentLanguage(langCode)
  }

  const removeLanguage = (langCode: string) => {
    const updated = selectedLanguages.filter(code => code !== langCode)
    setSelectedLanguages(updated)
    
    const translations = { ...formData.translations }
    delete translations[langCode]
    onChange({ ...formData, translations })
  }

  const copyFromDefault = (langCode: string) => {
    handleInputChange('title', formData.title, langCode)
    handleInputChange('shortDescription', formData.shortDescription, langCode)
    handleInputChange('fullDescription', formData.fullDescription, langCode)
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Multi-Language Support (Optional)</CardTitle>
          <CardDescription>
            Add translations to make your event accessible to a global audience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Add Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => addLanguage(lang.code)}
                  disabled={selectedLanguages.includes(lang.code)}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                    selectedLanguages.includes(lang.code)
                      ? 'bg-blue-100 border-blue-300 text-blue-700 cursor-not-allowed'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Click on a language to add translations. Optional step - you can skip if not needed.
            </p>
          </div>

          {/* Translation Forms */}
          {selectedLanguages.map((langCode) => {
            const lang = LANGUAGES.find(l => l.code === langCode)
            const translations = formData.translations?.[langCode] || {}
            
            return (
              <div key={langCode} className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {lang?.flag} {lang?.name} Translation
                  </h4>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeLanguage(langCode)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Translated Title
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyFromDefault(langCode)}
                  >
                    Copy from default
                  </Button>
                </div>
                <input
                  type="text"
                  value={translations.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value, langCode)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Event title in this language"
                  maxLength={100}
                />

                <label className="text-sm font-medium text-gray-700">
                  Translated Short Description
                </label>
                <textarea
                  value={translations.shortDescription || ''}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value, langCode)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Short description in this language"
                  rows={3}
                  maxLength={200}
                />

                <label className="text-sm font-medium text-gray-700">
                  Translated Full Description
                </label>
                <textarea
                  value={translations.fullDescription || ''}
                  onChange={(e) => handleInputChange('fullDescription', e.target.value, langCode)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full description in this language"
                  rows={4}
                  maxLength={5000}
                />
              </div>
            )
          })}

          {selectedLanguages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No languages selected. Click on a language above to add translations.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  )
}