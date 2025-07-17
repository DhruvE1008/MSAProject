import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { SendIcon, UserIcon, MessageCircleIcon, Hash, ArrowLeft } from 'lucide-react'
import axios from 'axios' 
import * as signalR from '@microsoft/signalr'
import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

// Course Chat interfaces
interface CourseMessage {
  id: number
  sender?: string
  text: string
  timestamp: string
  isCurrentUser: boolean
  avatar: string
}

interface Course {
  id: number
  name: string
  code: string
}

// Private Chat interfaces
interface PrivateMessage {
  id: number
  content: string
  sentAt: string
  isFromMe: boolean
  senderName: string
  senderAvatar: string
}

interface PrivateChat {
  id: number
  chatId: number
  otherUser: {
    id: number
    name: string
    avatar: string
  }
  lastMessage: {
    content: string
    sentAt: string
    isFromMe: boolean
  } | null
  unreadCount: number
}

const Chat = () => {
  // useParams is used to get the courseId from the URL
  // useSearchParams is used to get the chat type and private chat ID from the URL
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const chatType = searchParams.get('type') || 'course'
  const privateChatId = searchParams.get('chatId')

  // State
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'course' | 'private'>(chatType as 'course' | 'private')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Sidebar visibility for mobile
  const [sidebarOpen, setSidebarOpen] = useState(true)
  // Track if a chat is selected (for mobile back button)
  const [chatSelected, setChatSelected] = useState(false)

  // Course chat state
  const [courseMessages, setCourseMessages] = useState<CourseMessage[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  // Private chat state
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([])
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([])
  const [selectedPrivateChat, setSelectedPrivateChat] = useState<PrivateChat | null>(null)

  // SignalR connection
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)

  // Add a new state for ALL private messages (not just current chat)
  const [allPrivateMessages, setAllPrivateMessages] = useState<{[chatId: string]: PrivateMessage[]}>({})

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}')
  const userId = currentUser.id

  // Initialize based on URL params
  useEffect(() => {
    if (chatType === 'private') {
      setActiveTab('private')
      fetchPrivateChats()
    } else {
      setActiveTab('course')
      fetchCourses()
    }
  }, [chatType, courseId])

  // Handle private chat selection after fetching
  useEffect(() => {
    if (privateChatId && privateChats.length > 0) {
      const chatIdNum = parseInt(privateChatId)
      const chat = privateChats.find(c => c.id === chatIdNum || c.chatId === chatIdNum)
      
      if (chat) {
        setSelectedPrivateChat(chat)
        // Only fetch if we don't have messages for this chat
        const chatId = chat.chatId || chat.id
        if (!allPrivateMessages[chatId.toString()] || allPrivateMessages[chatId.toString()].length === 0) {
          fetchPrivateMessages(chatId)
        }
      }
    }
  }, [privateChatId, privateChats])

  // Initialize SignalR connection
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(API_ENDPOINTS.chatHub)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    newConnection.start()
      .then(() => {
        setConnection(newConnection)
      })
      .catch(err => {
        console.error('SignalR Connection Error:', err)
      })

    return () => {
      if (newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.stop()
      }
    }
  }, [])

  // Set up course message listener
  useEffect(() => {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) return

    const handleCourseMessage = (messageData: any) => {
      const messageIsForCurrentCourse = selectedCourse && 
        (messageData.courseId.toString() === selectedCourse.id.toString())
      
      if (messageIsForCurrentCourse) {
        // formats the message to match the CourseMessage interface
        const formattedMessage = {
          id: messageData.id,
          text: messageData.content,
          sender: messageData.sender,
          isCurrentUser: messageData.senderId === userId,
          timestamp: new Date(messageData.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).replace(',', ' -'),
          avatar: messageData.avatar
        }
        
        setCourseMessages(prev => [...prev, formattedMessage])
      }
    }

    // Remove any existing listener before adding a new one
    // this prevents duplicate listeners from being added
    connection.off('ReceiveCourseMessage')
    connection.on('ReceiveCourseMessage', handleCourseMessage)

    return () => {
      connection.off('ReceiveCourseMessage', handleCourseMessage)
    }
  }, [connection, selectedCourse, userId])

  // Set up private message listener
  useEffect(() => {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) return

    const handlePrivateMessage = (messageData: any) => {
      const formattedMessage = {
        id: messageData.id,
        content: messageData.content,
        senderName: messageData.sender,
        isFromMe: messageData.senderId === userId,
        sentAt: messageData.timestamp,
        senderAvatar: messageData.avatar
      }
      
      // Add message to the appropriate chat in allPrivateMessages
      setAllPrivateMessages(prev => {
        const chatId = messageData.chatId.toString()
        const existingMessages = prev[chatId] || []
        const newMessages = [...existingMessages, formattedMessage]
        return {
          ...prev,
          [chatId]: newMessages
        }
      })
      
      // Update the private chat list to show the latest message
      setPrivateChats(prevChats => {
        return prevChats.map(chat => {
          const chatId = (chat.chatId || chat.id).toString()
          if (chatId === messageData.chatId.toString()) {
            return {
              ...chat,
              lastMessage: {
                content: messageData.content,
                sentAt: messageData.timestamp,
                isFromMe: messageData.senderId === userId
              }
            }
          }
          return chat
        })
      })
    }

    connection.off('ReceivePrivateMessage')
    connection.on('ReceivePrivateMessage', handlePrivateMessage)

    return () => {
      connection.off('ReceivePrivateMessage', handlePrivateMessage)
    }
  }, [connection, userId])

  // Update privateMessages when selectedPrivateChat OR allPrivateMessages changes
  useEffect(() => {
    if (selectedPrivateChat) {
      const chatId = (selectedPrivateChat.chatId || selectedPrivateChat.id).toString()
      const messagesForChat = allPrivateMessages[chatId] || []
      setPrivateMessages(messagesForChat)
    }
  }, [selectedPrivateChat, allPrivateMessages])

  // Join/leave course groups when selectedCourse changes
  useEffect(() => {
    if (connection && connection.state === signalR.HubConnectionState.Connected && selectedCourse) {
      connection.invoke('JoinCourseGroup', selectedCourse.id.toString())
        .catch(() => {})
      
      return () => {
        if (connection.state === signalR.HubConnectionState.Connected) {
          connection.invoke('LeaveCourseGroup', selectedCourse.id.toString())
            .catch(() => {})
        }
      }
    }
  }, [connection, selectedCourse])

  // Join/leave private chat groups when selectedPrivateChat changes
  useEffect(() => {
    if (connection && connection.state === signalR.HubConnectionState.Connected && selectedPrivateChat) {
      const chatId = selectedPrivateChat.chatId || selectedPrivateChat.id
      
      connection.invoke('JoinPrivateChat', chatId.toString())
        .catch(() => {})
      
      return () => {
        if (connection.state === signalR.HubConnectionState.Connected) {
          connection.invoke('LeavePrivateChat', chatId.toString())
            .catch(() => {})
        }
      }
    }
  }, [connection, selectedPrivateChat])

  // Auto-scroll to bottom when messages change or when switching chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [courseMessages, privateMessages])

  // Additional scroll to bottom when switching private chats
  useEffect(() => {
    if (selectedPrivateChat) {
      // Use setTimeout to ensure the messages are rendered first
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [selectedPrivateChat])

  // ========== COURSE CHAT FUNCTIONS ==========
  
  // Fetch courses
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINTS.courses}/user/${userId}`)
      setCourses(res.data)

      if (courseId) {
        const course = res.data.find((c: Course) => c.id === parseInt(courseId))
        if (course) {
          setSelectedCourse(course)
          loadMessagesForCourse(course.id)
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  // Load messages for course
  const loadMessagesForCourse = async (courseId: number) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.courses}/${courseId}/messages`)
      
      if (!res.ok) {
        throw new Error(`Failed to load messages: ${res.status}`)
      }
      
      const data = await res.json()

      const formatted = data.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        timestamp: msg.formattedTimestamp || new Date(msg.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).replace(',', ' -'),
        sender: msg.sender?.username || 'Unknown',
        isCurrentUser: msg.senderId === userId,
        avatar: msg.sender?.profilePictureUrl || '/default-avatar.png'
      }))

      setCourseMessages(formatted)
    } catch (err) {
      console.error("Failed to load messages:", err)
    }
  }

  // Handle course selection
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course)
    loadMessagesForCourse(course.id)
    // On mobile, hide sidebar after selecting and mark chat as selected
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
      setChatSelected(true)
    }
  }

  // Send course message
  const handleSendCourseMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || !selectedCourse) return

    const messageData = {
      content: message,
      senderId: userId
    }

    try {
      const res = await fetch(`${API_ENDPOINTS.courses}/${selectedCourse.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      if (!res.ok) {
        throw new Error(`Failed to send message: ${res.status}`)
      }

      setMessage('')
      
    } catch (err) {
      console.error("Failed to send message:", err)
      alert('Failed to send message. Please try again.')
    }
  }

  // ========== PRIVATE CHAT FUNCTIONS ==========

  // Fetch private chats
  const fetchPrivateChats = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.chat}/user/${userId}`)
      
      const chats = response.data.map((chat: any) => ({
        ...chat,
        chatId: chat.chatId || chat.id
      }))
      
      setPrivateChats(chats)
    } catch (err) {
      console.error('Error fetching private chats:', err)
    }
  }

  // Fetch private messages
  const fetchPrivateMessages = async (chatId: number) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.chat}/${chatId}/messages?userId=${userId}`)
      const messages = response.data
      
      // Store in allPrivateMessages
      setAllPrivateMessages(prev => ({
        ...prev,
        [chatId.toString()]: messages
      }))
      
    } catch (err) {
      console.error('Error fetching private messages:', err)
    }
  }

  // Send private message
  const handleSendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !selectedPrivateChat) return

    try {
      const chatId = selectedPrivateChat.chatId || selectedPrivateChat.id
      
      await axios.post(`${API_ENDPOINTS.chat}/${chatId}/messages`, {
        senderId: userId,
        content: message
      })
      
      setMessage('')
      
    } catch (err) {
      console.error('Error sending private message:', err)
      alert('Failed to send message. Please try again.')
    }
  }

  // Tab switching handler
  const handleTabSwitch = (tab: 'course' | 'private') => {
    setActiveTab(tab)
    if (tab === 'course') {
      fetchCourses()
    } else {
      fetchPrivateChats()
    }
    // On mobile, show sidebar when switching tabs and reset chatSelected
    if (window.innerWidth < 768) {
      setSidebarOpen(true)
      setChatSelected(false)
    }
  }

  // Helper function to format message timestamps
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row">
      {/* Mobile tab switcher and back button */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {chatSelected ? (
          <button
            onClick={() => {
              setSidebarOpen(true)
              setChatSelected(false)
              setSelectedCourse(null)
              setSelectedPrivateChat(null)
            }}
            className="text-blue-600 dark:text-blue-400 font-semibold"
          >
            ← Back to Chats
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => handleTabSwitch('course')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${activeTab === 'course' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            >
              <Hash size={14} className="inline mr-1" /> Courses
            </button>
            <button
              onClick={() => handleTabSwitch('private')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${activeTab === 'private' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            >
              <MessageCircleIcon size={14} className="inline mr-1" /> Private
            </button>
          </div>
        )}
        <span className="font-semibold text-lg">Chat</span>
      </div>

      {/* Sidebar */}
      <div
        className={`w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-10 ${
          sidebarOpen ? '' : 'hidden md:block'
        } ${chatSelected ? 'hidden md:block' : ''}`}
      >
        {/* Header with back button and tabs (desktop only) */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 hidden md:block">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-semibold text-lg">Chat</h2>
          </div>
          {/* Tab Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => handleTabSwitch('course')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'course'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Hash size={14} className="inline mr-1" />
              Courses
            </button>
            <button
              onClick={() => handleTabSwitch('private')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'private'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <MessageCircleIcon size={14} className="inline mr-1" />
              Private
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="p-2">
          {activeTab === 'course' ? (
            // Course List
            courses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className={`w-full text-left p-3 rounded-lg mb-1 ${
                  selectedCourse?.id === course.id 
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
                    <Hash size={12} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{course.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{course.code}</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            // Private Chat List
            <>
              {privateChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    setSelectedPrivateChat(chat)
                    // Only fetch messages if we don't have any for this chat yet
                    const chatId = chat.chatId || chat.id
                    if (!allPrivateMessages[chatId.toString()] || allPrivateMessages[chatId.toString()].length === 0) {
                      fetchPrivateMessages(chatId)
                    }
                    // On mobile, hide sidebar after selecting and mark chat as selected
                    if (window.innerWidth < 768) {
                      setSidebarOpen(false)
                      setChatSelected(true)
                    }
                  }}
                  className={`w-full text-left p-3 rounded-lg mb-1 ${
                    selectedPrivateChat?.id === chat.id
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={chat.otherUser.avatar || '/default-avatar.png'}
                      alt={chat.otherUser.name}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate pr-2">{chat.otherUser.name}</p>
                      {chat.lastMessage && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {chat.lastMessage.isFromMe ? 'You: ' : ''}
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              
              {privateChats.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                  <MessageCircleIcon className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">No private chats yet</p>
                  <p className="text-xs">Start a chat from connections</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Course Chat */}
        {activeTab === 'course' && selectedCourse ? (
          <>
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <Hash size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{selectedCourse.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCourse.code}</p>
                </div>
              </div>
              <Link
                to={`/courses`}
                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <UserIcon size={16} className="mr-1" />
                View Course
              </Link>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {courseMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex mb-8 ${msg.isCurrentUser ? 'justify-end' : 'justify-start'} items-start`}
                >
                  {!msg.isCurrentUser && (
                    <img
                      src={msg.avatar}
                      alt={msg.sender}
                      className="h-8 w-8 rounded-full mr-2 mt-10"
                    />
                  )}
                  <div className={`max-w-[70%] ${msg.isCurrentUser ? 'order-1' : 'order-2'}`}>
                    {!msg.isCurrentUser && (
                      <p className="text-s mb-1">{msg.sender}</p>
                    )}
                    {msg.isCurrentUser && (
                      <p className="text-s mb-1 text-right">{msg.sender}</p>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        msg.isCurrentUser
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                      msg.isCurrentUser ? 'text-right' : 'text-left'
                    }`}>
                      {msg.timestamp}
                    </p>
                  </div>
                  {msg.isCurrentUser && (
                    <img
                      src={msg.avatar}
                      alt={msg.sender}
                      className="h-8 w-8 rounded-full ml-2 mt-9"
                    />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendCourseMessage}
              className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Message ${selectedCourse.name}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <SendIcon size={18} />
                </button>
              </div>
            </form>
          </>
        ) : activeTab === 'private' && selectedPrivateChat ? (
          // Private Chat
          <>
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <img
                  src={selectedPrivateChat.otherUser.avatar || '/default-avatar.png'}
                  alt={selectedPrivateChat.otherUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-lg">{selectedPrivateChat.otherUser.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Private Chat</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {privateMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex mb-8 ${msg.isFromMe ? 'justify-end' : 'justify-start'} items-start`}
                >
                  {!msg.isFromMe && (
                    <img
                      src={msg.senderAvatar || '/default-avatar.png'}
                      alt={msg.senderName}
                      className="h-8 w-8 rounded-full mr-2 mt-10"
                    />
                  )}
                  <div className={`max-w-[70%] ${msg.isFromMe ? 'order-1' : 'order-2'}`}>
                    {!msg.isFromMe && (
                      <p className="text-s mb-1">{msg.senderName}</p>
                    )}
                    {msg.isFromMe && (
                      <p className="text-s mb-1 text-right">You</p>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        msg.isFromMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                    <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                      msg.isFromMe ? 'text-right' : 'text-left'
                    }`}>
                      {formatMessageTime(msg.sentAt)}
                    </p>
                  </div>
                  {msg.isFromMe && (
                    <img
                      src={currentUser.profilePictureUrl || '/default-avatar.png'}
                      alt="You"
                      className="h-8 w-8 rounded-full ml-2 mt-9"
                    />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendPrivateMessage}
              className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Message ${selectedPrivateChat.otherUser.name}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <SendIcon size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          // No selection placeholder
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full inline-flex items-center justify-center mb-4">
                {activeTab === 'course' ? (
                  <Hash size={32} className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <MessageCircleIcon size={32} className="text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <h2 className="text-xl font-semibold mb-2">
                {activeTab === 'course' ? 'Select a Course Chat' : 'Select a Private Chat'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                {activeTab === 'course' 
                  ? 'Choose a course from the sidebar to join the conversation with your classmates.'
                  : 'Choose a private chat from the sidebar to start messaging with your connections.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
