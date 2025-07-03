// this file basically styles how each page of the application will look like.
import Header from './header'
import Sidebar from './Sidebar'
// ReactNode is a type that represents any valid React child, such as a string, number, element, or an array of these.
import { ReactNode } from 'react'

// interface is like a blueprint for an object.
// in this case, it defines that for any class or object that implements LayoutProps,
// it must have a children property of type ReactNode.
interface LayoutProps {
  children: ReactNode
}

//  {children}: LayoutProps is basically a parameter to the component that must be referncing the LayoutProps interface.
const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        {/* Main content area where the children components will be.
        The children will be featured next to the sidebar */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
export default Layout