// src/components/Connections.tsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  SearchIcon,
  FilterIcon,
  UserPlusIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react'

const API_BASE_URL = 'http://localhost:5082/api'

interface Connection {
  id: number
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

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}')
  const userId = currentUser.id

  useEffect(() => {
    if (!userId) return
    fetchUserCourses()
    fetchConnections()
    fetchRequests()
    fetchSuggestions()
  }, [userId])

  const fetchUserCourses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/courses/user/${userId}`)
      const courseNames = res.data.map((course: any) => course.name || course.Name)
      setUserCourses(courseNames)
      setAllCourses(['All Courses', ...courseNames])
    } catch (err) {
      console.error('Error fetching user courses:', err)
    }
  }

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Connection/accepted/${userId}`)
      setConnections(res.data)
    } catch (err) {
      console.error('Error fetching connections:', err)
    }
  }

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Connection/pending/${userId}`)
      setPendingRequests(res.data)
    } catch (err) {
      console.error('Error fetching requests:', err)
    }
  }

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Connection/suggestions/${userId}`)
      setSuggestedConnections(res.data)
    } catch (err) {
      console.error('Error fetching suggestions:', err)
    }
  }

  const handleAcceptRequest = async (id: number) => {
    try {
      await axios.post(`${API_BASE_URL}/Connection/requests/${id}/accept`)
      alert('Connection request accepted!')
      fetchRequests()
      fetchConnections()
      fetchSuggestions() // Refresh suggestions to remove the newly connected user
    } catch (err) {
      console.error('Error accepting request:', err)
      alert('Failed to accept connection request')
    }
  }

  const handleRejectRequest = async (id: number) => {
    try {
      await axios.post(`${API_BASE_URL}/Connection/requests/${id}/reject`)
      alert('Connection request rejected!')
      fetchRequests()
      fetchSuggestions() // Refresh suggestions to show the user again
    } catch (err) {
      console.error('Error rejecting request:', err)
      alert('Failed to reject connection request')
    }
  }

  const handleRemoveConnection = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/Connection/${id}`)
      alert('Connection removed successfully!')
      fetchConnections()
      fetchSuggestions() // Refresh suggestions to show the user again
    } catch (err) {
      console.error('Error removing connection:', err)
      alert('Failed to remove connection')
    }
  }

  const handleConnect = async (receiverId: number) => {
    try {
      await axios.post(`${API_BASE_URL}/Connection/request`, {
        requesterId: userId,
        receiverId,
      })
      alert('Connection request sent successfully!')
      fetchSuggestions()
      fetchRequests()
    } catch (err: any) {
      console.error('Error sending connection request:', err)
      if (err.response?.data?.includes('already exists')) {
        alert('Connection already exists or request already sent')
      } else {
        alert('Failed to send connection request')
      }
    }
  }

  const filterConnections = (list: (Connection | Suggestion)[]) => {
    return list.filter((conn) => {
      const matchesSearch = conn.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCourse = courseFilter === 'All Courses' || 
        (conn.courses && conn.courses.includes(courseFilter))
      
      return matchesSearch && matchesCourse
    })
  }

  const filteredConnections = filterConnections(connections)
  const filteredSuggestions = filterConnections(suggestedConnections)
  const filteredRequests = pendingRequests.filter((req) =>
    req.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Connections</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {['connections', 'requests', 'discover'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
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
        <ConnectionList connections={filteredConnections as Connection[]} onRemove={handleRemoveConnection} />
      )}
      {activeTab === 'requests' && (
        <RequestList requests={filteredRequests} onAccept={handleAcceptRequest} onReject={handleRejectRequest} />
      )}
      {activeTab === 'discover' && (
        <SuggestionList suggestions={filteredSuggestions as Suggestion[]} onConnect={handleConnect} />
      )}
    </div>
  )
}

const ConnectionList = ({ connections, onRemove }: { connections: Connection[]; onRemove: (id: number) => void }) => {
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
              <div className="text-xs text-gray-400 dark:text-gray-500">{conn.courses.join(', ')}</div>
            </div>
          </div>
          <button
            onClick={() => onRemove(conn.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors duration-200"
          >
            <XIcon size={16} /> Remove
          </button>
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

const SuggestionList = ({ suggestions, onConnect }: { suggestions: Suggestion[]; onConnect: (id: number) => void }) => {
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
              <div className="text-xs text-gray-400 dark:text-gray-500">{sugg.courses.join(', ')}</div>
              <div className="text-xs text-blue-500 dark:text-blue-400">{sugg.mutualConnections} mutual connections</div>
            </div>
          </div>
          <button
            onClick={() => onConnect(sugg.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors duration-200"
          >
            <UserPlusIcon size={16} /> Connect
          </button>
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
