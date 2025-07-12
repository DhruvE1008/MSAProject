using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using ClassConnectBackend.Data;
using ClassConnectBackend.Models;
using ClassConnectBackend.Hubs;

namespace ClassConnectBackend.Controllers
{
    [Route("api/courses/{courseId}/messages")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<ChatHub> _hubContext;

        public MessagesController(AppDbContext db, IHubContext<ChatHub> hubContext)
        {
            _db = db;
            _hubContext = hubContext;
        }

        // gets all messages for a specific course
        // GET: /api/courses/1/messages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessages(int courseId)
        {
            try
            {
                var messages = await _db.Messages
                    .Where(m => m.CourseId == courseId)
                    .Include(m => m.Sender)
                    .OrderBy(m => m.Timestamp)
                    .ToListAsync();

                Console.WriteLine($"Found {messages.Count} messages for course {courseId}");
                return Ok(messages);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting messages: {ex.Message}");
                return StatusCode(500, $"Error getting messages: {ex.Message}");
            }
        }

        // sends and stores a new message to a specific course
        // POST: /api/courses/1/messages
        [HttpPost]
        public async Task<ActionResult> SendMessage(int courseId, [FromBody] SendMessageRequest request)
        {
            try
            {
                Console.WriteLine($"Sending message to course {courseId}");

                // Validate the request
                if (string.IsNullOrWhiteSpace(request.Content))
                {
                    return BadRequest("Message content is required");
                }

                // Get the user who is sending the message
                var user = await _db.Users.FindAsync(request.SenderId);
                if (user == null)
                {
                    return BadRequest("User not found");
                }

                // Validate the course exists
                var course = await _db.Courses.FindAsync(courseId);
                if (course == null)
                {
                    return BadRequest("Course not found");
                }

                // Create the message
                var message = new Message
                {
                    Content = request.Content,
                    SenderId = request.SenderId,
                    CourseId = courseId,
                    Timestamp = DateTime.UtcNow,
                    Sender = user
                };

                // Save to database
                _db.Messages.Add(message);
                await _db.SaveChangesAsync();

                // Send real-time message to all users in the course group
                await _hubContext.Clients.Group($"course_{courseId}").SendAsync("ReceiveCourseMessage", new
                {
                    id = message.Id,
                    content = message.Content,
                    sender = user.Name,
                    senderId = user.Id,
                    avatar = user.ProfilePictureUrl ?? "/default-avatar.png",
                    timestamp = message.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    courseId = courseId
                });

                Console.WriteLine($"Message saved and broadcast with ID: {message.Id}");

                return Ok(new { 
                    success = true, 
                    messageId = message.Id,
                    message = "Message sent successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending message: {ex.Message}");
                return StatusCode(500, $"Error sending message: {ex.Message}");
            }
        }
    }

    // Simple request model for sending messages
    public class SendMessageRequest
    {
        public string Content { get; set; } = string.Empty;
        public int SenderId { get; set; }
    }
}
