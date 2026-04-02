import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage     from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage'
import RecordsPage   from './pages/RecordsPage'
import UsersPage     from './pages/UsersPage'
import Layout        from './components/Layout'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400">Loading...</div>
  if (!user)   return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/records"   element={<RecordsPage />} />
        <Route path="/users"     element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}