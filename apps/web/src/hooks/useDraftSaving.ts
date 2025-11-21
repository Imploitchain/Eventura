import { useState } from 'react'

export function useDraftSaving() {
  const [isDraftSaving, setIsDraftSaving] = useState(false)

  const saveDraft = async (eventData: any): Promise<void> => {
    setIsDraftSaving(true)
    try {
      // Save to localStorage as backup
      localStorage.setItem('event-creation-draft', JSON.stringify({
        data: eventData,
        timestamp: Date.now(),
      }))

      // In a real implementation, you might also save to a backend
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      
      console.log('Draft saved successfully')
    } catch (error) {
      console.error('Failed to save draft:', error)
      throw error
    } finally {
      setIsDraftSaving(false)
    }
  }

  const loadDraft = (): any | null => {
    try {
      const draft = localStorage.getItem('event-creation-draft')
      if (draft) {
        const { data } = JSON.parse(draft)
        return data
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
    return null
  }

  const clearDraft = (): void => {
    localStorage.removeItem('event-creation-draft')
  }

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    isDraftSaving,
  }
}