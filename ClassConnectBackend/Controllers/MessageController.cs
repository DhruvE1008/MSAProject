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
                .OrderBy(m => m.Timestamp)
                .ToListAsync();

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
