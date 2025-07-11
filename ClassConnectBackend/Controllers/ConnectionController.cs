// this file is the controller for managing the connections in the web site.
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClassConnectBackend.Models;
using ClassConnectBackend.Data;

namespace ClassConnectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConnectionController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ConnectionController(AppDbContext db)
        {
            _db = db;
        }

        // Gets all accepted connections for a user
        [HttpGet("accepted/{userId}")]
        public async Task<IActionResult> GetAcceptedConnections(int userId)
        {
            try
            {
                var connections = await _db.Connections
                    .Where(c => (c.RequesterId == userId || c.ReceiverId == userId) && 
                               c.Status == Models.ConnectionStatus.Accepted)
                    .Include(c => c.Requester)
                        .ThenInclude(u => u.EnrolledCourses)
                    .Include(c => c.Receiver)
                        .ThenInclude(u => u.EnrolledCourses)
                    .ToListAsync();

                var result = connections.Select(c =>
                {
                    var other = c.RequesterId == userId ? c.Receiver : c.Requester;
                    return new
                    {
                        Id = c.Id,
                        UserId = other.Id, // The actual user ID for chat creation
                        Name = other.Name ?? "",
                        Major = other.Major ?? "",
                        Year = other.Year ?? "",
                        Avatar = other.ProfilePictureUrl ?? "",
                        Courses = other.EnrolledCourses?.Select(course => course.Name).ToList() ?? new List<string>()
                    };
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAcceptedConnections: {ex.Message}");
                return StatusCode(500, $"Error fetching connections: {ex.Message}");
            }
        }

        // Gets all pending connection requests for a user
        [HttpGet("pending/{userId}")]
        public async Task<IActionResult> GetPendingRequests(int userId)
        {
            try
            {
                var requests = await _db.Connections
                    .Where(c => c.ReceiverId == userId && c.Status == Models.ConnectionStatus.Pending)
                    .Include(c => c.Requester)
                        .ThenInclude(u => u.EnrolledCourses)
                    .ToListAsync();

                var result = requests.Select(c => new
                {
                    Id = c.Id,
                    Name = c.Requester.Name,
                    Major = c.Requester.Major,
                    Year = c.Requester.Year,
                    Avatar = c.Requester.ProfilePictureUrl ?? "",
                    Course = c.Requester.EnrolledCourses.FirstOrDefault()?.Name ?? c.Requester.Major
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching pending requests: {ex.Message}");
            }
        }

        // Gets connection suggestions for a user this will be all the users who are in same courses.
        [HttpGet("suggestions/{userId}")]
        public async Task<IActionResult> GetSuggestions(int userId)
        {
            try
            {
                var existingIds = await _db.Connections
                    .Where(c => c.RequesterId == userId || c.ReceiverId == userId)
                    .Select(c => c.RequesterId == userId ? c.ReceiverId : c.RequesterId)
                    .ToListAsync();

                var suggestions = await _db.Users
                    .Where(u => u.Id != userId && !existingIds.Contains(u.Id))
                    .Include(u => u.EnrolledCourses)
                    .ToListAsync();

                var result = suggestions.Select(s => new
                {
                    Id = s.Id,
                    Name = s.Name,
                    Major = s.Major,
                    Year = s.Year,
                    Avatar = s.ProfilePictureUrl ?? "",
                    Courses = s.EnrolledCourses.Select(course => course.Name).ToList(),
                    MutualConnections = 0
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching suggestions: {ex.Message}");
            }
        }

        // sends a connection request to another user.
        [HttpPost("request")]
        public async Task<IActionResult> SendConnectionRequest([FromBody] ConnectionRequestDto request)
        {
            try
            {
                if (request.RequesterId == request.ReceiverId)
                {
                    return BadRequest("Cannot send connection request to yourself");
                }

                var existingConnection = await _db.Connections
                    .FirstOrDefaultAsync(c => 
                        (c.RequesterId == request.RequesterId && c.ReceiverId == request.ReceiverId) ||
                        (c.RequesterId == request.ReceiverId && c.ReceiverId == request.RequesterId));

                if (existingConnection != null)
                {
                    return BadRequest("Connection already exists or request already sent");
                }

                var connection = new Connection
                {
                    RequesterId = request.RequesterId,
                    ReceiverId = request.ReceiverId,
                    Status = Models.ConnectionStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Connections.Add(connection);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Connection request sent successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error sending connection request: {ex.Message}");
            }
        }

        // accepts a connection request.
        [HttpPost("requests/{id}/accept")]
        public async Task<IActionResult> AcceptConnectionRequest(int id)
        {
            try
            {
                var connection = await _db.Connections.FindAsync(id);
                if (connection == null)
                    return NotFound("Connection request not found");

                connection.Status = Models.ConnectionStatus.Accepted;
                await _db.SaveChangesAsync();

                return Ok(new { message = "Connection request accepted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error accepting connection request: {ex.Message}");
            }
        }

        // rejects a connection request.
        [HttpPost("requests/{id}/reject")]
        public async Task<IActionResult> RejectConnectionRequest(int id)
        {
            try
            {
                var connection = await _db.Connections.FindAsync(id);
                if (connection == null)
                    return NotFound("Connection request not found");

                // Instead of just marking as rejected, we remove the connection entirely
                // This allows the user to send a new request in the future
                _db.Connections.Remove(connection);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Connection request rejected successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error rejecting connection request: {ex.Message}");
            }
        }

        // deletes an existing connection.
        [HttpDelete("{connectionId}")]
        public async Task<IActionResult> RemoveConnection(int connectionId, [FromQuery] int userId)
        {
            try
            {
                var connection = await _db.Connections
                    .FirstOrDefaultAsync(c => c.Id == connectionId && 
                                             (c.RequesterId == userId || c.ReceiverId == userId));

                if (connection == null)
                {
                    return NotFound("Connection not found");
                }

                // Get the other user's ID
                var otherUserId = connection.RequesterId == userId ? connection.ReceiverId : connection.RequesterId;
                
                // Find and delete associated chats
                var chatsToDelete = await _db.Chats
                    .Where(c => (c.User1Id == userId && c.User2Id == otherUserId) ||
                               (c.User1Id == otherUserId && c.User2Id == userId))
                    .Include(c => c.Messages) // Include messages for cascade delete
                    .ToListAsync();

                Console.WriteLine($"Found {chatsToDelete.Count} chats to delete between users {userId} and {otherUserId}");

                // Remove the chats (this will also remove messages due to cascade delete)
                _db.Chats.RemoveRange(chatsToDelete);
                
                // Remove the connection
                _db.Connections.Remove(connection);
                
                await _db.SaveChangesAsync();

                Console.WriteLine($"Successfully removed connection and {chatsToDelete.Count} associated chats");
                return Ok(new { message = "Connection and associated chats removed successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error removing connection: {ex.Message}");
                return StatusCode(500, $"Error removing connection: {ex.Message}");
            }
        }
    }

    public class ConnectionRequestDto
    {
        public int RequesterId { get; set; }
        public int ReceiverId { get; set; }
    }
}
