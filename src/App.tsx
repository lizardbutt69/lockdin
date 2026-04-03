import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { JournalLockProvider } from './contexts/JournalLockContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotesProvider } from './contexts/NotesContext'
import { XPProvider } from './contexts/XPContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import XPNotification from './components/dashboard/XPNotification'
import { useXPNotification } from './contexts/XPContext'

function XPNotificationWrapper() {
  const { notification, dismissNotification } = useXPNotification()
  return <XPNotification notification={notification} onDismiss={dismissNotification} />
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <XPProvider>
        <NotesProvider>
        <JournalLockProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <XPNotificationWrapper />
        </JournalLockProvider>
        </NotesProvider>
        </XPProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
