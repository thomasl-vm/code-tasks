import { describe, it, expect } from 'vitest'
import { encryptData, decryptData } from './crypto-utils'

describe('crypto-utils', () => {
  const passphrase = 'test-passphrase-for-encryption'
  const TEST_ITERATIONS = 100

  describe('encryptData', () => {
    it('returns a non-empty ArrayBuffer', async () => {
      const result = await encryptData('my-secret-token', passphrase, TEST_ITERATIONS)
      expect(result).toBeInstanceOf(ArrayBuffer)
      expect(result.byteLength).toBeGreaterThan(0)
    })

    it('produces output with salt(16) + iv(12) + ciphertext layout', async () => {
      const result = await encryptData('test-data', passphrase, TEST_ITERATIONS)
      // Minimum: 16 salt + 12 iv + at least 1 byte ciphertext + 16 GCM tag
      expect(result.byteLength).toBeGreaterThanOrEqual(16 + 12 + 1 + 16)
    })

    it('produces different output for same input (random salt/iv)', async () => {
      const a = await encryptData('same-data', passphrase, TEST_ITERATIONS)
      const b = await encryptData('same-data', passphrase, TEST_ITERATIONS)
      const viewA = new Uint8Array(a)
      const viewB = new Uint8Array(b)
      // Should differ due to random salt and IV
      const same = viewA.every((byte, i) => byte === viewB[i])
      expect(same).toBe(false)
    })
  })

  describe('decryptData', () => {
    it('decrypts back to the original plaintext', async () => {
      const original = 'ghp_1234567890abcdefABCDEF'
      const encrypted = await encryptData(original, passphrase, TEST_ITERATIONS)
      const decrypted = await decryptData(encrypted, passphrase, TEST_ITERATIONS)
      expect(decrypted).toBe(original)
    })

    it('handles empty string', async () => {
      const original = ''
      const encrypted = await encryptData(original, passphrase, TEST_ITERATIONS)
      const decrypted = await decryptData(encrypted, passphrase, TEST_ITERATIONS)
      expect(decrypted).toBe(original)
    })

    it('handles long data', async () => {
      const original = 'a'.repeat(10000)
      const encrypted = await encryptData(original, passphrase, TEST_ITERATIONS)
      const decrypted = await decryptData(encrypted, passphrase, TEST_ITERATIONS)
      expect(decrypted).toBe(original)
    })

    it('fails with wrong passphrase', async () => {
      const encrypted = await encryptData('secret', passphrase, TEST_ITERATIONS)
      await expect(decryptData(encrypted, 'wrong-passphrase', TEST_ITERATIONS)).rejects.toThrow()
    })

    it('fails with corrupted data', async () => {
      const encrypted = await encryptData('secret', passphrase, TEST_ITERATIONS)
      const corrupted = new Uint8Array(encrypted)
      corrupted[corrupted.length - 1] ^= 0xff // flip last byte
      await expect(decryptData(corrupted.buffer, passphrase, TEST_ITERATIONS)).rejects.toThrow()
    })
  })
})
