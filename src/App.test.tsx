import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import { useSyncStore } from './stores/useSyncStore'

// Mock the store
vi.mock('./stores/useSyncStore', () => ({
  useSyncStore: vi.fn(),
}))

// Mock AuthGuard to render children immediately (tested separately)
vi.mock('./components/auth/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock AuthSkeleton
vi.mock('./components/ui/AuthSkeleton', () => ({
  AuthSkeleton: () => <div data-testid="auth-skeleton">Loading...</div>,
}))

// Mock AuthForm
vi.mock('./features/auth/components/AuthForm', () => ({
  AuthForm: () => <div data-testid="auth-form">Auth Form</div>,
}))

describe('App', () => {
  it('shows auth form when not authenticated', async () => {
    vi.mocked(useSyncStore).mockImplementation((selector) =>
      selector({
        isAuthenticated: false,
        user: null,
        encryptedToken: null,
        setAuth: vi.fn(),
        clearAuth: vi.fn(),
      } as never),
    )

    await act(async () => {
      render(<App />)
    })

    expect(screen.getByTestId('auth-form')).toBeInTheDocument()
  })

  it('shows main interface when authenticated', async () => {
    vi.mocked(useSyncStore).mockImplementation((selector) =>
      selector({
        isAuthenticated: true,
        user: { login: 'testuser', avatarUrl: 'https://example.com/a.png', name: 'Test' },
        encryptedToken: null,
        setAuth: vi.fn(),
        clearAuth: vi.fn(),
      } as never),
    )

    await act(async () => {
      render(<App />)
    })

    expect(screen.getByText(/code-tasks/i)).toBeInTheDocument()
    expect(screen.getByText(/welcome, testuser/i)).toBeInTheDocument()
  })
})
