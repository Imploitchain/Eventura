'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ReviewDeployStepProps {
  formData: any
  onChange: (data: any) => void
  onNext: () => void
  onPrevious: () => void
  onDeploy: () => Promise<void>
  isDeploying: boolean
}

export function ReviewDeployStep({ 
  formData, 
  onChange, 
  onNext, 
  onPrevious, 
  onDeploy, 
  isDeploying 
}: ReviewDeployStepProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<{eventId: string, txHash: string} | null>(null)

  const handleDeploy = async () => {
    try {
      await onDeploy()
      setShowSuccess(true)
    } catch (error) {
      console.error('Deployment failed:', error)
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'Not set'
    const date = new Date(dateTimeString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `${price} ETH`
  }

  const getEventPreview = () => {
    return {
      title: formData.title,
      category: formData.category,
      shortDescription: formData.shortDescription,
      startDateTime: formData.startDateTime,
      endDateTime: formData.endDateTime,
      locationType: formData.locationType,
      ticketPrice: formData.ticketPrice,
      capacity: formData.capacity,
      coverImageUrl: formData.coverImageUrl,
    }
  }

  const preview = getEventPreview()

  if (showSuccess && deploymentResult) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">Event Created Successfully!</h3>
            <p className="text-green-600 mb-6">
              Your event has been deployed to the blockchain and is now live.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">Event Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event ID:</span>
                    <span className="font-mono">{deploymentResult.eventId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Hash:</span>
                    <a 
                      href={`https://basescan.org/tx/${deploymentResult.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-600 hover:underline"
                    >
                      {deploymentResult.txHash.slice(0, 10)}...{deploymentResult.txHash.slice(-8)}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => window.open(`/events/${deploymentResult.eventId}`, '_blank')}
              >
                View Event
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/events/${deploymentResult.eventId}`)
                  alert('Event link copied to clipboard!')
                }}
              >
                Share Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review & Deploy</CardTitle>
          <CardDescription>
            Review your event details and deploy to the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Event Preview</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex gap-4">
                {preview.coverImageUrl && (
                  <img
                    src={preview.coverImageUrl}
                    alt="Cover"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2">{preview.title}</h4>
                  <p className="text-gray-600 mb-2">{preview.category}</p>
                  <p className="text-sm text-gray-500 mb-2">{preview.shortDescription}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📅 {formatDateTime(preview.startDateTime)}</span>
                    <span>💰 {formatPrice(preview.ticketPrice)}</span>
                    <span>👥 {preview.capacity} tickets</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Title:</strong> {formData.title}</div>
                <div><strong>Category:</strong> {formData.category}</div>
                <div><strong>Description:</strong> {formData.shortDescription}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Location & Date</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Type:</strong> {formData.locationType}</div>
                <div><strong>Start:</strong> {formatDateTime(formData.startDateTime)}</div>
                <div><strong>End:</strong> {formatDateTime(formData.endDateTime)}</div>
                {formData.address && <div><strong>Address:</strong> {formData.address}, {formData.city}, {formData.country}</div>}
                {formData.meetingLink && <div><strong>Meeting Link:</strong> {formData.meetingLink}</div>}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Ticketing</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Price:</strong> {formatPrice(formData.ticketPrice)}</div>
                <div><strong>Capacity:</strong> {formData.capacity} tickets</div>
                {formData.maxTicketsPerWallet && <div><strong>Max per wallet:</strong> {formData.maxTicketsPerWallet}</div>}
                <div><strong>Waitlist:</strong> {formData.enableWaitlist ? 'Enabled' : 'Disabled'}</div>
                <div><strong>Refund Policy:</strong> {formData.refundPolicy}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Multi-Language</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Languages:</strong> {Object.keys(formData.translations || {}).length || 'None'}</div>
                {Object.keys(formData.translations || {}).length > 0 && (
                  <div className="text-xs text-gray-500">
                    {Object.keys(formData.translations).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estimated Gas Fee */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Estimated Gas Fee</h4>
            <p className="text-sm text-blue-600 mb-2">
              The deployment will require gas fees to create your event on the blockchain.
            </p>
            <div className="text-sm">
              <strong>Estimated Cost:</strong> ~0.002 - 0.005 ETH (depending on network conditions)
            </div>
            <div className="text-xs text-blue-500 mt-1">
              💡 Gas fees vary based on network congestion. You'll be asked to confirm the actual cost before deploying.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button
          onClick={handleDeploy}
          disabled={isDeploying}
          className="bg-green-600 hover:bg-green-700"
        >
          {isDeploying ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Deploying Event...
            </div>
          ) : (
            'Deploy Event to Blockchain'
          )}
        </Button>
      </div>
    </div>
  )
}