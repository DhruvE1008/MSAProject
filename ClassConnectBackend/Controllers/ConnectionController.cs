// this file is the controller for managing the connections in the web site.
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
    public class ConnectionController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<ConnectionHub> _connectionHubContext;

        public ConnectionController(AppDbContext db, IHubContext<ConnectionHub> connectionHubContext)
        {
            _db = db;
            _connectionHubContext = connectionHubContext;
        }

        // Gets all accepted connections for a user
        [HttpGet("accepted/{userId}")]
        public async Task<IActionResult> GetAcceptedConnections(int userId)
        {
            try
            {
                // gets the connections from the datbase
                // gets the connection where the user is either the requester or the receiver
                // and the status is accepted
                var connections = await _db.Connections
                    .Where(c => (c.RequesterId == userId || c.ReceiverId == userId) && 
                               c.Status == Models.ConnectionStatus.Accepted)
                    .Include(c => c.Requester)
                    .Include(c => c.Receiver)
                    .ToListAsync();

                // selects the data of each user that the current user is connected to
                // and returns the data in a list of anonymous objects through ToList()
                var result = connections.Select(c => new
                {
                    Id = c.Id,
                    UserId = c.RequesterId == userId ? c.ReceiverId : c.RequesterId,
                    Name = c.RequesterId == userId ? c.Receiver.Name : c.Requester.Name,
                    Major = c.RequesterId == userId ? c.Receiver.Major : c.Requester.Major,
                    Year = c.RequesterId == userId ? c.Receiver.Year : c.Requester.Year,
                    Avatar = c.RequesterId == userId ? c.Receiver.ProfilePictureUrl : c.Requester.ProfilePictureUrl,
                    Courses = c.RequesterId == userId ? 
                        c.Receiver.EnrolledCourses.Select(ec => ec.Name).ToList() : 
                        c.Requester.EnrolledCourses.Select(ec => ec.Name).ToList()
                }).ToList();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fetching connections: {ex.Message}");
            }
        }

        // Gets all pending connection requests for a user
        [HttpGet("pending/{userId}")]
        public async Task<IActionResult> GetPendingRequests(int userId)
        {
            try
            {
                // gets the connections in the database where the status is pending
                var pendingRequests = await _db.Connections
                    .Where(c => c.ReceiverId == userId && c.Status == Models.ConnectionStatus.Pending)
                    .Include(c => c.Requester)
                    .ThenInclude(r => r.EnrolledCourses)
                    .ToListAsync();

                // selects the data of each pending request and returns it in a list of anonymous objects
                // this will include the requester's name, major, year, avatar and course
                var result = pendingRequests.Select(c => new
                {
                    Id = c.Id,
                    Name = c.Requester.Name,
                    Major = c.Requester.Major,
                    Year = c.Requester.Year,
                    Avatar = c.Requester.ProfilePictureUrl ?? "",
                    Course = c.Requester.EnrolledCourses.FirstOrDefault()?.Name ?? "No courses"
                }).ToList();
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
                // gets the IDs of users in the database.
                var existingIds = await _db.Connections
                    .Where(c => c.RequesterId == userId || c.ReceiverId == userId)
                    .Select(c => c.RequesterId == userId ? c.ReceiverId : c.RequesterId)
                    .ToListAsync();

                // gets the users who are not the current user and are not already connected
                // and are in the user's enrolled courses.
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
                    // Placeholder for mutual connections count, can be implemented later
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

                // get the existing connection to check if it already exists
                // this will check if there is already a connection request sent or accepted between the two users
                var existingConnection = await _db.Connections
                    .FirstOrDefaultAsync(c => 
                        (c.RequesterId == request.RequesterId && c.ReceiverId == request.ReceiverId) ||
                        (c.RequesterId == request.ReceiverId && c.ReceiverId == request.RequesterId));

                if (existingConnection != null)
                {
                    return BadRequest("Connection already exists or request already sent");
                }

                // Get user details for notifications
                var requester = await _db.Users.FindAsync(request.RequesterId);
                var receiver = await _db.Users.FindAsync(request.ReceiverId);

                if (requester == null || receiver == null)
                {
                    return BadRequest("One or both users not found");
                }

                // Create a new connection request
                var connection = new Connection
                {
                    RequesterId = request.RequesterId,
                    ReceiverId = request.ReceiverId,
                    Status = Models.ConnectionStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                // add the connection request to the database
                _db.Connections.Add(connection);
                await _db.SaveChangesAsync();

                // Send targeted WebSocket notifications
                try
                {
                    // Notify the SENDER that their request was sent
                    // look at ConnectionHub.cs for better understanding of how the notifications
                    // work in real time.
                    await _connectionHubContext.Clients.Group($"User_{request.RequesterId}")
                        .SendAsync("ConnectionRequestSent", new
                        {
                            connectionId = connection.Id,
                            requesterId = request.RequesterId,
                            receiverId = request.ReceiverId,
                            receiverName = receiver.Name,
                            message = $"Connection request sent to {receiver.Name}"
                        });

                    // Notify the RECEIVER that they have a new request
                    await _connectionHubContext.Clients.Group($"User_{request.ReceiverId}")
                        .SendAsync("ConnectionRequestReceived", new
                        {
                            connectionId = connection.Id,
                            requesterId = request.RequesterId,
                            receiverId = request.ReceiverId,
                            requesterName = requester.Name,
                            requesterMajor = requester.Major,
                            requesterYear = requester.Year,
                            requesterAvatar = requester.ProfilePictureUrl ?? "",
                            message = $"New connection request from {requester.Name}"
                        });

                    // Also send to all users for general updates (like suggestions)
                    await _connectionHubContext.Clients.All.SendAsync("ConnectionRequestSent", new
                    {
                        connectionId = connection.Id,
                        requesterId = request.RequesterId,
                        receiverId = request.ReceiverId
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error sending WebSocket notification: {ex.Message}");
                }

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
                // gets the connection request from the database
                var connection = await _db.Connections
                    .Include(c => c.Requester)
                    .Include(c => c.Receiver)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (connection == null)
                    return NotFound("Connection request not found");

                // set the status of the connection to accepted
                connection.Status = Models.ConnectionStatus.Accepted;
                await _db.SaveChangesAsync();

                // Send targeted WebSocket notifications
                try
                {
                    // Notify the REQUESTER that their request was accepted
                    await _connectionHubContext.Clients.Group($"User_{connection.RequesterId}")
                        .SendAsync("ConnectionAccepted", new
                        {
                            connectionId = connection.Id,
                            requesterId = connection.RequesterId,
                            receiverId = connection.ReceiverId,
                            message = $"{connection.Receiver.Name} accepted your connection request"
                        });

                    // Notify the RECEIVER (person who accepted) to update their UI
                    await _connectionHubContext.Clients.Group($"User_{connection.ReceiverId}")
                        .SendAsync("ConnectionAccepted", new
                        {
                            connectionId = connection.Id,
                            requesterId = connection.RequesterId,
                            receiverId = connection.ReceiverId,
                            message = $"You accepted {connection.Requester.Name}'s connection request"
                        });

                    // Also send to all users for general updates
                    await _connectionHubContext.Clients.All.SendAsync("ConnectionAccepted", new
                    {
                        connectionId = connection.Id,
                        requesterId = connection.RequesterId,
                        receiverId = connection.ReceiverId
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error sending WebSocket notification: {ex.Message}");
                }

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
                var connection = await _db.Connections
                    .Include(c => c.Requester)
                    .Include(c => c.Receiver)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (connection == null)
                    return NotFound("Connection request not found");

                var requesterId = connection.RequesterId;
                var receiverId = connection.ReceiverId;

                // Remove the connection request from the database
                _db.Connections.Remove(connection);
                await _db.SaveChangesAsync();

                // Send targeted WebSocket notifications
                try
                {
                    // Notify the REQUESTER that their request was rejected
                    await _connectionHubContext.Clients.Group($"User_{requesterId}")
                        .SendAsync("ConnectionRejected", new
                        {
                            connectionId = id,
                            requesterId = requesterId,
                            receiverId = receiverId,
                            message = $"{connection.Receiver.Name} declined your connection request"
                        });

                    // Notify the RECEIVER (person who rejected) to update their UI
                    await _connectionHubContext.Clients.Group($"User_{receiverId}")
                        .SendAsync("ConnectionRejected", new
                        {
                            connectionId = id,
                            requesterId = requesterId,
                            receiverId = receiverId,
                            message = $"You declined {connection.Requester.Name}'s connection request"
                        });

                    // Also send to all users for general updates
                    await _connectionHubContext.Clients.All.SendAsync("ConnectionRejected", new
                    {
                        connectionId = id,
                        requesterId = requesterId,
                        receiverId = receiverId
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error sending WebSocket notification: {ex.Message}");
                }

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
                    .Include(c => c.Requester)
                    .Include(c => c.Receiver)
                    .FirstOrDefaultAsync(c => c.Id == connectionId && 
                                             (c.RequesterId == userId || c.ReceiverId == userId) &&
                                             c.Status == Models.ConnectionStatus.Accepted);

                if (connection == null)
                {
                    return NotFound("Connection not found or you don't have permission to delete it");
                }

                // Get the other user's ID
                var otherUserId = connection.RequesterId == userId ? connection.ReceiverId : connection.RequesterId;
                var currentUserName = connection.RequesterId == userId ? connection.Requester.Name : connection.Receiver.Name;
                
                // Find and delete associated chats
                var chatsToDelete = await _db.Chats
                    .Where(c => (c.User1Id == userId && c.User2Id == otherUserId) ||
                               (c.User1Id == otherUserId && c.User2Id == userId))
                    .Include(c => c.Messages) // Include messages for cascade delete
                    .ToListAsync();

                // Remove the chats (this will also remove messages due to cascade delete)
                _db.Chats.RemoveRange(chatsToDelete);
                
                // Remove the connection
                _db.Connections.Remove(connection);
                
                await _db.SaveChangesAsync();

                // Send WebSocket notifications to both users
                try
                {
                    await _connectionHubContext.Clients.All.SendAsync("ConnectionRemoved", new
                    {
                        connectionId = connectionId,
                        removedByUserId = userId,
                        affectedUserId = otherUserId,
                        message = $"{currentUserName} removed the connection"
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error sending WebSocket notification: {ex.Message}");
                }

                return Ok(new { message = "Connection and associated chats removed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error removing connection: {ex.Message}");
            }
        }
    }

    // Data Transfer Object (DTO) for connection requests
    // this is used to validate the data sent from the client
    // it ensures that the client sends the correct data and prevents errors
    // it is also used to ensure that the data is in the correct format
    public class ConnectionRequestDto
    {
        public int RequesterId { get; set; }
        public int ReceiverId { get; set; }
    }
}
