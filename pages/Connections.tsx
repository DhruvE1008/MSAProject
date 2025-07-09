import { useState } from 'react'
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  UserPlusIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react'
const Connections = () => {
  const [activeTab, setActiveTab] = useState('connections')
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('All Courses')
  // Mock data
  const connections = [
    {
      id: 1,
      name: 'Emma Watson',
      major: 'Computer Science',
      year: 'Junior',
      courses: ['Data Structures', 'Algorithms', 'Database Systems'],
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
    {
      id: 2,
      name: 'James Smith',
      major: 'Physics',
      year: 'Senior',
      courses: ['Quantum Mechanics', 'Physics 101'],
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
    {
      id: 3,
      name: 'Olivia Johnson',
      major: 'Mathematics',
      year: 'Sophomore',
      courses: ['Calculus II', 'Discrete Mathematics'],
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
    {
      id: 4,
      name: 'Michael Brown',
      major: 'Computer Science',
      year: 'Senior',
      courses: ['Web Development', 'Data Structures'],
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
  ]
  const pendingRequests = [
    {
      id: 1,
      name: 'John Doe',
      major: 'Computer Science',
      year: 'Junior',
      course: 'Introduction to Computer Science',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
    {
      id: 2,
      name: 'Jane Smith',
      major: 'Mathematics',
      year: 'Sophomore',
      course: 'Calculus II',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
  ]
  const suggestedConnections = [
    {
      id: 1,
      name: 'Sarah Williams',
      major: 'Computer Science',
      year: 'Junior',
      mutualConnections: 3,
      courses: ['Data Structures', 'Algorithms'],
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
    {
      id: 2,
      name: 'David Miller',
      major: 'Physics',
      year: 'Senior',
      mutualConnections: 2,
      courses: ['Physics 101'],
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
    {
      id: 3,
      name: 'Jennifer Lee',
      major: 'Mathematics',
      year: 'Junior',
      mutualConnections: 1,
      courses: ['Calculus II', 'Linear Algebra'],
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
  ]
  const courses = [
    'All Courses',
    'Data Structures',
    'Algorithms',
    'Database Systems',
    'Web Development',
    'Calculus II',
    'Discrete Mathematics',
    'Physics 101',
    'Quantum Mechanics',
  ]
  const filterConnections = (connections) => {
    return connections.filter((connection) => {
      const matchesSearch = connection.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCourse =
        courseFilter === 'All Courses' ||
        (connection.courses && connection.courses.includes(courseFilter))
      return matchesSearch && matchesCourse
    })
  }
  const filteredConnections = filterConnections(connections)
  const filteredSuggestions = suggestedConnections.filter((connection) =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Connections</h1>
      </div>
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('connections')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'connections' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'}`}
          >
            My Connections
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'}`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'discover' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'}`}
          >
            Discover
          </button>
        </nav>
      </div>
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab === 'connections' ? 'connections' : activeTab === 'requests' ? 'requests' : 'people'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {activeTab !== 'requests' && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon size={18} className="text-gray-400" />
            </div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {/* Content based on active tab */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnections.length > 0 ? (
            filteredConnections.map((connection) => (
              <div
                key={connection.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start">
                    <img
                      src={connection.avatar}
                      alt={connection.name}
                      className="h-12 w-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">
                        {connection.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {connection.major}, {connection.year}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Shared Courses:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {connection.courses.map((course, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-xs"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Message
                    </button>
                    <button className="text-sm text-red-600 dark:text-red-400 hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <UserPlusIcon size={40} className="text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No connections found
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || courseFilter !== 'All Courses'
                  ? 'Try adjusting your search or filter'
                  : 'Start connecting with classmates to build your network'}
              </p>
            </div>
          )}
        </div>
      )}
      {/* This section will show pending requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests
              .filter((request) =>
                request.name.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((request) => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <img
                      src={request.avatar}
                      alt={request.name}
                      className="h-12 w-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-semibold">{request.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.major}, {request.year}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Course: {request.course}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-full">
                      <CheckIcon size={18} />
                    </button>
                    <button className="p-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full">
                      <XIcon size={18} />
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-10">
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <UserPlusIcon size={40} className="text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No pending requests
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                You don't have any connection requests at the moment
              </p>
            </div>
          )}
        </div>
      )}
      {/* This section will recommend connections to the user */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((person) => (
              <div
                key={person.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="h-12 w-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{person.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {person.major}, {person.year}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {person.mutualConnections} mutual connection
                        {person.mutualConnections !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Courses:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {person.courses.map((course, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-xs"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      <PlusIcon size={16} className="mr-2" />
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <UserPlusIcon size={40} className="text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                No suggestions found
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default Connections
