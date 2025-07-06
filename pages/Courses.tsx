import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  SearchIcon,
  FilterIcon,
  UsersIcon,
  MessageCircleIcon,
} from 'lucide-react'

const userId = 3 // 🔐 Replace this with actual logged-in user ID

interface Course {
  id: number
  code: string
  name: string
  department: string
  professor: string
  students: number
  description: string
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const departments = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology']

  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    department: departments[1],
    professor: '',
    description: '',
  })

  useEffect(() => {
    axios.get<Course[]>('http://localhost:5082/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error("Failed to fetch courses", err))
  }, [])

  const handleRemoveCourse = (courseId: number) => {
    axios.delete(`http://localhost:5082/api/courses/${courseId}`)
      .then(() => {
        alert('Course removed successfully!')
        setCourses(prev => prev.filter(course => course.id !== courseId))
      })
      .catch((error) => {
        console.error('Delete error:', error.response?.data || error.message)
        alert('Failed to remove course')
      })
  }

  const handleCreateCourse = () => {
    axios.post('http://localhost:5082/api/courses', {
      ...newCourse,
      students: 0,
    })
      .then(res => {
        alert('Course created successfully!')
        setCourses(prev => [...prev, res.data])
        setShowCreateForm(false)
        setNewCourse({
          code: '',
          name: '',
          department: departments[1],
          professor: '',
          description: '',
        })
      })
      .catch(() => alert('Failed to create course'))
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment =
      selectedDepartment === 'All' || course.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 min-h-screen p-6 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold">Browse Courses</h1>

      {/* Search + Filter UI */}
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FilterIcon size={18} className="text-gray-400" />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create Course UI */}
      <div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 mb-4 bg-green-600 text-white rounded-md"
        >
          {showCreateForm ? 'Cancel' : 'Add New Course'}
        </button>

        {showCreateForm && (
          <div className="space-y-4 mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <input
              type="text"
              placeholder="Course Code"
              value={newCourse.code}
              onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
            />
            <input
              type="text"
              placeholder="Course Name"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <select
              value={newCourse.department}
              onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
            >
              {departments.slice(1).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Professor"
              value={newCourse.professor}
              onChange={(e) => setNewCourse({ ...newCourse, professor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <textarea
              placeholder="Description"
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <button
              onClick={handleCreateCourse}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Create Course
            </button>
          </div>
        )}
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold">{course.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {course.code} • {course.department}
                </p>
                <p className="text-sm mt-2">{course.description}</p>
                <p className="text-sm font-medium mt-2">Instructor: {course.professor}</p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <UsersIcon size={16} className="mr-1" />
                    {course.students} students enrolled
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/chat/${course.id}`}
                      className="px-3 py-1 text-sm rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200"
                    >
                      <MessageCircleIcon size={16} className="mr-1 inline" />
                      Chat
                    </Link>
                    <button
                      onClick={() => handleRemoveCourse(course.id)}
                      className="px-3 py-1 text-sm border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
            No courses found.
          </p>
        )}
      </div>
    </div>
  )
}

export default Courses
