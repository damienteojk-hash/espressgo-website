import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Success from './pages/Success'
import './App.css'

function App() {
  const [page, setPage] = useState('home')

  useEffect(() => {
    const path = window.location.pathname
    if (path === '/success') setPage('success')
    else if (path === '/admin') setPage('admin')
  }, [])

  const goHome = () => {
    window.history.pushState({}, '', '/')
    setPage('home')
  }

  if (page === 'admin') return <Admin onBack={goHome} />
  if (page === 'success') return <Success onBackHome={goHome} />
  return <Home onAdminNav={() => setPage('admin')} />
}

export default App