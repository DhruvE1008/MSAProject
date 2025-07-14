// Create a new file: Controllers/DashboardController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassConnectBackend.Data;
using ClassConnectBackend.Models;

namespace ClassConnectBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _db;

        public DashboardController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("recent-course-chats/{userId}")]
        public async Task<ActionResult> GetRecentCourseChats(int userId)
        {
            try
            {
                // Get all courses the user is enrolled in
                var user = await _db.Users
                    .Include(u => u.EnrolledCourses)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return NotFound("User not found");
                }

                var userCourses = user.EnrolledCourses.ToList();
                var recentChats = new List<object>();

                foreach (var course in userCourses)
                {
                    // Get the most recent message for this course
                    var lastMessage = await _db.Messages
                        .Where(m => m.CourseId == course.Id)
                        .Include(m => m.Sender)
                        .OrderByDescending(m => m.Timestamp)
                        .FirstOrDefaultAsync();

                    // Get participant count for this course
                    var participantCount = await _db.Users
                        .Where(u => u.EnrolledCourses.Any(c => c.Id == course.Id))
                        .CountAsync();

                    if (lastMessage != null)
                    {
                        recentChats.Add(new
                        {
                            id = course.Id,
                            courseName = course.Name,
                            lastMessage = lastMessage.Content,
                            lastMessageSender = lastMessage.Sender.Username, // Use Username instead of Name
                            lastMessageTime = lastMessage.Timestamp,
                            participantCount = participantCount
                        });
                    }
                    else
                    {
                        recentChats.Add(new
                        {
                            id = course.Id,
                            courseName = course.Name,
                            lastMessage = "No messages yet",
                            lastMessageSender = "",
                            lastMessageTime = (DateTime?)null,
                            participantCount = participantCount
                        });
                    }
                }

                // Sort by most recent message timestamp and take top 3
                var sortedChats = recentChats
                    .OrderByDescending(chat => ((dynamic)chat).lastMessageTime ?? DateTime.MinValue)
                    .Take(3)
                    .ToList();

                Console.WriteLine($"Found {sortedChats.Count} recent course chats for user {userId}");
                return Ok(sortedChats);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting recent course chats: {ex.Message}");
                return StatusCode(500, $"Error getting recent course chats: {ex.Message}");
            }
        }

        [HttpGet("recent-private-chats/{userId}")]
        public async Task<ActionResult> GetRecentPrivateChats(int userId)
        {
            try
            {
                var userChats = await _db.Chats
                    .Where(c => c.User1Id == userId || c.User2Id == userId)
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .Include(c => c.Messages.OrderByDescending(m => m.Timestamp).Take(1)) // Changed from CreatedAt to Timestamp
                    .ThenInclude(m => m.Sender)
                    .ToListAsync();

                var recentChats = new List<object>();

                foreach (var chat in userChats)
                {
                    var otherUser = chat.User1Id == userId ? chat.User2 : chat.User1;
                    var lastMessage = chat.Messages.FirstOrDefault();

                    recentChats.Add(new
                    {
                        id = chat.Id,
                        otherUserName = otherUser.Name,
                        otherUserAvatar = otherUser.ProfilePictureUrl ?? "/default-avatar.png",
                        lastMessage = lastMessage?.Content ?? "No messages yet",
                        lastMessageTime = lastMessage?.Timestamp, // Changed from CreatedAt to Timestamp
                        lastMessageSender = lastMessage?.Sender?.Username ?? "",
                        isRead = true
                    });
                }

                var sortedChats = recentChats
                    .OrderByDescending(chat => ((dynamic)chat).lastMessageTime ?? DateTime.MinValue)
                    .Take(3)
                    .ToList();

                Console.WriteLine($"Found {sortedChats.Count} recent private chats for user {userId}");
                return Ok(sortedChats);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting recent private chats: {ex.Message}");
                return StatusCode(500, $"Error getting recent private chats: {ex.Message}");
            }
        }
    }
}