import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock crypto-utils
vi.mock('../../services/storage/crypto-utils', () => ({
  encryptData: vi.fn().mockResolvedValue(new ArrayBuffer(64)),
  decryptData: vi.fn().mockResolvedValue('decrypted-token'),
}))

// Mock auth-service
const { mockValidateToken } = vi.hoisted(() => ({
  mockValidateToken: vi.fn(),
}))
vi.mock('../../services/github/auth-service', () => ({
  validateToken: mockValidateToken,
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock })

import { getHydrationPromise, resetHydration } from './hydration'
import { useSyncStore } from '../../stores/useSyncStore'

describe('hydration', () => {
  beforeEach(() => {
    localStorageMock.clear()
    sessionStorageMock.clear()
    vi.clearAllMocks()
    resetHydration()
    useSyncStore.setState({
      isAuthenticated: false,
      user: null,
      encryptedToken: null,
    })
    vi.spyOn(useSyncStore.persist, 'rehydrate').mockImplementation(() => Promise.resolve())
    mockValidateToken.mockResolvedValue({ valid: true, user: { login: 'test', avatarUrl: '', name: null } })
  })

  it('clears auth when no token exists after rehydration', async () => {
    await getHydrationPromise()

    const state = useSyncStore.getState()
    expect(state.isAuthenticated).toBe(false)
  })

  it('validates session when token and passphrase exist', async () => {
    useSyncStore.setState({
      isAuthenticated: true,
      user: { login: 'testuser', avatarUrl: '', name: 'Test' },
      encryptedToken: 'dGVzdA==',
    })
    sessionStorageMock.setItem('code-tasks:passphrase', 'test-pass')

    await getHydrationPromise()

    expect(mockValidateToken).toHaveBeenCalledWith('decrypted-token')
    const state = useSyncStore.getState()
    expect(state.isAuthenticated).toBe(true)
  })

  it('clears auth when no passphrase in sessionStorage', async () => {
    useSyncStore.setState({
      isAuthenticated: true,
      user: { login: 'testuser', avatarUrl: '', name: 'Test' },
      encryptedToken: 'dGVzdA==',
    })

    await getHydrationPromise()

    const state = useSyncStore.getState()
    expect(state.isAuthenticated).toBe(false)
  })

  it('trusts local state when offline (AC 7)', async () => {
    const originalOnLine = navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

    useSyncStore.setState({
      isAuthenticated: true,
      user: { login: 'testuser', avatarUrl: '', name: 'Test' },
      encryptedToken: 'dGVzdA==',
    })

    await getHydrationPromise()

    expect(mockValidateToken).not.toHaveBeenCalled()
    const state = useSyncStore.getState()
    expect(state.isAuthenticated).toBe(true)

    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
  })

  it('clears auth when token validation fails (AC 6)', async () => {
    mockValidateToken.mockResolvedValueOnce({ valid: false, error: 'Token expired' })

    useSyncStore.setState({
      isAuthenticated: true,
      user: { login: 'testuser', avatarUrl: '', name: 'Test' },
      encryptedToken: 'dGVzdA==',
    })
    sessionStorageMock.setItem('code-tasks:passphrase', 'test-pass')

    await getHydrationPromise()

    const state = useSyncStore.getState()
    expect(state.isAuthenticated).toBe(false)
  })

  it('clears auth when decryption throws', async () => {
    const { decryptData } = await import('../../services/storage/crypto-utils')
    vi.mocked(decryptData).mockRejectedValueOnce(new Error('decrypt failed'))

    useSyncStore.setState({
      isAuthenticated: true,
      user: { login: 'testuser', avatarUrl: '', name: 'Test' },
      encryptedToken: 'dGVzdA==',
    })
    sessionStorageMock.setItem('code-tasks:passphrase', 'test-pass')

    await getHydrationPromise()

    const state = useSyncStore.getState()
    expect(state.isAuthenticated).toBe(false)
  })

  it('caches the hydration promise on subsequent calls', async () => {
    const promise1 = getHydrationPromise()
    const promise2 = getHydrationPromise()
    expect(promise1).toBe(promise2)
    await promise1
  })
})
