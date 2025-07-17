// this file is basically the sidebar component that will allow users to navigate through the application.
// usestate allows components to update their state and re-render when the state changes.
// this is useful for managing the sidebar's open and closed state.
import { useState } from 'react'
// navlink is used to navigate between different pages in the application without reloading the page.
import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  UserIcon,
  BookOpenIcon,
  MessageCircleIcon,
  UsersIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react'

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
    // the sidebar can be open and closed so we need to manage its state.
    // isOpen is a boolean that determines whether the sidebar is open or closed.
    // setIsOpen is a function that allows us to update the state of isOpen.
  const [isOpen, setIsOpen] = useState(false)
  // const inside const is for the function that toggles the sidebar open and closed.
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }
  // the items that will be displayed in the sidebar.
  const navItems = [
    {
      path: '/',
      icon: <HomeIcon size={20} />,
      label: 'Home',
    },
    {
      path: '/profile',
      icon: <UserIcon size={20} />,
      label: 'Profile',
    },
    {
      path: '/courses',
      icon: <BookOpenIcon size={20} />,
      label: 'Courses',
    },
    {
      path: '/chat',
      icon: <MessageCircleIcon size={20} />,
      label: 'Chats',
    },
    {
      path: '/connections',
      icon: <UsersIcon size={20} />,
      label: 'Connections',
    },
  ]
  // after the sidebar is defined, we can return the JSX that will be rendered.
  return (
    <>
    {/*Sidebar button that opens/closes it */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-500 text-white rounded-md"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
      </button>
      <aside
        className={`bg-white dark:bg-gray-800 w-64 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 fixed md:static top-0 bottom-0 left-0 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-4">
          <nav className="space-y-2">
            {/* maps every item in the navItems array in the sidebar. */}
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`
                }
                // if an item is clicked, the sidebar will close and the user will be redirected to the page.
                onClick={() => setIsOpen(false)}
              >
                {/* Click anywhere in the navlink and it will redirect you to the corresponding page */}
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            className="w-full flex items-center justify-center mt-8 px-4 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>
    </>
  )
}
export default Sidebar