import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { JournalLockProvider } from './contexts/JournalLockContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotesProvider } from './contexts/NotesContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
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
        </JournalLockProvider>
        </NotesProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
