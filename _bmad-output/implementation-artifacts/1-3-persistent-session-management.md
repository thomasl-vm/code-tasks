# Story 1.3: Persistent Session Management

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want the app to remember my authenticated state,
so that I can start capturing ideas immediately without logging in every time I open the app.

## Acceptance Criteria

1. [x] **Hydration Strategy:** On app launch, the `useSyncStore` (Zustand) is hydrated from `LocalStorage`.
2. [x] **Secure Decryption:** If an encrypted token exists, the system uses `crypto-utils.ts` to decrypt it (using the persistent device key or user secret).
3. [x] **Session Validation:** The decrypted token is validated against the GitHub API (`octokit.rest.users.getAuthenticated()`) BEFORE the user is granted access to the Pulse interface.
4. [x] **Loading State:** A non-blocking "Auth Skeleton" or Splash screen is shown while hydration and validation occur, using React 19 `Suspense` and the `use()` hook.
5. [x] **Auto-Login:** Upon successful validation, the user is automatically directed to the "Pulse" capture screen.
6. [x] **Token Expiry Handling:** If the token is invalid or expired, the session is cleared from both LocalStorage and the Zustand store, and the user is redirected to the Auth screen.
7. [x] **Network Resilience:** If the device is offline during launch, the system allows access based on the last-known "Valid" local state but flags a "Sync Required" warning.

## Tasks / Subtasks

- [x] Implement Hydration & Guard (AC: 1, 4)
  - [x] Configure `useSyncStore.ts` with `persist` middleware and `skipHydration: true`.
  - [x] Create `src/components/auth/AuthGuard.tsx` using React 19 `use(hydrationPromise)` to suspend rendering until hydration is complete.
- [x] Implement Session Recovery (AC: 2, 3, 5)
  - [x] Update `auth-service.ts` to include `revalidateSession(encryptedToken: string)` logic.
  - [x] Implement `decryptData` integration for token recovery.
  - [x] Ensure `Octokit` is re-initialized with the recovered token.
- [x] Build Loading UI (AC: 4)
  - [x] Create a lightweight `AuthSkeleton.tsx` for the Splash/Loading state.
  - [x] Wrap the main application entry in `Suspense` targeting the `AuthGuard`.
- [x] Handle Session Failure (AC: 6)
  - [x] Implement `clearSession()` in `useSyncStore.ts` to wipe LocalStorage and reset state.
  - [x] Ensure automatic redirect to `/auth` on validation failure.

## Dev Notes

- **React 19 Hydration:** Use the `use(hydrationPromise)` pattern inside the `AuthGuard` to integrate with `Suspense`. Avoid the legacy `useEffect` + `isMounted` flags.
- **Zustand Persistence:** Use the `persist` middleware with the `onRehydrateStorage` hook to trigger validation immediately after local data is restored.
- **Offline Logic:** If `navigator.onLine` is false, bypass the GitHub API validation but keep the session "Staged" until reconnection.

### Project Structure Notes

- **Auth Guard:** `src/components/auth/AuthGuard.tsx`
- **Loading UI:** `src/components/ui/AuthSkeleton.tsx`
- **Hydration Logic:** `src/stores/useSyncStore.ts`
- **Validation Logic:** `src/services/github/auth-service.ts`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#State Management Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#Functional Requirements FR3]
- [Source: Web Research - March 11, 2026: React 19 Suspense for Auth Hydration Patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (March 2026)

### Debug Log References

None.

### Completion Notes List

- Refactored `useSyncStore.ts` to use Zustand `persist` middleware with `skipHydration: true` and `createJSONStorage`. The `encryptedToken` is now stored as base64 string (not ArrayBuffer) for JSON-safe serialization.
- Passphrase is cached in `sessionStorage` during `setAuth()` to enable auto-login across page reloads within a browser session. On browser restart, the user re-enters their passphrase (token remains encrypted in localStorage).
- Created `src/components/auth/hydration.ts` with the core hydration logic: rehydrate store -> check auth state -> decrypt token -> validate with GitHub API -> clear on failure. Supports offline mode (trusts local state when `navigator.onLine` is false).
- Created `src/components/auth/AuthGuard.tsx` using React 19 `use(hydrationPromise)` pattern to integrate with Suspense. Hydration promise is cached (singleton) for the app lifetime.
- Created `src/components/ui/AuthSkeleton.tsx` as a lightweight loading spinner shown during hydration via Suspense fallback.
- Updated `App.tsx` to wrap content in `<Suspense fallback={<AuthSkeleton />}><AuthGuard>...</AuthGuard></Suspense>`. Removed legacy `useState(authComplete)` pattern.
- `clearAuth()` wipes both localStorage (via persist middleware) and sessionStorage passphrase. When `isAuthenticated` becomes false, `AppContent` renders the `AuthForm`.
- Session recovery reuses existing `validateToken()` from `auth-service.ts` which creates a new `Octokit` instance with the decrypted token.
- All 35 tests pass (8 test files), zero regressions. TypeScript and ESLint clean (no new issues).

### Change Log

- 2026-03-13: Implemented persistent session management (Story 1.3) - hydration, session recovery, loading UI, session failure handling.

### File List

- `src/stores/useSyncStore.ts` (modified) - Added persist middleware, skipHydration, base64 token storage, sessionStorage passphrase caching
- `src/stores/useSyncStore.test.ts` (modified) - Updated tests for persist middleware, sessionStorage passphrase, new clearAuth behavior
- `src/components/auth/AuthGuard.tsx` (new) - React 19 use() + Suspense auth guard component
- `src/components/auth/hydration.ts` (new) - Core hydration/session recovery logic
- `src/components/auth/hydration.test.ts` (new) - Tests for hydration: validation, offline, failure, caching
- `src/components/auth/AuthGuard.test.tsx` (new) - Tests for AuthGuard Suspense integration
- `src/components/ui/AuthSkeleton.tsx` (new) - Loading skeleton component
- `src/components/ui/AuthSkeleton.test.tsx` (new) - AuthSkeleton test
- `src/App.tsx` (modified) - Wrapped with Suspense + AuthGuard, removed legacy authComplete state
- `src/App.test.tsx` (modified) - Updated to mock AuthGuard and AuthSkeleton
