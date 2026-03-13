import { Suspense } from 'react'
import { useSyncStore } from './stores/useSyncStore'
import { AuthGuard } from './components/auth/AuthGuard'
import { AuthSkeleton } from './components/ui/AuthSkeleton'
import { AuthForm } from './features/auth/components/AuthForm'
import './App.css'

function AppContent() {
  const isAuthenticated = useSyncStore((s) => s.isAuthenticated)
  const user = useSyncStore((s) => s.user)

  if (!isAuthenticated) {
    return <AuthForm onSuccess={() => {}} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">code-tasks</h1>
        <p className="app-subtitle">
          {user ? `Welcome, ${user.login}` : 'GitHub issue capture for developers on the go'}
        </p>
      </header>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthGuard>
        <AppContent />
      </AuthGuard>
    </Suspense>
  )
}

export default App
