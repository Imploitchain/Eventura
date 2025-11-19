/**
 * Intelligent matching algorithm for suggesting connections
 */

export interface Persona {
  id: string
  wallet_address: string
  display_name: string
  bio?: string
  interests: string[]
  looking_for: string[]
  avatar_ipfs_hash?: string
  created_at: string
}

export interface MatchResult {
  attendee: Persona
  score: number
  percentage: number
  reasons: string[]
  sharedInterests: string[]
  sharedLookingFor: string[]
}

/**
 * Calculate intersection of two arrays
 */
function intersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => arr2.includes(item))
}

/**
 * Calculate match score between two personas
 *
 * Scoring system:
 * - Shared interests: +10 per shared interest, max 40 points
 * - Complementary "looking for": +30 per matching goal
 * - Total max score: 100
 */
export function calculateMatchScore(
  userPersona: Persona,
  candidatePersona: Persona
): MatchResult {
  let score = 0
  const reasons: string[] = []

  // Shared interests (+10 each, max 40)
  const sharedInterests = intersection(userPersona.interests, candidatePersona.interests)
  if (sharedInterests.length > 0) {
    const interestPoints = Math.min(sharedInterests.length * 10, 40)
    score += interestPoints

    const interestList = sharedInterests.slice(0, 3).map(i => `#${i}`).join(', ')
    if (sharedInterests.length > 3) {
      reasons.push(`You both are interested in ${interestList} and ${sharedInterests.length - 3} more`)
    } else {
      reasons.push(`You both are interested in ${interestList}`)
    }
  }

  // Complementary looking_for (+30 per matching goal)
  const sharedLookingFor = intersection(userPersona.looking_for, candidatePersona.looking_for)
  if (sharedLookingFor.length > 0) {
    score += Math.min(sharedLookingFor.length * 30, 60)

    const lookingForList = sharedLookingFor.join(', ')
    reasons.push(`You both are looking for ${lookingForList}`)
  }

  // Calculate percentage (max 100)
  const percentage = Math.min(score, 100)

  return {
    attendee: candidatePersona,
    score,
    percentage,
    reasons: reasons.slice(0, 2), // Top 2 reasons
    sharedInterests,
    sharedLookingFor
  }
}

/**
 * Get suggested connections for a user at an event
 * Returns top N suggestions sorted by match score
 */
export function getSuggestedConnections(
  userPersona: Persona,
  allAttendees: Persona[],
  limit: number = 10
): MatchResult[] {
  // Filter out the user themselves
  const candidates = allAttendees.filter(
    attendee => attendee.wallet_address !== userPersona.wallet_address
  )

  // Calculate match scores for all candidates
  const matches = candidates.map(candidate =>
    calculateMatchScore(userPersona, candidate)
  )

  // Filter matches with score > 0 and sort by score descending
  const sortedMatches = matches
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)

  // Return top N matches
  return sortedMatches.slice(0, limit)
}

/**
 * Get match quality label based on percentage
 */
export function getMatchQuality(percentage: number): {
  label: string
  color: string
  emoji: string
} {
  if (percentage >= 80) {
    return { label: 'Excellent Match', color: 'text-green-400', emoji: '🔥' }
  } else if (percentage >= 60) {
    return { label: 'Great Match', color: 'text-blue-400', emoji: '⭐' }
  } else if (percentage >= 40) {
    return { label: 'Good Match', color: 'text-purple-400', emoji: '✨' }
  } else if (percentage >= 20) {
    return { label: 'Potential Match', color: 'text-yellow-400', emoji: '💡' }
  } else {
    return { label: 'Low Match', color: 'text-gray-400', emoji: '👋' }
  }
}
