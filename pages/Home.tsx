import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BookOpenIcon, UsersIcon, MessageCircleIcon, CheckIcon, XIcon } from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5082/api'

interface CourseChat {
  id: number
  courseName: string
  lastMessage: string
  lastMessageSender: string
  lastMessageTime: string
  participantCount: number
}

interface PrivateChat {
  id: number
  otherUserName: string
  otherUserAvatar: string
  lastMessage: string
  lastMessageTime: string
  isRead: boolean
}

interface ConnectionRequest {
  id: number
  name: string
  major: string
  year: string
  avatar: string
  course: string
}

const Home = () => {
  const [courseChats, setCourseChats] = useState<CourseChat[]>([])
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([])
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([])
  const [loading, setLoading] = useState(true)

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}')
  const userId = currentUser.id
  const userName = currentUser.name || 'User'

  // Fetch recent course chats
  const fetchCourseChats = useCallback(async () => {
    try {
      console.log('🔄 Fetching recent course chats...')
      const res = await axios.get(`${API_BASE_URL}/Dashboard/recent-course-chats/${userId}`)
      
      const courseChatsData = res.data.map((chat: any) => ({
        id: chat.id,
        courseName: chat.courseName,
        lastMessage: chat.lastMessage,
        lastMessageSender: chat.lastMessageSender,
        lastMessageTime: chat.lastMessageTime ? formatTimeAgo(chat.lastMessageTime) : '',
        participantCount: chat.participantCount
      }))

      setCourseChats(courseChatsData)
      console.log(`✅ Loaded ${courseChatsData.length} recent course chats`)
    } catch (err) {
      console.error('❌ Error fetching recent course chats:', err)
      setCourseChats([])
    }
  }, [userId])

  // Fetch recent private chats
  const fetchPrivateChats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Chat/user/${userId}`)
      const chats = res.data

      const privateChatsData: PrivateChat[] = await Promise.all(
        chats.slice(0, 3).map(async (chat: any) => {
          try {
            const messagesRes = await axios.get(`${API_BASE_URL}/Chat/${chat.id}/messages`)
            const messages = messagesRes.data

            const otherUser = chat.user1Id === userId ? chat.user2 : chat.user1
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

            return {
              id: chat.id,
              otherUserName: otherUser.name,
              otherUserAvatar: otherUser.profilePictureUrl || '/default-avatar.png',
              lastMessage: lastMessage ? lastMessage.content : 'No messages yet',
              lastMessageTime: lastMessage ? formatTimeAgo(lastMessage.createdAt) : '',
              isRead: true // You can implement read status later
            }
          } catch (err) {
            console.error(`Error fetching messages for chat ${chat.id}:`, err)
            return null
          }
        })
      )

      setPrivateChats(privateChatsData.filter(Boolean))
    } catch (err) {
      console.error('Error fetching private chats:', err)
      setPrivateChats([])
    }
  }, [userId])

  // Fetch connection requests
  const fetchConnectionRequests = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Connection/pending/${userId}`)
      setConnectionRequests(res.data.slice(0, 3))
    } catch (err) {
      console.error('Error fetching connection requests:', err)
      setConnectionRequests([])
    }
  }, [userId])

  // Handle accepting connection request
  const handleAcceptRequest = async (requestId: number) => {
    try {
      await axios.post(`${API_BASE_URL}/Connection/requests/${requestId}/accept`)
      // Remove the accepted request from the list
      setConnectionRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (err) {
      console.error('Error accepting connection request:', err)
      alert('Failed to accept connection request')
    }
  }

  // Handle rejecting connection request
  const handleRejectRequest = async (requestId: number) => {
    try {
      await axios.post(`${API_BASE_URL}/Connection/requests/${requestId}/reject`)
      // Remove the rejected request from the list
      setConnectionRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (err) {
      console.error('Error rejecting connection request:', err)
      alert('Failed to reject connection request')
    }
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      if (!userId) return
      
      setLoading(true)
      await Promise.all([
        fetchCourseChats(),
        fetchPrivateChats(),
        fetchConnectionRequests()
      ])
      setLoading(false)
    }

    fetchAllData()
  }, [userId, fetchCourseChats, fetchPrivateChats, fetchConnectionRequests])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h1>
        <p className="opacity-90">
          Connect with classmates, discuss course material, and stay on top of
          your studies.
        </p>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Course Chats */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <BookOpenIcon size={18} className="mr-2 text-blue-500" />
              Recent Course Chats
            </h2>
            <Link
              to="/chat"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          {courseChats.length > 0 ? (
            <div className="space-y-4">
              {courseChats.map((chat) => (
                <Link
                  key={chat.id}
                  to={`/chat?type=course&courseId=${chat.id}`}
                  className="block border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {chat.courseName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {chat.lastMessageSender && (
                          <span className="font-medium">{chat.lastMessageSender}: </span>
                        )}
                        {chat.lastMessage}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {chat.participantCount} participants
                      </p>
                    </div>
                    {chat.lastMessageTime && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {chat.lastMessageTime}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No course chats available. Join a course to start chatting!
            </p>
          )}
        </section>

        {/* Recent Private Chats */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageCircleIcon size={18} className="mr-2 text-green-500" />
              Recent Private Chats
            </h2>
            <Link
              to="/chat"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>
          {privateChats.length > 0 ? (
            <div className="space-y-4">
              {privateChats.map((chat) => (
                <Link
                  key={chat.id}
                  to={`/chat?type=private&chatId=${chat.id}`}
                  className="block border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={chat.otherUserAvatar}
                      alt={chat.otherUserName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {chat.otherUserName}
                        </p>
                        {chat.lastMessageTime && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {chat.lastMessageTime}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No private chats yet. Connect with classmates to start chatting!
            </p>
          )}
        </section>

        {/* Connection Requests */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <UsersIcon size={18} className="mr-2 text-purple-500" />
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
                  className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={request.avatar || '/default-avatar.png'}
                      alt={request.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {request.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.major} • {request.year}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {request.course}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex items-center px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                        >
                          <CheckIcon size={12} className="mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="flex items-center px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                        >
                          <XIcon size={12} className="mr-1" />
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No pending connection requests. Check back later!
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

export default Home
