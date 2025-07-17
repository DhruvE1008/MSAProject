import { useEffect, useState } from 'react'
import axios from 'axios'
import { BookOpenIcon, EditIcon, XIcon } from 'lucide-react'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { API_ENDPOINTS } from '../config/api'

interface Course {
  id: number
  code: string
  name: string
}

// JSON API converts PascalCase to camelCase, so we use camelCase here
interface ProfileData {
  id: number
  name: string
  bio: string
  enrolledCourses: Course[]
  year: string
  major: string
  profilePictureUrl: string
}

const Profile = () => {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const userId = currentUser.id;
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)

  // Use toast hook
  const { toasts, showSuccess, showError, hideToast } = useToast()

  const years = ["First Year", "Second Year", "Third Year", "Fourth Year", "PostGraduate"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await axios.get(`${API_ENDPOINTS.users}/${userId}`)
        const courseRes = await axios.get(API_ENDPOINTS.courses)
        setProfile(profileRes.data)
        setAllCourses(courseRes.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load profile")
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!profile) return
    const { name, value } = e.target
    setProfile({ ...profile, [name]: value })
  }

  const handleSave = () => {
    if (!profile) return
    axios.put(`${API_ENDPOINTS.users}/${userId}`, {
      id: profile.id,
      name: profile.name,
      bio: profile.bio,
      year: profile.year,
      major: profile.major,
    })
      .then(() => {
        showSuccess("Profile updated successfully!")
        setIsEditing(false)
      })
      .catch(() => showError("Failed to update profile"))
  }

  // allows the user to enroll in a course
  // it adds the course to the user's enrolled courses
  // and updates the profile state
  const handleEnroll = async () => {
    if (!selectedCourseId || !profile) return

    try {
      await axios.post(`${API_ENDPOINTS.users}/${userId}/enroll/${selectedCourseId}`)
      const courseToAdd = allCourses.find(c => c.id === selectedCourseId)
      if (courseToAdd) {
        setProfile({
          ...profile,
          enrolledCourses: [...profile.enrolledCourses, courseToAdd]
        })
        showSuccess(`Successfully enrolled in ${courseToAdd.name}!`)
      }
      setSelectedCourseId(null)
    } catch (err: any) {
      console.error(err)
      showError("Failed to enroll in course")
    }
  }

  // allows the user to unenroll from a course
  // it removes the course from the user's enrolled courses
  // and updates the profile state
  const handleUnenroll = async (courseId: number) => {
    if (!profile) return
    
    const courseToRemove = profile.enrolledCourses.find(c => c.id === courseId)
    
    try {
      await axios.delete(`${API_ENDPOINTS.users}/${userId}/unenroll/${courseId}`)
      setProfile({
        ...profile,
        enrolledCourses: profile.enrolledCourses.filter(c => c.id !== courseId)
      })
      showSuccess(`Successfully removed ${courseToRemove?.name || 'course'}`)
    } catch (err: any) {
      console.error(err)
      showError("Failed to remove course")
    }
  }

  const unenrolledCourses = allCourses.filter(
    c => !profile?.enrolledCourses.some(ec => ec.id === c.id)
  )

  if (loading) return <p className="text-center mt-10">Loading...</p>
  if (error || !profile) return <p className="text-center text-red-600 mt-10">{error}</p>

  return (
    <div className="max-w-4xl mx-auto">
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-blue-400 to-blue-600">
          <div className="absolute -bottom-12 left-6">
            <img
              src={profile.profilePictureUrl}
              alt="Profile"
              className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800"
            />
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 bg-white dark:bg-gray-700 p-2 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <EditIcon size={16} />
          </button>
        </div>

        <div className="pt-16 pb-8 px-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                <select
                  name="year"
                  value={profile.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Major</label>
                <input
                  type="text"
                  name="major"
                  value={profile.major}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {profile.year} | Major: {profile.major}
              </p>
              <p className="mt-4 text-gray-700 dark:text-gray-300">{profile.bio}</p>
            </>
          )}
        </div>
      </div>

      {/* Courses Section */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4 pb-2">
          <h2 className="text-lg font-semibold flex items-center">
            <BookOpenIcon size={18} className="mr-2 text-blue-500" />
            My Courses
          </h2>
          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            <div className="flex flex-col w-full gap-2 sm:flex-row">
              <select
                value={selectedCourseId || ''}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                className="w-full sm:flex-1 px-2 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Course</option>
                {unenrolledCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
              <button
                onClick={handleEnroll}
                disabled={!selectedCourseId}
                className="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ whiteSpace: 'nowrap' }}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {profile.enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="border rounded-lg p-4 relative group hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700"
              >
                <p className="font-semibold">{course.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{course.code}</p>
                <button
                  onClick={() => handleUnenroll(course.id)}
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700"
                  title="Remove course"
                >
                  <XIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpenIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No courses enrolled yet. Add your first course above!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
