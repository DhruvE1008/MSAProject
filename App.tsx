// app is used to manage user authentication and routing
import React, { useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { ThemeProvider } from './ThemeContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Courses from './pages/Courses'
import Chat from './pages/Chat'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import SignUp from './pages/SignUp'
import Connections from './pages/Connections'
export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const handleLogin = () => {
    setIsAuthenticated(true)
  }
  const handleSignUp = () => {
    setIsAuthenticated(true)
  }
  return (
    <ThemeProvider>
      <Router>
        {/* If authenticated then it shows the page with the potential routes to other pages. */}
        {isAuthenticated ? (
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/chat/:courseId" element={<Chat />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        ) : (
          // if not authenticated, it shows the login page
          <Routes>
            {/* The landing page is the first page that the user sees when they visit the site. */}
            <Route path="/" element={<LandingPage />} />
            {/* The login page is where the user can log in to their account. */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            {/* The sign up page is where the user can create a new account. */}
            <Route
              path="/signup"
              element={<SignUp onSignUp={handleSignUp} />}
            />
            {/* The home page is where the user can see the courses and other information. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </Router>
    </ThemeProvider>
  )
}
