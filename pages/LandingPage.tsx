// this page is the first page that the user sees when they visit the site.
import { Link } from 'react-router-dom'
import {
  BookOpenIcon,
  UsersIcon,
  MessageCircleIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-react'
import { useTheme } from '../ThemeContext'
const LandingPage = () => {
  const { theme, toggleTheme } = useTheme()
  const features = [
    {
      icon: <BookOpenIcon size={24} className="text-blue-600" />,
      title: 'Course Connections',
      description: 'Find and connect with classmates in all your courses',
    },
    {
      icon: <MessageCircleIcon size={24} className="text-blue-600" />,
      title: 'Group Discussions',
      description:
        'Join course-specific chat rooms to discuss assignments and lectures',
    },
    {
      icon: <UsersIcon size={24} className="text-blue-600" />,
      title: 'Study Partners',
      description: 'Find study partners with similar interests and goals',
    },
  ]
  const testimonials = [
    {
      quote:
        'ClassConnect helped me find study partners in my toughest classes. My grades improved dramatically!',
      name: 'Sarah J.',
      role: 'Computer Science Major',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
    {
      quote:
        'The course-specific chat rooms made it easy to get quick help on assignments when I was stuck.',
      name: 'Michael T.',
      role: 'Engineering Student',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
  ]
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <header className="py-4 px-6 md:px-10 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
            ClassConnect
          </h1>
        </div>
        <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>
            {/* Navigation Links to sign up and sign in pages*/}
          <Link
            to="/login"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>
      </header>
      {/* Hero Section */}
      <section className="flex-1 flex flex-col lg:flex-row items-center px-6 md:px-10 py-12 md:py-20">
        <div className="w-full lg:w-1/2 mb-10 lg:mb-0 lg:pr-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Connect with classmates and succeed together
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            ClassConnect helps you find and collaborate with students in your
            courses. Join discussions, form study groups, and build your
            academic network.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className="px-6 py-3 bg-blue-600 text-white rounded-md text-center font-medium text-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-center font-medium text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80"
            alt="Students collaborating"
            className="rounded-xl shadow-lg w-full"
          />
        </div>
      </section>
      {/* Features Section */}
      <section className="py-12 md:py-20 px-6 md:px-10 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            How ClassConnect helps students
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full inline-flex mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="py-12 md:py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            What students are saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700"
              >
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-12 md:py-20 px-6 md:px-10 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to connect with your classmates?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of students using ClassConnect to improve their
            academic experience
          </p>
          <Link
            to="/signup"
            className="px-8 py-3 bg-white text-blue-600 rounded-md font-medium text-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-8 px-6 md:px-10 bg-gray-100 dark:bg-gray-800 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          &copy; {new Date().getFullYear()} ClassConnect. All rights reserved.
        </p>
        <div className="flex justify-center mt-4 space-x-4">
          <a
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Terms
          </a>
          <a
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Privacy
          </a>
          <a
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Help
          </a>
        </div>
      </footer>
    </div>
  )
}
export default LandingPage
