import { useEffect, useState, createContext, useContext, ReactNode} from 'react'
type Theme = 'light' | 'dark'
// toggleTheme is a function that will be used to toggle the theme between light and dark mode.
// () => void means that the function does not take any arguments and does not return anything.
interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}
// contexts are used to share data between componenets. Kinda like a global state.
// createContext is a function that creates a context object.
// The context object will be used to provide the theme and toggleTheme function to the components that need it.
// undefined is used to indicate that the context is not yet defined.
// the type is ThemeContextType | undefined, meaning it can be either the defined type or undefined.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
// children are the components that will be wrapped by the ThemeProvider.
// basically the components in the app that will be affected by the theme change.
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // useState is a hook that allows you to add state to a functional component.
  // useState takes an initial value and returns an array with the current state and a function to update it.
  // The initial value is set to 'light' or the value saved in localStorage.
  // localStorage stores the data in the browser so that it persists even after the page is reloaded.
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme')
    return (savedTheme as Theme) || 'light'
  })
  // usestate is used to manage the theme state.
  // useEffect is a hook that allows you to perform side effects in a functional component.
  // the side effect here is to update the localStorage and the document's class list whenever the theme changes.
  // [theme] is a dependency array that tells React to run this effect whenever the theme changes.
  useEffect(() => {
    localStorage.setItem('theme', theme)
    // instead of checking what the current theme is and then adding or removing the class, we can just remove both
    //  classes and add the current theme class.
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])
  // toggleTheme is a function that toggles the theme between light and dark mode.
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }
  return (
    // returns the ThemeContext.Provider component which provides the theme and toggleTheme function to its children.
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
// useTheme is a custom hook that allows you to access the theme context.
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
