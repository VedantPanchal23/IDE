import React, { useEffect } from 'react'
import { UserProvider, useUser } from './contexts/UserContext'
import Workbench from './workbench/Workbench'
import Login from './components/Auth/Login'
import './App.css'

function AppContent() {
  const { user, loading, loginWithToken } = useUser()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const email = params.get('email');
    const name = params.get('name');

    if (accessToken && email && name) {
      const userData = { email, name };
      loginWithToken(userData, accessToken);
      // Clean up the URL
      window.history.replaceState({}, document.title, "/");
    }
  }, [loginWithToken]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Demo mode - bypass authentication for professional UI showcase
    return user ? <Workbench /> : <Login />

}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}

export default App
