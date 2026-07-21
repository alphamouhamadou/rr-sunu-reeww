import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const SALT_ROUNDS = 12

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate a verification token with expiry
 */
export function generateVerificationToken(): { token: string; expiry: Date } {
  const token = generateToken(32)
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  return { token, expiry }
}

/**
 * Generate a password reset token with expiry
 */
export function generateResetToken(): { token: string; expiry: Date } {
  const token = generateToken(32)
  const expiry = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
  return { token, expiry }
}

/**
 * Legacy base64 decode for backward compatibility
 * Used to check old passwords during migration
 */
export function decodeBase64Password(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8')
}

/**
 * Check if a password is hashed with bcrypt
 */
export function isBcryptHash(hash: string): boolean {
  return hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')
}
