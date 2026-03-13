import { useSyncStore, base64ToArrayBuffer } from '../../stores/useSyncStore'
import { decryptData } from '../../services/storage/crypto-utils'
import { validateToken } from '../../services/github/auth-service'

const PASSPHRASE_KEY = 'code-tasks:passphrase'

let hydrationPromise: Promise<void> | null = null

export function getHydrationPromise(): Promise<void> {
  if (!hydrationPromise) {
    hydrationPromise = performHydration()
  }
  return hydrationPromise
}

export function resetHydration() {
  hydrationPromise = null
}

async function performHydration(): Promise<void> {
  await useSyncStore.persist.rehydrate()

  const { encryptedToken, isAuthenticated } = useSyncStore.getState()

  if (!isAuthenticated || !encryptedToken) {
    useSyncStore.getState().clearAuth()
    return
  }

  // Offline: trust local state (AC 7)
  if (!navigator.onLine) {
    return
  }

  const passphrase = sessionStorage.getItem(PASSPHRASE_KEY)
  if (!passphrase) {
    useSyncStore.getState().clearAuth()
    return
  }

  try {
    const buffer = base64ToArrayBuffer(encryptedToken)
    const token = await decryptData(buffer, passphrase)
    const result = await validateToken(token)

    if (!result.valid) {
      useSyncStore.getState().clearAuth()
    }
  } catch {
    useSyncStore.getState().clearAuth()
  }
}
