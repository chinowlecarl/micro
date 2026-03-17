import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'

import { Login } from './pages/Login'
import { Register } from './pages/Register'

import { AdminDashboard } from './pages/admin/Dashboard'
import { ManageEvents } from './pages/admin/ManageEvents'
import { EventForm } from './pages/admin/EventForm'
import { AdminEventDetail } from './pages/admin/EventDetail'
import { AdminRegistrations } from './pages/admin/Registrations'
import { AdminUsers } from './pages/admin/Users'
import { CheckInDesk } from './pages/admin/CheckIn'

import { UserDashboard } from './pages/user/UserDashboard'
import { BrowseEvents } from './pages/user/BrowseEvents'
import { MyTickets } from './pages/user/MyTickets'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function RootRedirect() {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute adminOnly><Layout><ManageEvents /></Layout></ProtectedRoute>} />
          <Route path="/admin/events/create" element={<ProtectedRoute adminOnly><Layout><EventForm /></Layout></ProtectedRoute>} />
          <Route path="/admin/events/edit/:id" element={<ProtectedRoute adminOnly><Layout><EventForm /></Layout></ProtectedRoute>} />
          <Route path="/admin/events/:id" element={<ProtectedRoute adminOnly><Layout><AdminEventDetail /></Layout></ProtectedRoute>} />
          <Route path="/admin/registrations" element={<ProtectedRoute adminOnly><Layout><AdminRegistrations /></Layout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><Layout><AdminUsers /></Layout></ProtectedRoute>} />
          <Route path="/admin/checkin" element={<ProtectedRoute adminOnly><Layout><CheckInDesk /></Layout></ProtectedRoute>} />

          {/* User routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><UserDashboard /></Layout></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Layout><BrowseEvents /></Layout></ProtectedRoute>} />
          <Route path="/my-tickets" element={<ProtectedRoute><Layout><MyTickets /></Layout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
