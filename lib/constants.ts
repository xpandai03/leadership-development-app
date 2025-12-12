/**
 * Application constants
 */

// Coach email addresses - these users get direct access to coach dashboard
// and skip the client onboarding flow
export const COACH_EMAILS = [
  'raunek@cloudsteer.com',
  'katharina@inspirationanddiscipline.com',
] as const

/**
 * Check if an email belongs to a coach
 */
export function isCoachEmail(email: string): boolean {
  return COACH_EMAILS.includes(email.toLowerCase() as typeof COACH_EMAILS[number])
}
