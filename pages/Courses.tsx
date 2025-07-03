import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SearchIcon,
  FilterIcon,
  UsersIcon,
  MessageCircleIcon,
} from 'lucide-react'
const Courses = () => {
    // State for search term and selected department
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  // const departments and courses data
  const departments = [
    'All',
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
  ]
  const courses = [
    {
      id: 1,
      code: 'CS 301',
      name: 'Data Structures and Algorithms',
      department: 'Computer Science',
      professor: 'Dr. Alan Smith',
      students: 42,
      description:
        'This course covers fundamental data structures and algorithms including sorting, searching, and graph algorithms.',
    },
    {
      id: 2,
      code: 'MATH 251',
      name: 'Discrete Mathematics',
      department: 'Mathematics',
      professor: 'Dr. Rebecca Johnson',
      students: 38,
      description:
        'Introduction to discrete mathematical structures including sets, relations, functions, and graph theory.',
    },
    {
      id: 3,
      code: 'CS 315',
      name: 'Database Systems',
      department: 'Computer Science',
      professor: 'Dr. Michael Chen',
      students: 35,
      description:
        'Fundamentals of database design, query processing, and transaction management.',
    },
    {
      id: 4,
      code: 'PHYS 201',
      name: 'Electricity and Magnetism',
      department: 'Physics',
      professor: 'Dr. Sarah Williams',
      students: 30,
      description:
        'Principles of electricity and magnetism with applications to circuits and electromagnetic waves.',
    },
    {
      id: 5,
      code: 'CS 350',
      name: 'Web Development',
      department: 'Computer Science',
      professor: 'Dr. James Wilson',
      students: 45,
      description:
        'Modern web development techniques including HTML, CSS, JavaScript, and React.',
    },
  ]
  // Filter courses based on search term and selected department
  // will be case insensitive
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment =
      selectedDepartment === 'All' || course.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Browse Courses</h1>
      </div>
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FilterIcon size={18} className="text-gray-400" />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Course List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{course.name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {course.code} • {course.department}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {course.description}
                    </p>
                    <p className="text-sm font-medium mt-2">
                      Instructor: {course.professor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <UsersIcon size={16} className="mr-1" />
                    <span>{course.students} students enrolled</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/chat/${course.id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900/40 dark:hover:bg-blue-900/60"
                    >
                      <MessageCircleIcon size={16} className="mr-1" />
                      Chat
                    </Link>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                      <UsersIcon size={16} className="mr-1" />
                      Classmates
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
          // If no courses match the search criteria
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              No courses found matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
export default Courses
