import { useState } from 'react'
import {
  BookOpenIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  MapPinIcon,
  EditIcon,
} from 'lucide-react'
const Profile = () => {
    // allows user to edit their profile information
  const [isEditing, setIsEditing] = useState(false)
  // when the user clicks the save button, the profile information is updated
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    major: 'Computer Science',
    year: 'Junior',
    university: 'State University',
    location: 'San Francisco, CA',
    bio: 'CS student passionate about web development and AI. Looking for study partners for advanced algorithms and database courses.',
    interests: [
      'Web Development',
      'Artificial Intelligence',
      'Data Science',
      'Mobile Apps',
    ],
    courses: [
      {
        id: 1,
        code: 'CS 301',
        name: 'Data Structures and Algorithms',
      },
      {
        id: 2,
        code: 'CS 315',
        name: 'Database Systems',
      },
      {
        id: 3,
        code: 'MATH 251',
        name: 'Discrete Mathematics',
      },
      {
        id: 4,
        code: 'CS 350',
        name: 'Web Development',
      },
    ],
  })
  const handleSave = () => {
    setIsEditing(false)
    // In a real app, you would save changes to a backend here
  }
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {/* Cover and Profile Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-400 to-blue-600">
          <div className="absolute -bottom-12 left-6">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profile"
              className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800"
            />
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-4 right-4 bg-white dark:bg-gray-700 p-2 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <EditIcon size={16} />
          </button>
        </div>
        {/* Profile Info */}
        <div className="pt-16 pb-8 px-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  // on change, the profile name is updated
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Major
                  </label>
                  <input
                    type="text"
                    value={profile.major}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        major: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <select
                    value={profile.year}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        year: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"
                  >
                    <option>Freshman</option>
                    <option>Sophomore</option>
                    <option>Junior</option>
                    <option>Senior</option>
                    <option>Graduate</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      bio: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <div className="flex flex-wrap items-center gap-y-2 mt-2 text-gray-600 dark:text-gray-300">
                <div className="flex items-center mr-4">
                  <GraduationCapIcon size={16} className="mr-1" />
                  <span>
                    {profile.major}, {profile.year}
                  </span>
                </div>
                <div className="flex items-center mr-4">
                  <BriefcaseIcon size={16} className="mr-1" />
                  <span>{profile.university}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon size={16} className="mr-1" />
                  <span>{profile.location}</span>
                </div>
              </div>
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                {profile.bio}
              </p>
              <div className="mt-4">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  Interests
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Courses Section */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <BookOpenIcon size={18} className="mr-2 text-blue-500" />
            My Courses
          </h2>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Add Course
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.courses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <p className="font-semibold">{course.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {course.code}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default Profile
