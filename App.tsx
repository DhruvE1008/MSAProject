// app is used to manage user authentication and routing
import { useState } from 'react'
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
export function App() {
    // checks whether the user is authenticated
  // if the user is authenticated, they can access the main app
  // if not, they are redirected to the login page
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  // function to handle user login
  const handleLogin = () => {
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        ) : (
            // if not authenticated, it shows the login page
          <Routes>
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          </Routes>
        )}
      </Router>
    </ThemeProvider>
  )
}
