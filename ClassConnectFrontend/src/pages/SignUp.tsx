import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, EyeOffIcon, EyeIcon } from 'lucide-react'
import SwitchingThemes from '../components/SwitchingThemes'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

interface SignUpProps {
  onSignUp: () => void
}

const SignUp = ({ onSignUp }: SignUpProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    major: '',
    year: 'Freshman',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  // Toggle password visibility
  // This function toggles the visibility of the password field between text and password type.
  // It is used to show or hide the password when the user clicks on the eye icon.
  const toggleShowPassword = () => setShowPassword(!showPassword)

  // Validate form data before submission
  // This function checks if the required fields are filled and if the passwords match.
  // It returns an object with error messages for each field that has an error.
  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.bio) newErrors.bio = 'Bio is required - tell us about yourself'
    if (!formData.major) newErrors.major = 'Major is required'
    return newErrors
  }

  // Generate a random username for the user
  // This function creates a unique username by combining an adjective and a noun with a random number.
  // It helps to create an anonymous username for the user.
  const adjectives = [
  'Hidden',
  'Anonymous',
  'Silent',
  'Mysterious',
  'Ghostly',
  'Wandering',
]

const nouns = [
  'Falcon',
  'Panda',
  'Cactus',
  'Knight',
  'Shadow',
  'Otter',
]

function generateAnonymousName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 1000) // Optional uniqueness
  return `${adj}${noun}${number}`
}


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const newErrors = validate()
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
  }

  // Generate random username
  const username = generateAnonymousName()

  // Prepare user data to match your backend User model
  const newUser = {
    name: `${formData.firstName} ${formData.lastName}`, // Combine first + last name
    email: formData.email,
    bio: formData.bio,
    password: formData.password, // Backend should hash this
    username: username,
    year: formData.year,
    major: formData.major,
    profilePictureUrl: "" // Empty for now
  }

  console.log('Sending user data:', newUser) // Debug log

  try {
    // Send the user data in the request body
    const response = await axios.post(API_ENDPOINTS.users, newUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const user = response.data
    // Change from localStorage to sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify(user))
    
    // Success - call parent callback
    onSignUp()
    
  } catch (error: any) {
    console.error('Full error:', error) // Debug log
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const message = error.response.data?.message || error.response.data || 'Unknown error'
      
      if (status === 409) {
        setErrors({ email: 'Email is already registered' })
      } else if (status === 415) {
        alert('Server error: Content type not supported. Check backend configuration.')
      } else {
        alert(`Error creating account (${status}): ${message}`)
      }
    } else {
      // Network error
      alert('Network error: Unable to connect to server. Make sure your backend is running.')
    }
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 transition-colors duration-200">
      {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
        <SwitchingThemes />
        </div>

      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-4 left-4 flex items-center p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeftIcon size={20} className="mr-1" />
        <span className="text-sm">Back to Home</span>
      </Link>

      <div className="max-w-3xl w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            Create Your Account
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Join ClassConnect to connect with classmates and ace your courses
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* First & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['firstName', 'lastName'].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field === 'firstName' ? 'First Name' : 'Last Name'}
                </label>
                <input
                  id={field}
                  name={field}
                  type="text"
                  required
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    errors[field] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors[field] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[field]}</p>}
              </div>
            ))}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOffIcon size={20} className="text-gray-500" /> : <EyeIcon size={20} className="text-gray-500" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
          </div>

          {/* Major + Year + Bio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="major" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Major
              </label>
              <input
                id="major"
                name="major"
                type="text"
                required
                value={formData.major}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.major ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.major && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.major}</p>}
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option>First Year</option>
                <option>Second Year</option>
                <option>Third Year</option>
                <option>Fourth Year</option>
                <option>PostGraduate</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio - Tell us about yourself
              </label>
              <input
                id="bio"
                name="bio"
                type="text"
                required
                value={formData.bio}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border ${
                  errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.bio && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio}</p>}
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp
