/**
 * Event persona validation utilities
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface PersonaInput {
  wallet_address: string
  event_id: string | number
  display_name: string
  bio?: string
  interests?: string[]
  looking_for?: string[]
  visibility?: 'public' | 'attendees' | 'connections' | 'private'
}

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Validate wallet address format
 */
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Validate event ID
 */
export function isValidEventId(eventId: string | number): boolean {
  const id = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId
  return !isNaN(id) && id > 0
}

/**
 * Validate visibility setting
 */
export function isValidVisibility(visibility: string): boolean {
  return ['public', 'attendees', 'connections', 'private'].includes(visibility)
}

/**
 * Validate array of tags (interests or looking_for)
 */
export function validateTags(tags: string[], maxCount: number = 10): ValidationResult {
  const errors: string[] = []

  if (tags.length > maxCount) {
    errors.push(`Maximum ${maxCount} tags allowed`)
  }

  for (const tag of tags) {
    if (tag.length === 0) {
      errors.push('Tags cannot be empty')
      break
    }
    if (tag.length > 50) {
      errors.push('Each tag must be 50 characters or less')
      break
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate persona input
 */
export function validatePersona(input: PersonaInput): ValidationResult {
  const errors: string[] = []

  // Validate wallet address
  if (!input.wallet_address) {
    errors.push('Wallet address is required')
  } else if (!isValidWalletAddress(input.wallet_address)) {
    errors.push('Invalid wallet address format')
  }

  // Validate event ID
  if (!input.event_id) {
    errors.push('Event ID is required')
  } else if (!isValidEventId(input.event_id)) {
    errors.push('Invalid event ID')
  }

  // Validate display name
  if (!input.display_name) {
    errors.push('Display name is required')
  } else if (input.display_name.trim().length === 0) {
    errors.push('Display name cannot be empty')
  } else if (input.display_name.length > 50) {
    errors.push('Display name must be 50 characters or less')
  }

  // Validate bio (optional)
  if (input.bio !== undefined) {
    if (input.bio.length < 50) {
      errors.push('Bio must be at least 50 characters')
    } else if (input.bio.length > 300) {
      errors.push('Bio must be 300 characters or less')
    }
  }

  // Validate interests (optional)
  if (input.interests !== undefined && input.interests.length > 0) {
    const interestsValidation = validateTags(input.interests, 10)
    if (!interestsValidation.isValid) {
      errors.push(...interestsValidation.errors)
    }
  }

  // Validate looking_for (optional)
  if (input.looking_for !== undefined && input.looking_for.length > 0) {
    const lookingForValidation = validateTags(input.looking_for, 10)
    if (!lookingForValidation.isValid) {
      errors.push(...lookingForValidation.errors)
    }
  }

  // Validate visibility (optional)
  if (input.visibility !== undefined && !isValidVisibility(input.visibility)) {
    errors.push('Invalid visibility setting')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize persona input
 */
export function sanitizePersona(input: PersonaInput): PersonaInput {
  return {
    wallet_address: input.wallet_address.toLowerCase(),
    event_id: typeof input.event_id === 'string' ? parseInt(input.event_id, 10) : input.event_id,
    display_name: sanitizeText(input.display_name),
    bio: input.bio ? sanitizeText(input.bio) : undefined,
    interests: input.interests?.map(tag => sanitizeText(tag)),
    looking_for: input.looking_for?.map(tag => sanitizeText(tag)),
    visibility: input.visibility || 'attendees'
  }
}
