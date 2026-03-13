import { useActionState } from 'react'
import { validateToken } from '../../../services/github/auth-service'
import { useSyncStore } from '../../../stores/useSyncStore'

interface AuthFormProps {
  onSuccess: () => void
}

interface FormState {
  error: string | null
  pending: boolean
}

const initialState: FormState = { error: null, pending: false }

export function AuthForm({ onSuccess }: AuthFormProps) {
  const setAuth = useSyncStore((s) => s.setAuth)

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const token = (formData.get('token') as string)?.trim() ?? ''
      const passphrase = (formData.get('passphrase') as string)?.trim() ?? ''

      if (!token) {
        return { error: 'Token cannot be empty', pending: false }
      }
      if (!passphrase) {
        return { error: 'App passphrase cannot be empty', pending: false }
      }

      try {
        const result = await validateToken(token)

        if (!result.valid) {
          return { error: result.error, pending: false }
        }

        await setAuth(token, result.user, passphrase)
        onSuccess()
        return { error: null, pending: false }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Authentication failed'
        return { error: message, pending: false }
      }
    },
    initialState,
  )

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        action={formAction}
        className="w-full max-w-md rounded-lg border p-6"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2
          className="mb-2 text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Authenticate
        </h2>
        <p
          className="mb-6 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Enter your GitHub Personal Access Token and a master passphrase to encrypt it.
        </p>

        <div className="mb-4">
          <label
            htmlFor="pat-input"
            className="mb-2 block text-sm font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Personal Access Token
          </label>
          <input
            id="pat-input"
            name="token"
            type="password"
            autoComplete="off"
            placeholder="ghp_..."
            disabled={isPending}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="passphrase-input"
            className="mb-2 block text-sm font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            App Passphrase (Encryption Key)
          </label>
          <input
            id="passphrase-input"
            name="passphrase"
            type="password"
            autoComplete="new-password"
            placeholder="Your master key"
            disabled={isPending}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          <p className="mt-1 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
            This is never stored. You'll need it to unlock your token on other sessions.
          </p>
        </div>

        {state.error && (
          <div
            role="alert"
            className="mb-4 rounded-md border px-3 py-2 text-sm"
            style={{
              borderColor: '#f85149',
              color: '#f85149',
              backgroundColor: 'rgba(248, 81, 73, 0.1)',
            }}
          >
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#ffffff',
          }}
        >
          {isPending ? 'Authenticating...' : 'Authenticate'}
        </button>
      </form>
    </div>
  )
}
