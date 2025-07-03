import { Link } from 'react-router-dom'
import { BookOpenIcon, UsersIcon, MessageCircleIcon } from 'lucide-react'
const Home = () => {
    // basically a timetable for the user
  const upcomingClasses = [
    {
      id: 1,
      name: 'Introduction to Computer Science',
      time: '10:00 AM',
      location: 'Hall A',
    },
    {
      id: 2,
      name: 'Calculus II',
      time: '1:30 PM',
      location: 'Math Building 101',
    },
  ]
  // shows chats
  const recentMessages = [
    {
      id: 1,
      course: 'Data Structures',
      sender: 'Emma Watson',
      preview: 'Has anyone started the assignment yet?',
      time: '2 hours ago',
    },
    {
      id: 2,
      course: 'Physics 101',
      sender: 'James Smith',
      preview: "I'm confused about the third problem...",
      time: '5 hours ago',
    },
  ]
  // shows connection requests
  const connectionRequests = [
    {
      id: 1,
      name: 'John Doe',
      course: 'Introduction to Computer Science',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
    {
      id: 2,
      name: 'Jane Smith',
      course: 'Calculus II',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    },
  ]
  return (
    // this div is a basic welcome message
    <div className="space-y-6">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Alex!</h1>
        <p className="opacity-90">
          Connect with classmates, discuss course material, and stay on top of
          your studies.
        </p>
      </section>
      {/* This section is basically for the timetable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <BookOpenIcon size={18} className="mr-2 text-blue-500" />
              Today's Classes
            </h2>
            <Link
              to="/courses"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          {upcomingClasses.length > 0 ? (
            <div className="space-y-3">
              {upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="border-l-4 border-blue-500 pl-3 py-2"
                >
                  <p className="font-medium">{cls.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cls.time} • {cls.location}
                  </p>
                </div>
              ))}
            </div>
            // if user hasn't scheduled any classes for today
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No classes scheduled for today.
            </p>
          )}
        </section>
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageCircleIcon size={18} className="mr-2 text-blue-500" />
              Recent Messages
            </h2>
            <Link
              to="/chat"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          {recentMessages.length > 0 ? (
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between">
                    <p className="font-medium">{message.course}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {message.time}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{message.sender}:</span>{' '}
                    {message.preview}
                  </p>
                </div>
              ))}
            </div>
            // if there are no recent messages
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No recent messages.
            </p>
          )}
        </section>
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <UsersIcon size={18} className="mr-2 text-blue-500" />
              Connection Requests
            </h2>
            <Link
              to="/connections"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          {connectionRequests.length > 0 ? (
            <div className="space-y-4">
              {connectionRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <img
                      src={request.avatar}
                      alt={request.name}
                      className="h-10 w-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {request.course}
                      </p>
                    </div>
                  </div>
                  {/* Provides ability to accept / decline connection requets. */}
                  <div className="flex space-x-2">
                    <button className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded">
                      Accept
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
            // if there are no connection requests
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No pending connection requests.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
export default Home
