import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  SearchIcon,
  FilterIcon,
  UsersIcon,
  MessageCircleIcon,
} from 'lucide-react'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { API_ENDPOINTS } from '../config/api'

interface Course {
  id: number;
  code: string;
  name: string;
  department: string;
  professor: string;
  description: string;
  studentCount: number;
  studentIds?: number[];
}

const departments = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology']

const Courses = () => {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const userId = currentUser.id;
  const isAdmin = userId === 38; // <-- Admin check
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null)
  const [editCourseData, setEditCourseData] = useState<Partial<Course>>({})
  const [newCourse, setNewCourse] = useState({
    code: '',
    name: '',
    department: departments[1],
    professor: '',
    description: '',
  })

  // Use toast hook
  const { toasts, showSuccess, showError, hideToast } = useToast()

  useEffect(() => {
    // Fetch all courses
    axios.get<Course[]>(API_ENDPOINTS.courses)
      .then(res => setCourses(res.data))
      .catch(err => console.error("Failed to fetch courses", err))

    // Fetch enrolled courses for the user
    axios.get<Course[]>(`${API_ENDPOINTS.courses}/user/${userId}`)
      .then(res => setEnrolledCourses(res.data))
      .catch(err => console.error("Failed to fetch user's enrolled courses", err))
  }, [userId])

  const handleRemoveCourse = (courseId: number) => {
    axios.delete(`${API_ENDPOINTS.courses}/${courseId}`)
      .then(() => {
        showSuccess('Course removed successfully!')
        setCourses(prev => prev.filter(course => course.id !== courseId))
      })
      .catch((error) => {
        console.error('Delete error:', error.response?.data || error.message)
        showError('Failed to remove course')
      })
  }

  const handleCreateCourse = () => {
    axios.post(API_ENDPOINTS.courses, newCourse)
      .then(res => {
        showSuccess('Course created successfully!')
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
      .catch(() => showError('Failed to create course'))
  }

  const handleEditClick = (course: Course) => {
    setEditingCourseId(course.id)
    setEditCourseData(course)
  }

  const handleCancelEdit = () => {
    setEditingCourseId(null)
    setEditCourseData({})
  }

  const handleEditChange = (field: keyof Course, value: string) => {
    setEditCourseData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveEdit = async () => {
    if (!editingCourseId) return

    try {
      const updatedCourse = {
        ...editCourseData,
        id: editingCourseId,
      }
      await axios.put(`${API_ENDPOINTS.courses}/${editingCourseId}`, updatedCourse)
      showSuccess('Course updated successfully!')
      setCourses(prev =>
        prev.map(c => (c.id === editingCourseId ? (updatedCourse as Course) : c))
      )
      setEditingCourseId(null)
      setEditCourseData({})
    } catch (error) {
      showError('Failed to update course')
      console.error(error)
    }
  }

  // ENROLL/UNENROLL HANDLER
  const handleEnrollToggle = async (courseId: number, isEnrolled: boolean) => {
    try {
      if (isEnrolled) {
        await axios.delete(`${API_ENDPOINTS.users}/${userId}/unenroll/${courseId}`);
        showSuccess('Unenrolled from course!');
      } else {
        await axios.post(`${API_ENDPOINTS.users}/${userId}/enroll/${courseId}`);
        showSuccess('Enrolled in course!');
      }
      // Refresh enrolled courses
      const res = await axios.get<Course[]>(`${API_ENDPOINTS.courses}/user/${userId}`);
      setEnrolledCourses(res.data);
    } catch {
      showError('Failed to update enrollment');
    }
  };

  // ✅ Filtered course lists (with enrollment separation)
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment =
      selectedDepartment === 'All' || course.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const enrolledCourseIds = new Set(enrolledCourses.map(c => c.id))

  const userCourses = filteredCourses.filter(course =>
    enrolledCourseIds.has(course.id)
  )

  const otherCourses = filteredCourses.filter(course =>
    !enrolledCourseIds.has(course.id)
  )

  const renderCourseCard = (course: Course, showChat: boolean = false) => {
    const isEnrolled = enrolledCourses.some(c => c.id === course.id);

    return (
      <div
        key={course.id}
        className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition-shadow"
      >
        <div className="p-6">
          {editingCourseId === course.id ? (
            <>
              <input
                type="text"
                value={editCourseData.code || ''}
                onChange={e => handleEditChange('code', e.target.value)}
                className="w-full mb-2 px-3 py-2 border rounded-md dark:bg-gray-700"
                placeholder="Course Code"
              />
              <input
                type="text"
                value={editCourseData.name || ''}
                onChange={e => handleEditChange('name', e.target.value)}
                className="w-full mb-2 px-3 py-2 border rounded-md dark:bg-gray-700"
                placeholder="Course Name"
              />
              <select
                value={editCourseData.department || departments[1]}
                onChange={e => handleEditChange('department', e.target.value)}
                className="w-full mb-2 px-3 py-2 border rounded-md dark:bg-gray-700"
              >
                {departments.slice(1).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <input
                type="text"
                value={editCourseData.professor || ''}
                onChange={e => handleEditChange('professor', e.target.value)}
                className="w-full mb-2 px-3 py-2 border rounded-md dark:bg-gray-700"
                placeholder="Professor"
              />
              <textarea
                value={editCourseData.description || ''}
                onChange={e => handleEditChange('description', e.target.value)}
                className="w-full mb-2 px-3 py-2 border rounded-md dark:bg-gray-700"
                placeholder="Description"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">{course.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {course.code} • {course.department}
              </p>
              <p className="text-sm mt-2">{course.description}</p>
              <p className="text-sm font-medium mt-2">Instructor: {course.professor}</p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <UsersIcon size={16} className="mr-1" />
                  {course.studentCount} students enrolled
                </div>
                <div className="flex space-x-2">
                  {/* Chat button for enrolled users */}
                  {showChat && (
                    <Link
                      to={`/chat/${course.id}`}
                      className="px-3 py-1 text-sm rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200"
                    >
                      <MessageCircleIcon size={16} className="mr-1 inline" />
                      Chat
                    </Link>
                  )}

                  {/* Admin controls */}
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => handleEditClick(course)}
                        className="px-3 py-1 text-sm border border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveCourse(course.id)}
                        className="px-3 py-1 text-sm border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    // Enroll/Unenroll button for non-admins
                    <button
                      onClick={() => handleEnrollToggle(course.id, isEnrolled)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        isEnrolled
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isEnrolled ? 'Unenroll' : 'Enroll'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 min-h-screen p-6 text-gray-900 dark:text-white">
      {/* Toast Container */}
      <div className="fixed top-0 right-0 z-50 space-y-2 p-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>

      <h1 className="text-2xl font-bold">Browse Courses</h1>

      {/* 🔍 Filter Section */}
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
            className="block w-full pl-10 pr-3 py-2 border rounded-md dark:bg-gray-800"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FilterIcon size={18} className="text-gray-400" />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border rounded-md dark:bg-gray-800"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ➕ Create Course UI (admin only) */}
      {isAdmin && (
        <div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 mb-4 bg-green-600 text-white rounded-md"
          >
            {showCreateForm ? 'Cancel' : 'Add New Course'}
          </button>
          {showCreateForm && (
            // the form to create a new course
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
      )}

      {/* ✅ Your Courses Section */}
      {userCourses.length > 0 && (
        <>
          <h2 className="text-xl font-semibold">Your Courses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userCourses.map(course => renderCourseCard(course, true))}
          </div>
        </>
      )}

      {/* ✅ Other Courses Section */}
      {otherCourses.length > 0 && (
        <>
          <h2 className="text-xl font-semibold pt-6">Other Courses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {otherCourses.map(course => renderCourseCard(course))}
          </div>
        </>
      )}

      {/* No Results */}
      {userCourses.length === 0 && otherCourses.length === 0 && (
        <p className="text-center text-gray-500 pt-10">No courses found.</p>
      )}
    </div>
  )
}

export default Courses
