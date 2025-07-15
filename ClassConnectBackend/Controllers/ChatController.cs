// this file is for the private chats controller that will be used for users that have connected with each other.
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using ClassConnectBackend.Models;
using ClassConnectBackend.Data;
using ClassConnectBackend.Hubs;

namespace ClassConnectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        // db context is used to access the database
        // a context is a session with the database, allowing us to query and save data
        private readonly AppDbContext _db;
        // hub context is used to send messages to clients connected to the SignalR hub
        // which allows real-time communication
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(AppDbContext db, IHubContext<ChatHub> hubContext)
        {
            _db = db;
            _hubContext = hubContext;
        }

        // Get all chats for a user
        [HttpGet("user/{userId}")]
        // task<IActionResult> is used to return an asynchronous action result
        // IActionResult allows us to return different types of responses (e.g., Ok, NotFound, BadRequest)
        public async Task<IActionResult> GetUserChats(int userId)
        {
            try
            {
                // finds all chats where the user is either User1 or User2
                // includes the users and messages in the chat
                // orders by the last message timestamp in descending order
                var chats = await _db.Chats
                    .Where(c => c.User1Id == userId || c.User2Id == userId)
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .Include(c => c.Messages)
                        .ThenInclude(m => m.Sender)
                    .OrderByDescending(c => c.LastMessageAt)
                    .ToListAsync();

                var result = chats.Select(c =>
                {
                    // Determine the other user in the chat
                    // and the last message in the chat
                    // if the user is User1, then the other user is User2, and vice versa
                    // also formats the last message timestamp to ISO 8601 format
                    // and checks if the last message was sent by the current user
                    var otherUser = c.User1Id == userId ? c.User2 : c.User1;
                    var lastMessage = c.Messages.OrderByDescending(m => m.Timestamp).FirstOrDefault();
                    
                    return new
                    {
                        // message details
                        Id = c.Id,
                        ChatId = c.Id,
                        OtherUser = new
                        {
                            Id = otherUser.Id,
                            Name = otherUser.Name ?? "",
                            Avatar = otherUser.ProfilePictureUrl ?? ""
                        },
                        LastMessage = lastMessage != null ? new
                        {
                            Content = lastMessage.Content,
                            SentAt = lastMessage.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                            IsFromMe = lastMessage.SenderId == userId
                        } : null,
                        UnreadCount = c.Messages.Count(m => m.SenderId != userId && !m.IsRead)
                    };
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching user chats: {ex.Message}");
            }
        }

        // Get or create a chat between two users
        [HttpPost("create")]
        // frombody means that the data from the JSON string will be set to the properties of
        // a new CreateChatDto object.
        public async Task<IActionResult> CreateOrGetChat([FromBody] CreateChatDto dto)
        {
            try
            {
                // Check if users are connected
                var connection = await _db.Connections
                    .FirstOrDefaultAsync(c => 
                        ((c.RequesterId == dto.User1Id && c.ReceiverId == dto.User2Id) ||
                         (c.RequesterId == dto.User2Id && c.ReceiverId == dto.User1Id)) &&
                        c.Status == Models.ConnectionStatus.Accepted);

                // just checking if the connection exists
                // if not, we cannot create a chat so we send a bad request response
                // this is to ensure that only connected users can create a chat
                if (connection == null)
                {
                    return BadRequest("Users must be connected to create a chat");
                }

                // Check if chat already exists
                var existingChat = await _db.Chats
                    .FirstOrDefaultAsync(c => 
                        (c.User1Id == dto.User1Id && c.User2Id == dto.User2Id) ||
                        (c.User1Id == dto.User2Id && c.User2Id == dto.User1Id));
                
                // if the chat already exists, we return the chat ID
                // this allows us to reuse existing chats instead of creating new ones
                if (existingChat != null)
                {
                    return Ok(new { chatId = existingChat.Id });
                }

                // Since the chat doesn't exist we create new chat
                var chat = new Chat
                {
                    User1Id = Math.Min(dto.User1Id, dto.User2Id),
                    User2Id = Math.Max(dto.User1Id, dto.User2Id),
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = DateTime.UtcNow
                };

                // Add the new chat to the database
                // and save changes to persist it
                _db.Chats.Add(chat);
                // await means we are waiting for the database operation to complete
                // this is important for ensuring that the chat is created before we return the response
                await _db.SaveChangesAsync();

                // returns the ID of the newly created chat
                return Ok(new { chatId = chat.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating chat: {ex.Message}");
            }
        }

        // Get messages for a specific chat
        [HttpGet("{chatId}/messages")]
        // fromquery looks for the data in the url aka http://path?userId=123
        // this is used to get the user ID from the query string
        // this is useful for checking if the user has access to the chat
        // this is different from frombody which looks for the data in the json body of the request
        // fromquery is used for simple data types like integers, strings, etc.
        // frombody is used for complex objects like DTOs
        // there will be a ? in the URL to indicate that this is a query parameter
        // for example: /api/chat/1/messages?userId=123
        // this means we are getting messages for chat with ID 1 and checking if user with ID 123 has access to it
        public async Task<IActionResult> GetChatMessages(int chatId, [FromQuery] int userId)
        {
            try
            {
                // c = chat, m = message, s = sender
                // Fetch the chat and include messages and sender details
                var chat = await _db.Chats
                    .Include(c => c.Messages)
                        .ThenInclude(m => m.Sender)
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));

                // if the chat doesn't exist then send error.
                if (chat == null)
                {
                    return NotFound("Chat not found or access denied");
                }

                // Select messages and format them for the response
                // this will return a list of messages with their details
                // such as ID, content, timestamp, whether it was sent by the current user, sender name and avatar
                // the messages are ordered by timestamp to show them in chronological order
                var messages = chat.Messages
                    .OrderBy(m => m.Timestamp)
                    .Select(m => new
                    {
                        Id = m.Id,
                        Content = m.Content,
                        SentAt = m.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                        IsFromMe = m.SenderId == userId,
                        SenderName = m.Sender.Name ?? "",
                        SenderAvatar = m.Sender.ProfilePictureUrl ?? ""
                    });

                // Mark messages as read
                var unreadMessages = chat.Messages.Where(m => m.SenderId != userId && !m.IsRead);
                foreach (var message in unreadMessages)
                {
                    message.IsRead = true;
                }
                
                // if there are any unread messages, we save the changes to the database
                // the read messages will have already been stored in the database
                if (unreadMessages.Any())
                {
                    await _db.SaveChangesAsync();
                }

                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching chat messages: {ex.Message}");
            }
        }

        // Send a message 
        [HttpPost("{chatId}/messages")]
        public async Task<IActionResult> SendMessage(int chatId, [FromBody] SendMessageDto dto)
        {
            try
            {

                var chat = await _db.Chats
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == dto.SenderId || c.User2Id == dto.SenderId));

                if (chat == null)
                {
                    return NotFound("Chat not found or access denied");
                }

                // Get the sender user
                var sender = await _db.Users.FindAsync(dto.SenderId);
                if (sender == null)
                {
                    return BadRequest("Sender not found");
                }

                // Create a new chat message
                // this is the message that will be sent to the chat
                // it contains the chat ID, sender ID, content, timestamp, and whether it has been read
                // the sender is also included for later use in broadcasting the message
                var message = new ChatMessage
                {
                    ChatId = chatId,
                    SenderId = dto.SenderId,
                    Content = dto.Content,
                    Timestamp = DateTime.UtcNow,
                    IsRead = false,
                    Sender = sender
                };

                // Add the message to the chat's messages collection
                // this will add the message to the database
                // and allow us to retrieve it later
                chat.Messages.Add(message);
                _db.ChatMessages.Add(message);
                
                // Update last message time
                chat.LastMessageAt = DateTime.UtcNow;
                
                await _db.SaveChangesAsync();

                // look at ChatHub.cs to figure out how the messages are sent in real-time
                await _hubContext.Clients.Group($"chat_{chatId}").SendAsync("ReceivePrivateMessage", new
                {
                    id = message.Id,
                    chatId = chatId,
                    senderId = message.SenderId,
                    sender = message.Sender.Name ?? message.Sender.Username ?? "Unknown", // Use Name first, then Username
                    content = message.Content,
                    timestamp = message.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    avatar = message.Sender.ProfilePictureUrl ?? ""
                });

                return Ok(new { 
                    success = true,
                    messageId = message.Id,
                    message = "Message sent successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error sending message: {ex.Message}");
            }
        }

        // Get chat by ID (for chat info)
        [HttpGet("{chatId}")]
        public async Task<IActionResult> GetChatById(int chatId, [FromQuery] int userId)
        {
            try
            {
                // Fetch the chat and include user details
                var chat = await _db.Chats
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));

                if (chat == null)
                {
                    return NotFound("Chat not found");
                }

                // Determine the other user in the chat
                var otherUser = chat.User1Id == userId ? chat.User2 : chat.User1;

                // gets the details of the other user.
                var result = new
                {
                    Id = chat.Id,
                    OtherUser = new
                    {
                        Id = otherUser.Id,
                        Name = otherUser.Name,
                        Avatar = otherUser.ProfilePictureUrl ?? ""
                    }
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching chat: {ex.Message}");
            }
        }

        // Delete a chat
        [HttpDelete("{chatId}")]
        public async Task<IActionResult> DeleteChat(int chatId, [FromQuery] int userId)
        {
            try
            {
                // gets all the messages in the chat
                var chat = await _db.Chats
                    .Include(c => c.Messages)
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));

                if (chat == null)
                {
                    return NotFound("Chat not found");
                }

                // removes the chat from the database
                _db.Chats.Remove(chat);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Chat deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting chat: {ex.Message}");
            }
        }
    }

    // DTOs (Data Transfer Objects) for creating chats and sending messages
    // these classes are the containers that receives the data from the client
    // they are used to validate the data and ensure that the client sends the correct data
    // this is useful for preventing errors and ensuring that the data is in the correct format
    public class CreateChatDto
    {
        public int User1Id { get; set; }
        public int User2Id { get; set; }
    }

    public class SendMessageDto
    {
        public int SenderId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}