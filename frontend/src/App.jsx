import { Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import MainPage        from './pages/MainPage'
import AdminLogin      from './pages/AdminLogin'
import AdminDashboard  from './pages/AdminDashboard'

function ProtectedAdmin({ children }) {
  const token = localStorage.getItem('eco_admin_token')
  return token ? children : <Navigate to="/admin" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public interface — wrapped in AppProvider for WebSocket state */}
      <Route
        path="/"
        element={
          <AppProvider>
            <MainPage />
          </AppProvider>
        }
      />

      {/* Admin */}
      <Route path="/admin"           element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdmin>
            <AdminDashboard />
          </ProtectedAdmin>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
