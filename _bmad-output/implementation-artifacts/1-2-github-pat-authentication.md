# Story 1.2: GitHub PAT Authentication & Encryption

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to enter my GitHub Personal Access Token (PAT) and have it stored securely,
so that I can access my repositories without re-entering credentials every session.

## Acceptance Criteria

1. [x] **Auth UI:** A dedicated Authentication screen/modal with a secure input field for the GitHub PAT.
2. [x] **Token Validation:** Upon submission, the system uses `octokit` to validate the PAT by calling the `getAuthenticated` user endpoint.
3. [x] **Secure Encryption:** Successfully validated tokens are encrypted using **AES-GCM** (Web Crypto API) with a high-iteration PBKDF2 derived key (min 600,000 iterations).
4. [x] **Persistent Storage:** The encrypted token is stored in `LocalStorage` via the `storage-service.ts` buffer.
5. [x] **State Integration:** The authentication status and user metadata (username, avatar) are stored in the `useSyncStore` (Zustand).
6. [x] **Navigation:** Upon successful auth, the user is redirected to the main capture interface (The Pulse).
7. [x] **Error Handling:** Invalid tokens or network failures are displayed as non-intrusive error states on the auth form.

## Tasks / Subtasks

- [x] Implement Security Utilities (AC: 3)
  - [x] Create `src/services/storage/crypto-utils.ts` for AES-GCM encryption/decryption using the Web Crypto API.
  - [x] Implement `encryptData` and `decryptData` with PBKDF2 key derivation (600,000 iterations).
- [x] Implement Auth Service (AC: 2, 5)
  - [x] Create `src/services/github/auth-service.ts` using `octokit`.
  - [x] Implement `validateToken(token: string)` and `getAuthenticatedUser(octokit: Octokit)` methods.
- [x] Build Auth Feature UI (AC: 1, 6, 7)
  - [x] Create `src/features/auth/components/AuthForm.tsx` using React 19 `useActionState` for handling the submission action.
  - [x] Use GitHub Primer (Dark Dimmed) styling for the form and inputs.
  - [x] Implement redirect logic to the Pulse screen upon success.
- [x] State Management (AC: 5)
  - [x] Update `src/stores/useSyncStore.ts` to include `isAuthenticated`, `user`, and `token` (encrypted) state.
  - [x] Ensure the "Write-Through" pattern: data is encrypted and saved to LocalStorage BEFORE updating the store.

## Dev Notes

- **React 19 Actions:** Leverage `useActionState` and `useFormStatus` to handle the asynchronous auth flow natively without `useEffect`.
- **Encryption Standard:** AES-GCM is mandatory. IV must be 12 bytes; salt must be 16 bytes. Store as a single buffer: `[salt(16) + iv(12) + ciphertext]`.
- **Octokit v4+:** Use the `Octokit` constructor with the `auth` property. 
- **Architectural Boundary:** No UI component communicates with GitHub directly. `AuthForm` calls `auth-service.ts` or a Zustand action.

### Project Structure Notes

- **Auth Module:** `src/features/auth/`
- **GitHub Service:** `src/services/github/auth-service.ts`
- **Crypto Utility:** `src/services/storage/crypto-utils.ts`
- **Global Store:** `src/stores/useSyncStore.ts`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/planning-artifacts/prd.md#Functional Requirements FR1, FR3]
- [Source: Web Research - March 11, 2026: React 19 Action State and AES-GCM Best Practices]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (March 2026)

### Debug Log References

- Installed `octokit` and `zustand` dependencies with `--legacy-peer-deps` due to eslint-plugin-react-hooks peer conflict with eslint v10
- Installed `@testing-library/dom` and `@testing-library/user-event` as missing test peer dependencies

### Completion Notes List

- **crypto-utils.ts**: AES-GCM encryption/decryption with PBKDF2 (600,000 iterations), 16-byte salt, 12-byte IV. Buffer layout: `[salt(16) | iv(12) | ciphertext]`. Configurable iteration count for faster testing.
- **auth-service.ts**: `validateToken()` creates Octokit instance and calls `getAuthenticated` endpoint. Returns typed `TokenValidationResult` union. `getAuthenticatedUser()` extracts login, avatarUrl, name. 4 unit tests with mocked Octokit.
- **useSyncStore.ts**: Zustand store with `isAuthenticated`, `user`, `encryptedToken` state. `setAuth()` implements write-through pattern (encrypt → localStorage → store update). **Security:** Encryption now uses a user-provided passphrase instead of a hardcoded key.
- **AuthForm.tsx**: React 19 `useActionState` for form submission. Added "App Passphrase" input to provide user-controlled encryption key. GitHub Dark Dimmed styling. Redirects to Pulse via `onSuccess` callback.
- **App.tsx**: Updated to conditionally render AuthForm or main interface based on auth state.
- **App.test.tsx**: Updated to test auth-gated rendering with mocked store.
- **Fix (AI Review):** Eliminated hardcoded encryption passphrase; optimized test performance by using lower PBKDF2 iterations in test environments.

### File List

- `src/services/storage/crypto-utils.ts`
- `src/services/storage/crypto-utils.test.ts`
- `src/services/github/auth-service.ts`
- `src/services/github/auth-service.test.ts`
- `src/stores/useSyncStore.ts`
- `src/stores/useSyncStore.test.ts`
- `src/features/auth/components/AuthForm.tsx`
- `src/features/auth/components/AuthForm.test.tsx`
- `src/App.tsx`
- `src/App.test.tsx`
- `package.json`
- `package-lock.json`
- `eslint.config.js` (verified)

## Change Log

- 2026-03-13: Implemented GitHub PAT authentication with AES-GCM encryption, Octokit token validation, Zustand state management with write-through pattern, and React 19 AuthForm UI with Dark Dimmed styling. 22 tests added across 5 test files, all passing.
