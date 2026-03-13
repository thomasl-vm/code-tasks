import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { encryptData } from '../services/storage/crypto-utils'
import type { GitHubUser } from '../services/github/auth-service'

const STORAGE_KEY = 'code-tasks:auth'
const PASSPHRASE_KEY = 'code-tasks:passphrase'

interface SyncState {
  isAuthenticated: boolean
  user: GitHubUser | null
  encryptedToken: string | null

  setAuth: (token: string, user: GitHubUser, passphrase: string) => Promise<void>
  clearAuth: () => void
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      encryptedToken: null,

      setAuth: async (token: string, user: GitHubUser, passphrase: string) => {
        const encrypted = await encryptData(token, passphrase)
        const base64Token = arrayBufferToBase64(encrypted)

        sessionStorage.setItem(PASSPHRASE_KEY, passphrase)

        set({ isAuthenticated: true, user, encryptedToken: base64Token })
      },

      clearAuth: () => {
        sessionStorage.removeItem(PASSPHRASE_KEY)
        set({ isAuthenticated: false, user: null, encryptedToken: null })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        encryptedToken: state.encryptedToken,
      }),
      skipHydration: true,
    },
  ),
)
