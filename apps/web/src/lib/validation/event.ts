import { z } from 'zod'

export const eventFormSchema = z.object({
  // Basic Info
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  category: z.string().min(1, 'Category is required'),
  shortDescription: z.string().min(1, 'Short description is required').max(200, 'Short description must be 200 characters or less'),
  fullDescription: z.string().min(1, 'Full description is required').max(5000, 'Full description must be 5000 characters or less'),
  
  // Date & Location
  startDateTime: z.string().min(1, 'Start date/time is required'),
  endDateTime: z.string().min(1, 'End date/time is required'),
  locationType: z.enum(['physical', 'virtual', 'hybrid']),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  meetingLink: z.string().url('Invalid URL').optional(),
  
  // Ticketing
  ticketPrice: z.number().min(0, 'Ticket price must be 0 or greater'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  maxTicketsPerWallet: z.number().min(1, 'Max tickets per wallet must be at least 1').optional(),
  enableWaitlist: z.boolean(),
  refundPolicy: z.string(),
  
  // Media
  coverImageUrl: z.string().min(1, 'Cover image is required'),
  additionalImages: z.array(z.string()).default([]),
  videoUrl: z.string().url('Invalid video URL').optional(),
  
  // Multi-Language
  translations: z.record(z.object({
    title: z.string(),
    shortDescription: z.string(),
    fullDescription: z.string(),
  })).default({}),
})

export type EventFormData = z.infer<typeof eventFormSchema>

// Step validation schemas
export const basicInfoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  category: z.string().min(1, 'Category is required'),
  shortDescription: z.string().min(1, 'Short description is required').max(200, 'Short description must be 200 characters or less'),
  fullDescription: z.string().min(1, 'Full description is required').max(5000, 'Full description must be 5000 characters or less'),
})

export const dateTimeLocationSchema = z.object({
  startDateTime: z.string().min(1, 'Start date/time is required'),
  endDateTime: z.string().min(1, 'End date/time is required'),
  locationType: z.enum(['physical', 'virtual', 'hybrid']),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  meetingLink: z.string().url('Invalid URL').optional(),
}).refine((data) => {
  // Custom validation for location requirements
  if (data.locationType === 'physical' || data.locationType === 'hybrid') {
    return data.address && data.city && data.country
  }
  if (data.locationType === 'virtual' || data.locationType === 'hybrid') {
    return data.meetingLink
  }
  return false
}, {
  message: 'Required location fields are missing',
})

export const ticketingSchema = z.object({
  ticketPrice: z.number().min(0, 'Ticket price must be 0 or greater'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  maxTicketsPerWallet: z.number().min(1, 'Max tickets per wallet must be at least 1').optional(),
  enableWaitlist: z.boolean(),
  refundPolicy: z.string(),
})

export const mediaSchema = z.object({
  coverImageUrl: z.string().min(1, 'Cover image is required'),
  additionalImages: z.array(z.string()).default([]),
  videoUrl: z.string().url('Invalid video URL').optional(),
})

export const multiLanguageSchema = z.object({
  translations: z.record(z.object({
    title: z.string(),
    shortDescription: z.string(),
    fullDescription: z.string(),
  })).default({}),
})