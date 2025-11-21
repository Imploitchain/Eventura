'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BasicInfoStepProps {
  formData: any
  onChange: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

const CATEGORIES = [
  'Tech Conference',
  'Workshop',
  'Concert',
  'Festival',
  'Networking',
  'Meetup',
  'Webinar',
  'Sports',
  'Art Exhibition',
  'Food & Drink',
  'Other',
]

export function BasicInfoStep({ formData, onChange, onNext, onPrevious }: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    onChange(updated)
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.shortDescription?.trim()) {
      newErrors.shortDescription = 'Short description is required'
    } else if (formData.shortDescription.length > 200) {
      newErrors.shortDescription = 'Short description must be 200 characters or less'
    }

    if (!formData.fullDescription?.trim()) {
      newErrors.fullDescription = 'Full description is required'
    } else if (formData.fullDescription.length > 5000) {
      newErrors.fullDescription = 'Full description must be 5000 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Let's start with the fundamentals of your event. These details will help attendees understand what to expect.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your event title"
              maxLength={100}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            <p className="text-xs text-gray-500">{formData.title?.length || 0}/100 characters</p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              value={formData.category || ''}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Short Description *
            </label>
            <textarea
              value={formData.shortDescription || ''}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description for event cards and listings"
              rows={3}
              maxLength={200}
            />
            {errors.shortDescription && <p className="text-sm text-red-600">{errors.shortDescription}</p>}
            <p className="text-xs text-gray-500">{formData.shortDescription?.length || 0}/200 characters</p>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Full Description *
            </label>
            <textarea
              value={formData.fullDescription || ''}
              onChange={(e) => handleInputChange('fullDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of your event"
              rows={6}
              maxLength={5000}
            />
            {errors.fullDescription && <p className="text-sm text-red-600">{errors.fullDescription}</p>}
            <p className="text-xs text-gray-500">{formData.fullDescription?.length || 0}/5000 characters</p>
          </div>
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