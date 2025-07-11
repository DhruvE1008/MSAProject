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

    public enum ConnectionStatus
    {
        Pending,
        Accepted,
        Rejected
    }
}
