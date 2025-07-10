using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassConnectBackend.Data;
using ClassConnectBackend.Models;

namespace ClassConnectBackend.Controllers
// this file defines the API endpoints for handling messages in a course
{
    [Route("api/courses/{courseId}/messages")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public MessagesController(AppDbContext db)
        {
            _db = db;
        }

        // gets all messages for a specific course
        // GET: /api/courses/1/messages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessages(int courseId)
        {
            var messages = await _db.Messages
                    .Where(m => m.CourseId == courseId)
                    .Include(m => m.Sender) // <-- This is the key line
                    .OrderBy(m => m.Timestamp)
                    .ToListAsync();

                // You can project to an anonymous object or a DTO if needed
                var result = messages.Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.Timestamp,
                    m.SenderId,
                    m.FormattedTimestamp,
                    Sender = m.Sender == null ? null : new
                    {
                        m.Sender.Id,
                        m.Sender.Username, // Make sure this property exists in your User model
                        m.Sender.ProfilePictureUrl // Optional
                    }
                });

            // Return the list directly; FormattedTimestamp will be serialized along with the others
            return Ok(messages);
        }

        // sends and stores a new message to a specific course
        // POST: /api/courses/1/messages
        [HttpPost]
        public async Task<IActionResult> SendMessage(int courseId, [FromBody] Message input)
        {
            input.CourseId = courseId;
            input.Timestamp = DateTime.UtcNow;

            _db.Messages.Add(input);
            await _db.SaveChangesAsync();

            return Ok(new { success = true });
        }
    }
}
