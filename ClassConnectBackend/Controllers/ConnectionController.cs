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
                        Name = other.Name,
                        Major = other.Major,
                        Year = other.Year,
                        Avatar = other.ProfilePictureUrl ?? "",
                        Courses = other.EnrolledCourses.Select(course => course.Name).ToList()
                    };
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching connections: {ex.Message}");
            }
        }

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

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveConnection(int id)
        {
            try
            {
                var connection = await _db.Connections.FindAsync(id);
                if (connection == null)
                    return NotFound("Connection not found");

                _db.Connections.Remove(connection);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Connection removed successfully" });
            }
            catch (Exception ex)
            {
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
