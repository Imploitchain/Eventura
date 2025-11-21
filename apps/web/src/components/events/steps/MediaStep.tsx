'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MediaStepProps {
  formData: any
  onChange: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

export function MediaStep({ formData, onChange, onNext, onPrevious }: MediaStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    onChange(updated)
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.coverImageUrl) {
      newErrors.coverImageUrl = 'Cover image is required'
    }

    if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      newErrors.videoUrl = 'Invalid video URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      onNext()
    }
  }

  const handleImageUpload = (field: string, files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, [field]: 'File size must be less than 10MB' })
        return
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, [field]: 'File must be JPG, PNG, or GIF' })
        return
      }
      
      // TODO: Upload to IPFS
      // For now, create a local URL
      const imageUrl = URL.createObjectURL(file)
      handleInputChange(field, imageUrl)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
          <CardDescription>
            Upload images and media for your event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Cover Image *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {formData.coverImageUrl ? (
                <div className="space-y-4">
                  <img
                    src={formData.coverImageUrl}
                    alt="Cover"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleInputChange('coverImageUrl', '')}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="cover-image" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload cover image
                      </span>
                      <input
                        id="cover-image"
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={(e) => handleImageUpload('coverImageUrl', e.target.files)}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG, or GIF. Max 10MB. Recommended: 1200x630
                    </p>
                  </div>
                </div>
              )}
            </div>
            {errors.coverImageUrl && <p className="text-sm text-red-600">{errors.coverImageUrl}</p>}
          </div>

          {/* Additional Images */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Additional Images (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {formData.additionalImages && formData.additionalImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.additionalImages.map((url: string, index: number) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 p-1 h-6 w-6"
                        onClick={() => {
                          const newImages = formData.additionalImages.filter((_: any, i: number) => i !== index)
                          handleInputChange('additionalImages', newImages)
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <label htmlFor="additional-images" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Add images
                    </span>
                    <input
                      id="additional-images"
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          const files = Array.from(e.target.files)
                          const urls = files.map(file => URL.createObjectURL(file))
                          handleInputChange('additionalImages', [...(formData.additionalImages || []), ...urls])
                        }
                      }}
                      className="sr-only"
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Up to 5 additional images
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Event Video (optional)
            </label>
            <input
              type="url"
              value={formData.videoUrl || ''}
              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            />
            {errors.videoUrl && <p className="text-sm text-red-600">{errors.videoUrl}</p>}
            <p className="text-xs text-gray-500">Embed URL for YouTube, Vimeo, or similar</p>
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