import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Suspense } from 'react'

// Mock the hydration module — hydration logic is tested separately in hydration.test.ts
let mockPromise: Promise<void> = Promise.resolve()
vi.mock('./hydration', () => ({
  getHydrationPromise: () => mockPromise,
  resetHydration: vi.fn(),
}))

import { AuthGuard } from './AuthGuard'

function renderWithSuspense(ui: React.ReactNode) {
  return render(
    <Suspense fallback={<div data-testid="loading">Loading...</div>}>
      {ui}
    </Suspense>,
  )
}

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPromise = Promise.resolve()
  })

  it('renders children after hydration promise resolves', async () => {
    await act(async () => {
      renderWithSuspense(
        <AuthGuard>
          <div data-testid="child">Protected Content</div>
        </AuthGuard>,
      )
    })

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows loading fallback while hydration is pending', async () => {
    mockPromise = new Promise(() => {}) // never resolves

    await act(async () => {
      renderWithSuspense(
        <AuthGuard>
          <div data-testid="child">Protected Content</div>
        </AuthGuard>,
      )
    })

    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
  })
})
