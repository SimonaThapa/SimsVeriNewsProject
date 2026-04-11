// App.jsx — Root app with all routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

// Public pages
import HomePage from './pages/public/HomePage.jsx'
import AboutPage from './pages/public/AboutPage.jsx'
import ContactPage from './pages/public/ContactPage.jsx'
import LoginPage from './pages/public/LoginPage.jsx'
import RegisterPage from './pages/public/RegisterPage.jsx'

// User pages
import Dashboard from './pages/user/Dashboard.jsx'
import InputClaimPage from './pages/user/InputClaimPage.jsx'
import ResultPage from './pages/user/ResultPage.jsx'
import TrendsPage from './pages/user/TrendsPage.jsx'
import QuizPage from './pages/user/QuizPage.jsx'
import NotificationsPage from './pages/user/NotificationsPage.jsx'
import EducationalPage from './pages/user/EducationalPage.jsx'
import LeaderboardPage from './pages/user/LeaderboardPage.jsx'
import ProfilePage from './pages/user/ProfilePage.jsx'
import TrendingClaimsPage from './pages/user/TrendingClaimsPage.jsx'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ManageUsers from './pages/admin/ManageUsers.jsx'
import ManageClaims from './pages/admin/ManageClaims.jsx'
import ManageNotifications from './pages/admin/ManageNotifications.jsx'
import ManageQuiz from './pages/admin/ManageQuiz.jsx'
import ManageEducational from './pages/admin/ManageEducational.jsx'
import ManageMessages from './pages/admin/ManageMessages.jsx'

// Layouts
import UserLayout from './components/layout/UserLayout.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import Chatbot from './components/ui/Chatbot.jsx'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (role === 'admin' && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  if (role === 'user' && user.role === 'admin') return <Navigate to="/admin-dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>
  if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />
  if (user?.role === 'user') return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* ── User ── */}
      <Route path="/dashboard" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/check" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<InputClaimPage />} />
      </Route>
      <Route path="/result/:id" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<ResultPage />} />
      </Route>
      <Route path="/trends" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<TrendsPage />} />
      </Route>
      <Route path="/trending-claims" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<TrendingClaimsPage />} />
      </Route>
      <Route path="/quiz" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<QuizPage />} />
      </Route>
      <Route path="/notifications" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<NotificationsPage />} />
      </Route>
      <Route path="/learn" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<EducationalPage />} />
      </Route>
      <Route path="/leaderboard" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<LeaderboardPage />} />
      </Route>
      <Route path="/profile" element={<ProtectedRoute role="user"><UserLayout /></ProtectedRoute>}>
        <Route index element={<ProfilePage />} />
      </Route>

      {/* ── Admin ── */}
      <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
      </Route>
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<ManageUsers />} />
      </Route>
      <Route path="/admin/claims" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<ManageClaims />} />
      </Route>
      <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<ManageNotifications />} />
      </Route>
      <Route path="/admin/quiz" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<ManageQuiz />} />
      </Route>
      <Route path="/admin/educational" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<ManageEducational />} />
      </Route>
      <Route path="/admin/messages" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<ManageMessages />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
          <Chatbot />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
