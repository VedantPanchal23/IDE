import React, { useEffect } from 'react'
import { UserProvider, useUser } from './contexts/UserContext'
import Workbench from './workbench/Workbench'
import Login from './components/Auth/Login'
import './App.css'

function AppContent() {
  const { user, loading, loginWithToken } = useUser()

  useEffect(() => {
    console.log('[App] AppContent mounted, user:', user, 'loading:', loading)
    
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const email = params.get('email');
    const name = params.get('name');

    if (accessToken && email && name) {
      console.log('[App] Found auth params in URL, logging in with token')
      const userData = { email, name };
      loginWithToken(userData, accessToken);
      // Clean up the URL
      window.history.replaceState({}, document.title, "/");
    }
  }, [loginWithToken]);

  console.log('[App] Render - user:', user, 'loading:', loading)

  if (loading) {
    console.log('[App] Showing loading screen')
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Demo mode - bypass authentication for testing
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || window.location.search.includes('demo=true')
  
  if (isDemoMode) {
    console.log('[App] Running in demo mode - bypassing authentication')
    return <Workbench />
  }

  console.log('[App] Rendering based on auth state - user exists:', !!user)
  return user ? <Workbench /> : <Login />
}

function App() {
  console.log('[App] Main App component rendering')
  
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}

export default App
