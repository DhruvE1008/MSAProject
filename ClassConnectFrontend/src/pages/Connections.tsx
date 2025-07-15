// src/components/Connections.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'
import axios from 'axios'
import {
  SearchIcon,
  FilterIcon,
  UserPlusIcon,
  CheckIcon,
  XIcon,
  MessageCircle,
} from 'lucide-react'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const API_BASE_URL = 'http://localhost:5082/api'

interface Connection {
  id: number
  userId: number
  name: string
  major: string
  year: string
  avatar: string
  courses: string[]
}

interface Request {
  id: number
  name: string
  major: string
  year: string
  avatar: string
  course: string
}

interface Suggestion {
  id: number
  name: string
  major: string
  year: string
  avatar: string
  courses: string[]
  mutualConnections: number
}

const Connections = () => {
  const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'discover'>('connections')
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('All Courses')

  const [connections, setConnections] = useState<Connection[]>([])
  const [pendingRequests, setPendingRequests] = useState<Request[]>([])
  const [suggestedConnections, setSuggestedConnections] = useState<Suggestion[]>([])
  const [userCourses, setUserCourses] = useState<string[]>([])
  const [allCourses, setAllCourses] = useState<string[]>(['All Courses'])
  const [outgoingRequestIds, setOutgoingRequestIds] = useState<Set<number>>(new Set())

  const connectionRef = useRef<signalR.HubConnection | null>(null)

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}')
  const userId = currentUser.id

  // Use toast hook
  const { toasts, showSuccess, showError, hideToast } = useToast()

  // --- Data fetching functions ---
  const fetchUserCourses = useCallback(async () => {
    if (!userId) return
    try {
      const res = await axios.get(`${API_BASE_URL}/courses/user/${userId}`)
      const courseNames = res.data.map((course: any) => course.name || course.Name)
      setUserCourses(courseNames)
      setAllCourses(['All Courses', ...courseNames])
    } catch (err) {
      console.error('Error fetching user courses:', err)
    }
  }, [userId])

  const fetchConnections = useCallback(async () => {
    if (!userId) return
    try {
      console.log('🔄 Fetching connections...')
      const res = await axios.get(`${API_BASE_URL}/Connection/accepted/${userId}`)
      setConnections(res.data || [])
      console.log(`✅ Loaded ${res.data?.length || 0} connections`)
    } catch (err) {
      console.error('❌ Error fetching connections:', err)
      setConnections([])
    }
  }, [userId])

  const fetchRequests = useCallback(async () => {
    if (!userId) return
    try {
      console.log('🔄 Fetching requests for user:', userId)
      const res = await axios.get(`${API_BASE_URL}/Connection/pending/${userId}`)
      console.log('📥 Received requests data:', res.data)
      setPendingRequests(res.data || [])
      console.log(`✅ Loaded ${res.data?.length || 0} pending requests`)
    } catch (err) {
      console.error('❌ Error fetching requests:', err)
      setPendingRequests([])
    }
  }, [userId])

  const fetchSuggestions = useCallback(async () => {
    if (!userId) return
    try {
      console.log('🔄 Fetching suggestions...')
      const res = await axios.get(`${API_BASE_URL}/Connection/suggestions/${userId}`)
      setSuggestedConnections(res.data || [])
      console.log(`✅ Loaded ${res.data?.length || 0} suggestions`)
    } catch (err) {
      console.error('❌ Error fetching suggestions:', err)
      setSuggestedConnections([])
    }
  }, [userId])

  const fetchOutgoingRequests = useCallback(async () => {
    if (!userId) return
    try {
      console.log('🔄 Fetching outgoing requests...')
      const res = await axios.get(`${API_BASE_URL}/Connection/outgoing/${userId}`)
      setOutgoingRequestIds(new Set(res.data.map((req: any) => req.ReceiverId)))
      console.log(`✅ Loaded ${res.data?.length || 0} outgoing requests`)
    } catch (err: any) {
      console.error('❌ Error fetching outgoing requests:', err)
      setOutgoingRequestIds(new Set())
    }
  }, [userId])

  // --- WebSocket setup ---
  useEffect(() => {
    if (!userId) return

    let isConnected = false
    let connectionInstance: signalR.HubConnection | null = null

    const setupConnection = async () => {
      // Always fetch data first
      console.log('🔄 Fetching initial data...')
      try {
        await Promise.all([
          fetchUserCourses(),
          fetchConnections(),
          fetchRequests(),
          fetchSuggestions(),
          fetchOutgoingRequests()
        ])
        console.log('✅ Initial data loaded successfully')
      } catch (err) {
        console.error('❌ Error loading initial data:', err)
      }

      // Setup SignalR
      const connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5082/connectionHub')
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .build()

      connectionRef.current = connection
      connectionInstance = connection

      // Handle connection request received (for requests page)
      connection.on('ConnectionRequestReceived', (data) => {
        console.log('📬 Connection request received:', data)
        fetchRequests() // This should update the requests page immediately
        fetchSuggestions()
      })

      // Handle connection request sent (for discover page)
      connection.on('ConnectionRequestSent', (data) => {
        console.log('📤 Connection request sent:', data)
        fetchOutgoingRequests()
        fetchSuggestions()
      })

      // Handle connection accepted (for all pages)
      connection.on('ConnectionAccepted', (data) => {
        console.log('✅ Connection accepted:', data)
        fetchConnections()
        fetchRequests()
        fetchOutgoingRequests()
        fetchSuggestions()
      })

      // Handle connection rejected (for all pages)
      connection.on('ConnectionRejected', (data) => {
        console.log('❌ Connection rejected:', data)
        fetchRequests()
        fetchOutgoingRequests()
        fetchSuggestions()
      })

      // Handle connection removed (for connections page)
      connection.on('ConnectionRemoved', (data) => {
        console.log('🗑️ Connection removed:', data)
        fetchConnections()
        fetchSuggestions()
      })

      connection.onreconnecting(() => {
        console.log('🔄 SignalR reconnecting...')
        isConnected = false
      })

      connection.onreconnected(() => {
        console.log('🔄 SignalR reconnected!')
        isConnected = true
        // Refresh all data after reconnection
        fetchConnections()
        fetchRequests()
        fetchSuggestions()
        fetchOutgoingRequests()
      })

      connection.onclose(() => {
        console.log('❌ SignalR connection closed')
        isConnected = false
      })

      try {
        await connection.start()
        console.log('✅ SignalR Connected')
        isConnected = true
        
        // Join user group for targeted notifications
        await connection.invoke('JoinUserGroup', userId.toString())
        console.log(`✅ Joined user group: User_${userId}`)
      } catch (err) {
        console.error('❌ SignalR connection error:', err)
        isConnected = false
      }
    }

    setupConnection()

    return () => {
      if (connectionInstance) {
        if (isConnected) {
          connectionInstance.invoke('LeaveUserGroup', userId.toString()).catch(console.error)
        }
        connectionInstance.stop().catch(console.error)
        connectionRef.current = null
      }
    }
  }, [userId]) // Only depend on userId to avoid infinite loops

  // --- Action handlers ---
  const handleAcceptRequest = async (id: number) => {
    try {
      const request = pendingRequests.find(req => req.id === id)
      await axios.post(`${API_BASE_URL}/Connection/requests/${id}/accept`)
      showSuccess(`Connection request from ${request?.name || 'user'} accepted!`)
      // UI will update via SignalR event
    } catch (err) {
      console.error('Error accepting request:', err)
      showError('Failed to accept connection request')
    }
  }

  const handleRejectRequest = async (id: number) => {
    try {
      const request = pendingRequests.find(req => req.id === id)
      await axios.post(`${API_BASE_URL}/Connection/requests/${id}/reject`)
      showSuccess(`Connection request from ${request?.name || 'user'} declined`)
      // UI will update via SignalR event
    } catch (err) {
      console.error('Error rejecting request:', err)
      showError('Failed to reject connection request')
    }
  }

  const handleRemoveConnection = async (connectionId: number) => {
    try {
      console.log(`🗑️ Removing connection ${connectionId}...`)
      const connection = connections.find(conn => conn.id === connectionId)
      await axios.delete(`${API_BASE_URL}/Connection/${connectionId}?userId=${userId}`)
      console.log(`✅ Connection ${connectionId} removed successfully`)
      showSuccess(`Connection with ${connection?.name || 'user'} removed`)
      // UI will update via SignalR event
    } catch (err: any) {
      console.error('❌ Error removing connection:', err)
      if (err.response?.status === 404) {
        showError('Connection not found or already removed')
      } else {
        showError('Failed to remove connection')
      }
    }
  }

  const handleConnect = async (receiverId: number) => {
    setOutgoingRequestIds(prev => new Set(prev).add(receiverId)) // Optimistic update
    try {
      const suggestion = suggestedConnections.find(sugg => sugg.id === receiverId)
      await axios.post(`${API_BASE_URL}/Connection/request`, {
        requesterId: userId,
        receiverId,
      })
      showSuccess(`Connection request sent to ${suggestion?.name || 'user'}!`)
      // UI will update via SignalR event
    } catch (err: any) {
      setOutgoingRequestIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(receiverId)
        return newSet
      })
      console.error('Error sending connection request:', err)
      if (err.response?.data?.includes('already exists')) {
        showError('Connection already exists or request already sent')
      } else {
        showError('Failed to send connection request')
      }
    }
  }

  // --- Filtering ---
  const filterConnections = (list: (Connection | Suggestion)[]) => {
    return list.filter((conn) => {
      const matchesSearch = conn.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCourse = courseFilter === 'All Courses' ||
        (conn.courses && conn.courses.includes(courseFilter))
      return matchesSearch && matchesCourse
    })
  }

  const filteredConnections = filterConnections(connections) as Connection[]
  const filteredSuggestions = filterConnections(suggestedConnections) as Suggestion[]
  const filteredRequests = pendingRequests.filter((req) =>
    req.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
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

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Connections</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {['connections', 'requests', 'discover'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'connections' | 'requests' | 'discover')}
              className={`py-2 px-4 transition-colors duration-200 ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'connections' ? 'My Connections' : tab === 'requests' ? 'Requests' : 'Discover'}
              {tab === 'requests' && pendingRequests.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-gray-100 
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     dark:focus:ring-blue-400 
                     transition-colors duration-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon size={20} className="text-gray-400 dark:text-gray-500" />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                     bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     dark:focus:ring-blue-400 
                     transition-colors duration-200"
          >
            {allCourses.map(course => (
              <option key={course} value={course} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'connections' && (
        <ConnectionList connections={filteredConnections} onRemove={handleRemoveConnection} showError={showError} />
      )}
      {activeTab === 'requests' && (
        <RequestList requests={filteredRequests} onAccept={handleAcceptRequest} onReject={handleRejectRequest} />
      )}
      {activeTab === 'discover' && (
        <SuggestionList suggestions={filteredSuggestions} onConnect={handleConnect} outgoingRequestIds={outgoingRequestIds} />
      )}
    </div>
  )
}

const ConnectionList = ({ connections, onRemove, showError }: { connections: Connection[]; onRemove: (id: number) => void; showError: (message: string) => void }) => {
  const handleStartChat = async (connectionId: number, otherUserId: number) => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}')
    try {
      const response = await axios.post(`${API_BASE_URL}/Chat/create`, {
        user1Id: currentUser.id,
        user2Id: otherUserId
      })
      const chatId = response.data.chatId
      setTimeout(() => {
        window.location.href = `/chat?type=private&chatId=${chatId}`
      }, 100)
    } catch (err: any) {
      console.error('Error starting chat:', err)
      showError(`Failed to start chat: ${err.response?.data || err.message}`)
    }
  }

  if (!connections.length) return <EmptyState message="No connections found." />

  return (
    <ul className="space-y-4">
      {connections.map((conn) => (
        <li key={conn.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow-md dark:shadow-gray-700">
          <div className="flex items-center gap-4">
            <img src={conn.avatar || '/default-avatar.png'} alt={conn.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{conn.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{conn.major} • {conn.year}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{conn.courses?.join(', ')}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (conn.userId) {
                  handleStartChat(conn.id, conn.userId)
                } else {
                  showError('Cannot start chat: user ID is missing.')
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors duration-200"
            >
              <MessageCircle size={16} /> Chat
            </button>
            <button
              onClick={() => onRemove(conn.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors duration-200"
            >
              <XIcon size={16} /> Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

const RequestList = ({ requests, onAccept, onReject }: { requests: Request[]; onAccept: (id: number) => void; onReject: (id: number) => void }) => {
  if (!requests.length) return <EmptyState message="No pending requests." />

  return (
    <ul className="space-y-4">
      {requests.map((req) => (
        <li key={req.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow-md dark:shadow-gray-700">
          <div className="flex items-center gap-4">
            <img src={req.avatar || '/default-avatar.png'} alt={req.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{req.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{req.major} • {req.year}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{req.course}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAccept(req.id)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors duration-200"
            >
              <CheckIcon size={16} /> Accept
            </button>
            <button
              onClick={() => onReject(req.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors duration-200"
            >
              <XIcon size={16} /> Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

const SuggestionList = ({ suggestions, onConnect, outgoingRequestIds }: { suggestions: Suggestion[]; onConnect: (id: number) => void; outgoingRequestIds: Set<number> }) => {
  if (!suggestions.length) return <EmptyState message="No suggestions found." />

  return (
    <ul className="space-y-4">
      {suggestions.map((sugg) => (
        <li key={sugg.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow-md dark:shadow-gray-700">
          <div className="flex items-center gap-4">
            <img src={sugg.avatar || '/default-avatar.png'} alt={sugg.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{sugg.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{sugg.major} • {sugg.year}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{sugg.courses?.join(', ')}</div>
              <div className="text-xs text-blue-500 dark:text-blue-400">{sugg.mutualConnections} mutual connections</div>
            </div>
          </div>
          {outgoingRequestIds.has(sugg.id) ? (
            <button
              disabled
              className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1 cursor-not-allowed"
            >
              Pending
            </button>
          ) : (
            <button
              onClick={() => onConnect(sugg.id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors duration-200"
            >
              <UserPlusIcon size={16} /> Connect
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
    {message}
  </div>
)

export default Connections
