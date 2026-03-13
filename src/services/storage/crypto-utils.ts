/**
 * AES-GCM encryption/decryption utilities using the Web Crypto API.
 * Buffer layout: [salt(16 bytes) | iv(12 bytes) | ciphertext]
 */

const SALT_LENGTH = 16
const IV_LENGTH = 12
const DEFAULT_PBKDF2_ITERATIONS = 600_000

async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  iterations = DEFAULT_PBKDF2_ITERATIONS,
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptData(
  plaintext: string,
  passphrase: string,
  iterations = DEFAULT_PBKDF2_ITERATIONS,
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(passphrase, salt, iterations)

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext),
  )

  // Pack: [salt(16) | iv(12) | ciphertext]
  const packed = new Uint8Array(
    salt.byteLength + iv.byteLength + ciphertext.byteLength,
  )
  packed.set(salt, 0)
  packed.set(iv, SALT_LENGTH)
  packed.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH)

  return packed.buffer
}

export async function decryptData(
  packed: ArrayBuffer,
  passphrase: string,
  iterations = DEFAULT_PBKDF2_ITERATIONS,
): Promise<string> {
  const data = new Uint8Array(packed)
  const salt = data.slice(0, SALT_LENGTH)
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH)

  const key = await deriveKey(passphrase, salt, iterations)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  )

  return new TextDecoder().decode(decrypted)
}
