// this page is the current landing page. 
// I will create a landing page that will redirect to this page so that hte user can login.
// will need to create a sign up page as well.
import React, { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { SunIcon, MoonIcon } from 'lucide-react'
// objects that reference this interface need to have an onLogin function which has no parameters and returns nothing.
interface LoginProps {
  onLogin: () => void
}
const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // requires the theme context here because its preauthentication so it doesn't import header.
  const { theme, toggleTheme } = useTheme()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would validate credentials here
    onLogin()
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={
          theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        }
      >
        {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
      </button>
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            ClassConnect
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Connect with classmates in your courses
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button className="text-blue-600 dark:text-blue-400 hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
export default Login
