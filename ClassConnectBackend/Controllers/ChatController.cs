// this file is for the private chats controller that will be used for users that have connected with each other.
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassConnectBackend.Models;
using ClassConnectBackend.Data;

namespace ClassConnectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ChatController(AppDbContext db)
        {
            _db = db;
        }

        // Get all chats for a user
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserChats(int userId)
        {
            try
            {
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
                    var otherUser = c.User1Id == userId ? c.User2 : c.User1;
                    var lastMessage = c.Messages.OrderByDescending(m => m.Timestamp).FirstOrDefault();
                    
                    return new
                    {
                        Id = c.Id, // Make sure this is the chat ID
                        ChatId = c.Id, // Also include ChatId for clarity
                        OtherUser = new
                        {
                            Id = otherUser.Id,
                            Name = otherUser.Name ?? "",
                            Avatar = otherUser.ProfilePictureUrl ?? ""
                        },
                        LastMessage = lastMessage != null ? new
                        {
                            Content = lastMessage.Content,
                            Timestamp = lastMessage.Timestamp,
                            IsFromMe = lastMessage.SenderId == userId
                        } : null,
                        UnreadCount = 0 // You can implement this later
                    };
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserChats: {ex.Message}");
                return StatusCode(500, $"Error fetching user chats: {ex.Message}");
            }
        }

        // Get or create a chat between two users
        [HttpPost("create")]
        public async Task<IActionResult> CreateOrGetChat([FromBody] CreateChatDto dto)
        {
            try
            {
                Console.WriteLine($"Creating chat between users {dto.User1Id} and {dto.User2Id}");

                // Check if users are connected
                var connection = await _db.Connections
                    .FirstOrDefaultAsync(c => 
                        ((c.RequesterId == dto.User1Id && c.ReceiverId == dto.User2Id) ||
                         (c.RequesterId == dto.User2Id && c.ReceiverId == dto.User1Id)) &&
                        c.Status == Models.ConnectionStatus.Accepted);

                if (connection == null)
                {
                    Console.WriteLine($"No connection found between users {dto.User1Id} and {dto.User2Id}");
                    return BadRequest("Users must be connected to create a chat");
                }

                // Check if chat already exists
                var existingChat = await _db.Chats
                    .FirstOrDefaultAsync(c => 
                        (c.User1Id == dto.User1Id && c.User2Id == dto.User2Id) ||
                        (c.User1Id == dto.User2Id && c.User2Id == dto.User1Id));

                if (existingChat != null)
                {
                    Console.WriteLine($"Chat already exists with ID: {existingChat.Id}");
                    return Ok(new { chatId = existingChat.Id });
                }

                // Create new chat
                var chat = new Chat
                {
                    User1Id = Math.Min(dto.User1Id, dto.User2Id),
                    User2Id = Math.Max(dto.User1Id, dto.User2Id),
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = DateTime.UtcNow
                };

                _db.Chats.Add(chat);
                await _db.SaveChangesAsync();

                Console.WriteLine($"Created new chat with ID: {chat.Id}");
                return Ok(new { chatId = chat.Id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating chat: {ex.Message}");
                return StatusCode(500, $"Error creating chat: {ex.Message}");
            }
        }

        // Get messages for a specific chat
        [HttpGet("{chatId}/messages")]
        public async Task<IActionResult> GetChatMessages(int chatId, [FromQuery] int userId)
        {
            try
            {
                var chat = await _db.Chats
                    .Include(c => c.Messages)
                        .ThenInclude(m => m.Sender)
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));

                if (chat == null)
                {
                    return NotFound("Chat not found or access denied");
                }

                var messages = chat.Messages
                    .OrderBy(m => m.Timestamp) // Changed from SentAt to Timestamp
                    .Select(m => new
                    {
                        Id = m.Id,
                        Content = m.Content,
                        SentAt = m.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"), // Use Timestamp but return as SentAt for frontend compatibility
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
                
                if (unreadMessages.Any())
                {
                    await _db.SaveChangesAsync();
                }

                return Ok(messages);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetChatMessages: {ex.Message}");
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
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == dto.SenderId || c.User2Id == dto.SenderId));

                if (chat == null)
                {
                    return NotFound("Chat not found or access denied");
                }

                var message = new ChatMessage
                {
                    ChatId = chatId,
                    SenderId = dto.SenderId,
                    Content = dto.Content,
                    Timestamp = DateTime.UtcNow,
                    IsRead = false
                };

                _db.ChatMessages.Add(message);
                
                // Update last message time
                chat.LastMessageAt = DateTime.UtcNow;
                
                await _db.SaveChangesAsync();

                return Ok(new { messageId = message.Id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending message: {ex.Message}");
                return StatusCode(500, $"Error sending message: {ex.Message}");
            }
        }

        // Get chat by ID (for chat info)
        [HttpGet("{chatId}")]
        public async Task<IActionResult> GetChatById(int chatId, [FromQuery] int userId)
        {
            try
            {
                var chat = await _db.Chats
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));

                if (chat == null)
                {
                    return NotFound("Chat not found");
                }

                var otherUser = chat.User1Id == userId ? chat.User2 : chat.User1;

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
                var chat = await _db.Chats
                    .Include(c => c.Messages)
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));

                if (chat == null)
                {
                    return NotFound("Chat not found");
                }

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