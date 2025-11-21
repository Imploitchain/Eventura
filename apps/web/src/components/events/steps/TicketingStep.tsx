'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TicketingStepProps {
  formData: any
  onChange: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

const REFUND_POLICIES = [
  { value: 'full_refund_until_event', label: 'Full refund until event starts' },
  { value: 'no_refunds', label: 'No refunds' },
  { value: 'custom', label: 'Custom policy' },
]

export function TicketingStep({ formData, onChange, onNext, onPrevious }: TicketingStepProps) {
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

    if (!formData.ticketPrice && formData.ticketPrice !== 0) {
      newErrors.ticketPrice = 'Ticket price is required'
    } else if (formData.ticketPrice < 0) {
      newErrors.ticketPrice = 'Ticket price must be 0 or greater'
    }

    if (!formData.capacity) {
      newErrors.capacity = 'Capacity is required'
    } else if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1'
    }

    if (formData.maxTicketsPerWallet && formData.maxTicketsPerWallet < 1) {
      newErrors.maxTicketsPerWallet = 'Max tickets per wallet must be at least 1'
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
          <CardTitle>Ticketing</CardTitle>
          <CardDescription>
            Set up your event's pricing and capacity settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ticket Price */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ticket Price (ETH) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0"
                value={formData.ticketPrice || ''}
                onChange={(e) => handleInputChange('ticketPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <span className="absolute left-3 top-2.5 text-gray-500">Ξ</span>
            </div>
            {errors.ticketPrice && <p className="text-sm text-red-600">{errors.ticketPrice}</p>}
            <p className="text-xs text-gray-500">Set to 0 for free events</p>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Capacity *
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity || ''}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Maximum number of tickets"
            />
            {errors.capacity && <p className="text-sm text-red-600">{errors.capacity}</p>}
          </div>

          {/* Max Tickets Per Wallet */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Max Tickets Per Wallet
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxTicketsPerWallet || ''}
              onChange={(e) => handleInputChange('maxTicketsPerWallet', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
            {errors.maxTicketsPerWallet && <p className="text-sm text-red-600">{errors.maxTicketsPerWallet}</p>}
            <p className="text-xs text-gray-500">Limit tickets per wallet (optional)</p>
          </div>

          {/* Waitlist */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableWaitlist"
              checked={formData.enableWaitlist || false}
              onChange={(e) => handleInputChange('enableWaitlist', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enableWaitlist" className="text-sm font-medium text-gray-700">
              Enable waitlist when sold out
            </label>
          </div>

          {/* Refund Policy */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Refund Policy
            </label>
            <select
              value={formData.refundPolicy || 'full_refund_until_event'}
              onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REFUND_POLICIES.map((policy) => (
                <option key={policy.value} value={policy.value}>
                  {policy.label}
                </option>
              ))}
            </select>
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