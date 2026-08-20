// PBKDF2 password hashing via Web Crypto API (edge-compatible, no bcryptjs needed)
// Format: pbkdf2:iterations:saltBase64:hashBase64

const ITERATIONS = 100_000
const KEY_LENGTH = 32 // 256 bits
const SALT_LENGTH = 16

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH * 8,
  )
  const hash = new Uint8Array(derivedBits)
  return `pbkdf2:${ITERATIONS}:${Buffer.from(salt).toString('base64')}:${Buffer.from(hash).toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false

  const iterations = parseInt(parts[1], 10)
  const salt = new Uint8Array(Buffer.from(parts[2], 'base64'))
  const storedHash = new Uint8Array(Buffer.from(parts[3], 'base64'))

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    storedHash.length * 8,
  )

  // Constant-time comparison
  const derivedHash = new Uint8Array(derivedBits)
  if (derivedHash.length !== storedHash.length) return false
  let diff = 0
  for (let i = 0; i < derivedHash.length; i++) {
    diff |= derivedHash[i] ^ storedHash[i]
  }
  return diff === 0
}
