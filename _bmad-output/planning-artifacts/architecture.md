---
stepsCompleted: ["step-01-init", "step-02-context", "step-03-starter", "step-04-decisions", "step-05-patterns", "step-06-structure", "step-07-validation"]
inputDocuments: ["_bmad-output/planning-artifacts/prd.md", "_bmad-output/planning-artifacts/product-brief-code-tasks-2026-03-10.md", "docs/research-impulses.md", "docs/vision.md", "docs/example-format.md", "docs/the-gitty-chronicles.md"]
workflowType: 'architecture'
project_name: 'code-tasks'
user_name: 'Thomas'
date: '2026-03-10'
---

...

## Architecture Validation Results

### Coherence Validation ✅
- **Decision Compatibility:** All technology choices (Octokit, LocalStorage, Zustand) are lightweight and perfectly compatible with the React 19 / Vite 7 / PWA stack.
- **Pattern Consistency:** Implementation patterns (Octokit Service Layer, Zustand Sync Heartbeat) directly support the core architectural decisions for speed and reliability.
- **Structure Alignment:** The feature-based folder structure (`src/features/`) provides clear isolation for capture, sync, and auth logic.

### Requirements Coverage Validation ✅
- **Functional Requirements Coverage:** Every FR from the PRD is mapped to a specific feature module or service layer.
- **Non-Functional Requirements Coverage:** Performance targets (< 1.5s TTI) are addressed via the lightweight "Lean & Mean" stack and LocalStorage synchronous buffer.

### Implementation Readiness Validation ✅
- **Decision Completeness:** All critical decisions (Persistence, Auth, Integration) are documented with 2026-verified versions.
- **Structure Completeness:** A specific, feature-based project tree has been defined to guide AI agents.
- **Pattern Completeness:** Naming, state management, and error handling patterns are clearly defined and enforceable.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION
**Confidence Level:** High

**Key Strengths:**
- **Capture Velocity:** Instant synchronous capture via LocalStorage meets the "Max Test."
- **Sync Integrity:** Octokit-driven "Get-Modify-Set" pattern prevents remote data loss.
- **Modular Evolution:** Feature-based structure facilitates Phase 2/3 growth without debt.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Use the Octokit Service Layer for all GitHub interactions.
- Adhere to the feature-based project structure.

**First Implementation Priority:**
Initialize the core project: `npm create @vite-pwa/pwa@latest`

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
code-tasks/
├── public/                # Static assets (logo, manifest.json, sw.js)
├── src/
│   ├── assets/            # Global styles and images
│   ├── components/        # Shared UI components (Button, Input, etc.)
│   ├── features/          # Feature-based modules
│   │   ├── auth/          # PAT entry and validation
│   │   ├── capture/       # "The Pulse" input and priority pills
│   │   ├── repos/         # Repository selection and search
│   │   └── sync/          # FAB and sync status indicators
│   ├── hooks/             # Shared React hooks
│   ├── services/          # Infrastructure / API layer
│   │   ├── github/        # Octokit wrapper (github-service.ts)
│   │   └── storage/       # LocalStorage buffer (storage-service.ts)
│   ├── stores/            # Zustand global state (useSyncStore.ts)
│   ├── types/             # Shared TypeScript interfaces
│   ├── utils/             # Pure utility functions (formatting, dates)
│   ├── App.tsx            # Main app shell & router
│   └── main.tsx           # Entry point
├── tests/                 # Integration and E2E tests (Playwright)
├── .env                   # Environment variables (MODE, etc.)
├── capacitor.config.ts    # Native bridge config
├── vite.config.ts         # PWA and build config
└── package.json           # Dependencies (React 19, Octokit, Zustand)
```

### Architectural Boundaries

**Service Boundaries:**
- **The Sync Boundary:** No UI component communicates with GitHub directly. All actions are dispatched via the `useSyncStore`, which coordinates with the `github-service.ts`.
- **The Persistence Boundary:** `storage-service.ts` is the exclusive owner of `localStorage` interaction, acting as a synchronous local-first buffer for the sync engine.

**Component Boundaries:**
- **Feature-Based Isolation:** Logic for "Capture" vs. "Sync" vs. "Auth" is strictly isolated in `src/features/`. Cross-feature communication is handled via the global `useSyncStore`.

**Data Boundaries:**
- **AI-Ready Header Logic:** The `sync` service encapsulates all logic for detecting new repository files and injecting the AI-Ready header.

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- **Identity & Auth:** `src/features/auth/`, `src/services/github/auth-service.ts`
- **"The Pulse" Capture:** `src/features/capture/`, `src/services/storage/`
- **Sync Engine:** `src/features/sync/`, `src/services/github/sync-service.ts`
- **Repo Selector:** `src/features/repos/`, `src/services/github/repo-service.ts`

**Cross-Cutting Concerns:**
- **Global State:** `src/stores/useSyncStore.ts`
- **Offline Reliability:** `src/services/storage/storage-service.ts`
- **PWA Configuration:** `vite.config.ts`, `public/manifest.json`, `public/sw.js`

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Code Naming Conventions:**
- **Components:** `PascalCase` (e.g., `TaskCard.tsx`, `PulseInput.tsx`).
- **Services/Utils:** `kebab-case` (e.g., `github-service.ts`, `local-storage-buffer.ts`).
- **Hooks:** `camelCase` with `use` prefix (e.g., `useSyncStore.ts`).
- **CSS Modules:** `camelCase` for class names (e.g., `.taskItem`, `.pulseActive`).

### Structure Patterns

**Project Organization:**
- **Components:** Organized by feature (e.g., `src/features/capture/components`).
- **Services:** Centralized in `src/services/` (e.g., `src/services/github/`).
- **State:** Centralized in `src/stores/` (e.g., `src/stores/useSyncStore.ts`).
- **Tests:** Co-located with source files (e.g., `github-service.test.ts` next to `github-service.ts`).

### Format Patterns

**Data Exchange Formats:**
- **JSON Fields:** `camelCase` (e.g., `lastSyncedAt`, `isImportant`).
- **Date Format:** ISO 8601 strings for all timestamps.
- **Null Handling:** Explicit `null` for missing values, never `undefined` in stored data.

### State Management Patterns

**Sync Heartbeat:**
- All synchronization states (Offline, Pending count, Syncing status) MUST be managed in a single **Zustand store** (`useSyncStore`).
- **Write-Through Pattern:** Data is written to `localStorage` synchronously BEFORE updating the Zustand store to prevent data loss on crash.

### Process & Testing Patterns

**Error Handling:**
- **Silent-but-Visible Sync:** Background sync errors do not use intrusive alerts; they update the UI state (e.g., FAB turns red) for non-blocking recovery.
- **Retry Logic:** Exponential backoff for GitHub API calls, managed within the `github-service.ts`.

**Debug & Diagnostics:**
- **Hidden Debug UI:** A development-only debug overlay (`<DebugOverlay />`) used to manually toggle network states (Online/Offline) and clear local buffers for E2E testing.
- **Enforcement:** `import.meta.env.MODE === 'development'` check to ensure debug tools are excluded from production builds.

### Enforcement Guidelines

**All AI Agents MUST:**
- Use the **Octokit Service Layer** for all GitHub interactions; no raw `octokit` calls in UI components.
- Adhere to the **Atomic Commit** pattern: Pull -> Merge Local -> Push to prevent overwriting remote changes.
- Ensure 100% test coverage for all sync-retry and data-persistence logic.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Persistence Engine:** LocalStorage for immediate, synchronous "Midnight Spark" capture.
- **Auth Strategy:** GitHub Personal Access Tokens (PAT) for the leanest possible MVP.
- **GitHub Integration:** Official `octokit` library for all repository and file-level operations.

**Important Decisions (Shape Architecture):**
- **State Management:** `zustand` for high-performance, lightweight sync-state tracking.
- **Sync Logic:** Manual "Push" trigger via FAB + Automated "Pull" on app launch.

**Deferred Decisions (Post-MVP):**
- **OAuth Proxy:** Full OAuth flow deferred to Phase 2 (Growth) to prioritize speed-to-market.
- **IndexedDB Migration:** If data requirements exceed 5MB (highly unlikely for Markdown), we'll migrate from LocalStorage.

### Data Architecture

- **Local Storage:** **LocalStorage**. Markdown content is small enough to fit within standard 5MB browser limits, allowing for instant, synchronous local "Capture" without the overhead of IndexedDB for the MVP.
- **Data Schema:** The Markdown file follows the `captured-ideas-{username}.md` schema with a persistent AI-Ready instruction header.

### Authentication & Security

- **Auth Provider:** **GitHub PAT**. Users provide a Personal Access Token with `repo` scope. This eliminates the need for a complex OAuth proxy backend for the MVP.
- **Local Security:** Tokens are stored securely in LocalStorage (or session storage) and used strictly for HTTPS communication with the GitHub API.

### API & Communication Patterns

- **Integration Library:** **`octokit` (v4+)**. The official GitHub JavaScript SDK will handle all commit, pull, and repo-discovery logic.
- **Sync Pattern:** Atomic "Push-All" logic. When the user taps the FAB, all pending local tasks are batched and committed to GitHub in a single operation to minimize rate-limit usage.

### Frontend Architecture

- **State Management:** **`zustand` (v5+)**. Used to track global app state: current repository selection, local "Dirty" (unsynced) tasks, and network status.
- **Gesture Support:** "Pull-to-Refresh" for manual repository synchronization (Automated Pull).

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialize Vite PWA with TypeScript.
2. Implement Octokit Auth via PAT input.
3. Build LocalStorage "Task Buffer" with Zustand state.
4. Implement the FAB "Push" logic and "AI Header" injection.

**Cross-Component Dependencies:**
The `octokit` instance is the central dependency for both the Repository Selector and the Sync Engine. Zustand acts as the "Heartbeat" connecting the UI to the local-first storage.

## Starter Template Evaluation

### Primary Technology Domain
**Mobile App (Cross-Platform / PWA-First)** based on project requirements for high-velocity capture and offline reliability.

### Selected Starter: Vite + React + @vite-pwa

**Rationale for Selection:**
The **Vite + React + `@vite-pwa/pwa`** stack provides a high-performance, modern core (React 19+, Vite 7+) with native PWA capabilities (Service Workers via Workbox) out-of-the-box. This ensures we hit the **< 1.5s TTI** target while keeping a clear, lean path to **Capacitor 7+** for App Store and Play Store deployment in Phase 2.

**Initialization Command:**

```bash
# 1. Create the PWA core (Choose React + TS)
npm create @vite-pwa/pwa@latest

# 2. Add the native bridge
npm install @capacitor/core @capacitor/cli
npx cap init
```

### Architectural Decisions Provided by Starter:

**Language & Runtime:**
**React 19+** with **TypeScript** for strict typing and concurrent mode support.

**Build Tooling:**
**Vite 7+** for instant HMR and optimized production build-time performance.

**PWA Engine:**
**`vite-plugin-pwa`** for service worker generation and manifest management, enabling offline-first reliability.

**Styling Solution:**
**Vanilla CSS** (preferred) or Tailwind v4 compatibility.

**Native Bridge:**
**Capacitor 7+** for optional native shell deployment and device API access.

**Note:** Project initialization using this command should be the first implementation story.


_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
**code-tasks** requires a high-performance capture interface ("The Pulse") with fluid animations and a robust synchronization engine. The system must manage GitHub OAuth authentication, repository selection (with "Last Used" intelligence), and file-level Markdown manipulation (`captured-ideas-{username}.md`). Key capabilities include offline-first local persistence (IndexedDB) and manual push/automated pull synchronization.

**Non-Functional Requirements:**
- **Performance:** Time-to-Interactive (TTI) < 1.5s; 60 FPS animations.
- **Security:** Encrypted local storage for tokens; HTTPS transport.
- **Reliability:** 100% data retention for captured ideas; exponential backoff for sync failures.

**Scale & Complexity:**
The project is of **Medium Complexity** due to the technical depth required for the offline-to-online state machine and the high-fidelity UX on a PWA footprint.
- **Primary technical domain:** Mobile / Web App (PWA)
- **Complexity level:** Medium
- **Estimated architectural components:** Auth Provider, Repository Service, Sync Engine (IndexedDB + GitHub API), Pulse UI Component, AI Header Generator.

### Technical Constraints & Dependencies

- **GitHub REST/GraphQL API:** Primary data storage and authentication provider.
- **IndexedDB:** Local-first storage engine for offline reliability.
- **PWA / Service Workers:** Enabling the "Native-like" feel and offline availability.

### Cross-Cutting Concerns Identified

- **Authentication State Persistence:** Managing tokens across sessions and reloads.
- **Conflict Avoidance:** Using `{username}` file-scoping to prevent merge conflicts.
- **AI-Ready Standardization:** Ensuring every captured task list follows a unified "Living Document" schema.
