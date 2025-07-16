// API configuration using environment variables
// Vite automatically loads .env files based on NODE_ENV
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const SIGNALR_URL = import.meta.env.VITE_SIGNALR_URL

// Validate that environment variables are set
if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is not set. Check your .env files.')
}

if (!SIGNALR_URL) {
  throw new Error('VITE_SIGNALR_URL environment variable is not set. Check your .env files.')
}

// Export the current configuration
export const config = {
  baseURL: API_BASE_URL,
  signalRURL: SIGNALR_URL
}

// ...existing code...

// Common API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  users: `${config.baseURL}/api/users`,
  login: `${config.baseURL}/api/users/login`,
  
  // Course endpoints
  courses: `${config.baseURL}/api/courses`,
  
  // Connection endpoints (uses [controller] = "Connection")
  connection: `${config.baseURL}/api/Connection`,
 
  // Dashboard endpoints (uses [controller] = "Dashboard")
  dashboard: `${config.baseURL}/api/Dashboard`,
  
  // Chat endpoints (uses [controller] = "Chat")
  chat: `${config.baseURL}/api/Chat`,
  
  // Message endpoints (special route structure)
  messages: `${config.baseURL}/api/courses`, // Messages are under courses/{courseId}/messages
  
  // SignalR hubs
  chatHub: `${config.signalRURL}/chatHub`,
  connectionHub: `${config.signalRURL}/connectionHub`
}

// Export base URL for custom endpoints
export { API_BASE_URL }
