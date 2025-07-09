// this is the component for switching themes 

import { useTheme } from '../ThemeContext'
import { SunIcon, MoonIcon } from 'lucide-react'

const SwitchingThemes = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <SunIcon size={20} className="text-yellow-400" />
      ) : (
        <MoonIcon size={20} className="text-gray-800" />
      )}
    </button>
  )
}

export default SwitchingThemes
