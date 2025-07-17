// since this file is a tsx file, it is a typescript file that uses REACT.
// therefore there will be HTML syntax in the code.
// react-router-dom is very useful to allow navigation between different pages without reloading.
// link is used when linking internal paths in the application.
import { Link } from 'react-router-dom'
// lucide-react is a library of icons and we will use it for the header icons.
import { BellIcon } from 'lucide-react'
import SwitchingThemes from './SwitchingThemes'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { API_ENDPOINTS } from '../config/api'

// JSON API converts PascalCase to camelCase, so we use camelCase here
interface ProfileData {
  id: number
  profilePictureUrl: string
}

// const = component declaration
// components are reusable pieces of code that can be used in different parts of the application.
// the header is a component because it will be used in every page of the application.
const Header = () => {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  // Try both lowercase and uppercase
  const userId = currentUser.id || currentUser.Id;
  const [profile, setProfile] = useState<ProfileData | null>(null)
  
  useEffect(() => {    
    if (!userId) {
      return
    }

    // Fetch profile data for the current user for the profile picture
    const fetchData = async () => {
      try {
        const profileRes = await axios.get(`${API_ENDPOINTS.users}/${userId}`)
        setProfile(profileRes.data)
      } catch (e) {
      }
    }
    fetchData()
  }, [userId])

  return (
    // tailwindcss stuff is basically where the CSS is written inline in HTML like syntax.
    <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6 flex items-center justify-between">
      {/* Logo for the website; clicking on it will direct you to the home page. */}
      <Link
        to="/"
        className="text-xl font-bold text-blue-600 dark:text-blue-400"
      >
        ClassConnect
      </Link>
      <div className="flex items-center space-x-4">
        {/* the button below toggles the theme between light and dark mode.
          Since I am in a type script element (div) the */} 
        <SwitchingThemes />
        {/* Notif button; allows users to get notifications regarding their activities.*/}
        {/* Links to the user's profile page */}
        <Link to="/profile" className="flex items-center">
          {/* Profile image with a border */}
          <img
            src={profile?.profilePictureUrl}
            alt="Profile"
            className="h-8 w-8 rounded-full border-2 border-blue-500"
          />
        </Link>
      </div>
    </header>
  )
}
// the header component is exported so it can be used in other files.
// default export is used when there is only one export in the file.
export default Header
