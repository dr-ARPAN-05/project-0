/**
 * Shared type definitions and constants for the auth system.
 * Plain JSDoc (this project is JS, not TS) so editors still get
 * autocomplete/type-checking without adding a build step.
 */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string|null} full_name
 * @property {string} email
 * @property {boolean} is_admin
 * @property {boolean} is_verified
 * @property {string} created_at
 */

/**
 * @typedef {import('@supabase/supabase-js').Session} Session
 * @typedef {import('@supabase/supabase-js').User} User
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User|null} user
 * @property {Session|null} session
 * @property {Profile|null} profile
 * @property {boolean} loading            - true until the first session check resolves
 * @property {boolean} profileLoading      - true while the profile for the current session is being fetched
 * @property {boolean} isAuthenticated
 * @property {boolean} isAdmin
 * @property {boolean} needsEmailVerification
 * @property {boolean} needsName
 * @property {() => Promise<void>} refreshProfile
 * @property {() => Promise<void>} signOut
 */

// Length of the numeric code Supabase emails for signup / passwordless / recovery OTPs.
export const CODE_LENGTH = 8;

// The `type` values Supabase's verifyOtp() expects — kept in one place so a
// typo can't silently break one flow.
export const OTP_TYPE = {
  SIGNUP: 'signup',
  EMAIL: 'email',
  RECOVERY: 'recovery',
};

export {};
