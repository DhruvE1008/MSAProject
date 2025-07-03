import React, { useEffect, useState, useRef } from 'react'
// useParams is used to access URL parameters
import { useParams, Link } from 'react-router-dom'
import { SendIcon, UserIcon, MessageCircleIcon } from 'lucide-react'
interface Message {
  id: number
  sender: string
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
const Chat = () => {
  // Get courseId from URL parameters
  const { courseId } = useParams()
  // setup state for messages, courses, selected course, and message input
  const [message, setMessage] = useState('')
  // Messages will be an array of Message objects
  // Each Message object contains id, sender, text, timestamp, isCurrentUser flag, and avatar URL
  const [messages, setMessages] = useState<Message[]>([])
  // Courses will be an array of Course objects
  const [courses, setCourses] = useState<Course[]>([])
  // Selected course will be a Course object or null if no course is selected
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  // Ref to scroll to the bottom of the messages
  // This is used to automatically scroll to the latest message when a new message is sent or received
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Mock data
  useEffect(() => {
    const courseData = [
      {
        id: 1,
        name: 'Data Structures and Algorithms',
        code: 'CS 301',
      },
      {
        id: 2,
        name: 'Discrete Mathematics',
        code: 'MATH 251',
      },
      {
        id: 3,
        name: 'Database Systems',
        code: 'CS 315',
      },
      {
        id: 4,
        name: 'Web Development',
        code: 'CS 350',
      },
    ]
    setCourses(courseData)
    // If courseId is provided in URL, select that course
    if (courseId) {
      const course = courseData.find((c) => c.id === parseInt(courseId))
      if (course) {
        setSelectedCourse(course)
        loadMessagesForCourse(parseInt(courseId))
      }
    }
  }, [courseId])
  // gets courseID from URL parameters and loads messages for that course
  const loadMessagesForCourse = (courseId: number) => {
    // Mock messages data
    const mockMessages: Message[] = [
      {
        id: 1,
        sender: 'Emma Watson',
        text: 'Has anyone started the assignment yet?',
        timestamp: '10:30 AM',
        isCurrentUser: false,
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
      },
      {
        id: 2,
        sender: 'James Smith',
        text: "I'm looking at it now. The third problem seems tricky.",
        timestamp: '10:35 AM',
        isCurrentUser: false,
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
      },
      {
        id: 3,
        sender: 'You',
        text: "I can help with that one! I think we need to use the formula from last week's lecture.",
        timestamp: '10:38 AM',
        isCurrentUser: true,
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        id: 4,
        sender: 'Emma Watson',
        text: 'That makes sense. Can we meet up at the library later to work on it together?',
        timestamp: '10:40 AM',
        isCurrentUser: false,
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
      },
    ]
    // Set messages for the selected course
    setMessages(mockMessages)
  }
  // Handle course selection when a course is clicked in the sidebar
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course)
    loadMessagesForCourse(course.id)
  }
  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    // e is the react event object
    // prevent default is used to stop the form from reloading the page
    e.preventDefault()
    // Check if message is not empty and a course is selected
    if (message.trim() && selectedCourse) {
      // basically creates a message object and sends it.
      const newMessage: Message = {
        id: Date.now(),
        sender: 'You',
        text: message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isCurrentUser: true,
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      }
      setMessages([...messages, newMessage])
      setMessage('')
    }
  }
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])
  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row">
      {/* Course List Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-lg">Course Chats</h2>
        </div>
        <div className="p-2">
          {courses.map((course) => (
            // button that allows user to change courses.
            <button
              key={course.id}
              onClick={() => handleSelectCourse(course)}
              className={`w-full text-left p-3 rounded-lg mb-1 ${selectedCourse?.id === course.id ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <p className="font-medium truncate">{course.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {course.code}
              </p>
            </button>
          ))}
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedCourse ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">{selectedCourse.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCourse.code}
                </p>
              </div>
              <Link
                to={`/courses`}
                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <UserIcon size={16} className="mr-1" />
                View Course
              </Link>
            </div>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex mb-4 ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!msg.isCurrentUser && (
                    <img
                      src={msg.avatar}
                      alt={msg.sender}
                      className="h-8 w-8 rounded-full mr-2 self-end"
                    />
                  )}
                  <div
                    className={`max-w-[70%] ${msg.isCurrentUser ? 'order-1' : 'order-2'}`}
                  >
                  {/* if the message isn't send by the user then it displays the name of the person who sent it */}
                    {!msg.isCurrentUser && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {msg.sender}
                      </p>
                    )}
                    <div
                      className={`p-3 rounded-lg ${msg.isCurrentUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 rounded-bl-none'}`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      {msg.timestamp}
                    </p>
                  </div>
                  {msg.isCurrentUser && (
                    <img
                      src={msg.avatar}
                      alt={msg.sender}
                      className="h-8 w-8 rounded-full ml-2 self-end"
                    />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {/* Message Input */}
            {/* form is used for sending messages */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
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
          // ) : ( // If no course is selected, show a placeholder message
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full inline-flex items-center justify-center mb-4">
                <MessageCircleIcon
                  size={32}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Select a Course Chat
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Choose a course from the sidebar to join the conversation with
                your classmates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default Chat
