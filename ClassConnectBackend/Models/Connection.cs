// this file defines the data models for connections between users in the ClassConnect application
namespace ClassConnectBackend.Models
{
    public class Connection
    {
        public int Id { get; set; }
        public int RequesterId { get; set; }
        public int ReceiverId { get; set; }
        public ConnectionStatus Status { get; set; } = ConnectionStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User Requester { get; set; }
        public User Receiver { get; set; }
    }

    // the potential statuses for a connection
    // Pending: connection request sent but not yet accepted or rejected
    // Accepted: connection request accepted by the receiver
    // Rejected: connection request rejected by the receiver
    public enum ConnectionStatus
    {
        Pending,
        Accepted,
        Rejected
    }
}
