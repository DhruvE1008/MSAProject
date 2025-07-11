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

const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
const userId = currentUser.id;

  // useEffect to fetch courses based on user ID
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`http://localhost:5082/api/courses/user/${userId}`)
        const data = await res.json()
        setCourses(data)

        if (courseId) {
          const course = data.find((c: Course) => c.id === parseInt(courseId))
          if (course) {
            setSelectedCourse(course)
            loadMessagesForCourse(course.id)
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }

    fetchCourses()
  }, [courseId])

  // Function to load messages for a specific course
  const loadMessagesForCourse = async (courseId: number) => {
    try {
      const res = await fetch(`http://localhost:5082/api/courses/${courseId}/messages`);
      const data = await res.json();

      const formatted = data.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        // the timestamp is formatted to a more readable format
        // with date and time
        timestamp: new Date(msg.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).replace(',', ' -'),
        sender: msg.sender.username, // Optionally replace with real name
        isCurrentUser: msg.senderId === userId, 
        avatar: msg.sender.profilePictureUrl
      }));

      setMessages(formatted);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  // allows user to select a course from the list
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course)
    loadMessagesForCourse(course.id)
  }

  // Handle sending a new message
const handleSendMessage = async (e: React.FormEvent) => {
      // e is the react event object
    // prevent default is used to stop the form from reloading the page
  e.preventDefault();
      // Check if message is not empty and a course is selected
  if (!message.trim() || !selectedCourse) return;

  const newMsg = {
    senderId: userId, // Replace with actual logged-in user ID
    content: message
  };

  // sends the new message to the backend API
  try {
    const res = await fetch(`http://localhost:5082/api/courses/${selectedCourse.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    });

    if (!res.ok) throw new Error("Failed to send message");

    // Add to messages list (optimistically)
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: message,
        sender: 'You',
        isCurrentUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=you'
      }
    ]);

    setMessage('');
  } catch (err) {
    console.error("Failed to send message", err);
  }
};


  // Scroll to the bottom of the messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-lg">Course Chats</h2>
        </div>
        <div className="p-2">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => handleSelectCourse(course)}
              className={`w-full text-left p-3 rounded-lg mb-1 ${selectedCourse?.id === course.id ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <p className="font-medium truncate">{course.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{course.code}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedCourse ? (
          <>
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">{selectedCourse.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCourse.code}</p>
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
              {messages.map((msg) => (
               <div
                key={msg.id}
                className={`flex mb-8 ${msg.isCurrentUser ? 'justify-end' : 'justify-start'} items-start`} // Changed from items-end to items-start
              >
                {!msg.isCurrentUser && (
                  <img
                    src={msg.avatar}
                    alt={msg.sender}
                    className="h-8 w-8 rounded-full mr-2 mt-10" // Added mt-1 for slight offset
                  />
                )}
                {/* If the message is from the user then it goes on the right of the chat and otherwise its on the left with the name shown of the user. */}
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
                  {!msg.isCurrentUser && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-left">
                      {msg.timestamp}
                    </p>
                  )}
                  {msg.isCurrentUser && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      {msg.timestamp}
                    </p>
                  )}
                </div>

                {msg.isCurrentUser && (
                  <img
                    src={msg.avatar}
                    alt={msg.sender}
                    className="h-8 w-8 rounded-full mr-2 mt-9" // Added mt-1 for slight offset
                  />
                )}
              </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

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
          // ) : ( If no course is selected, show a placeholder message
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full inline-flex items-center justify-center mb-4">
                <MessageCircleIcon size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Select a Course Chat</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Choose a course from the sidebar to join the conversation with your classmates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
