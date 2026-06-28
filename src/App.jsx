import { useState } from 'react'
import Home from './pages/Home'
import Admin from './pages/Admin'
import './App.css'

function App() {
  const [page, setPage] = useState('home')
  if (page === 'admin') return <Admin onBack={() => setPage('home')} />
  return <Home onAdminNav={() => setPage('admin')} />
}

export default App