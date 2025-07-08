namespace ClassConnectBackend.Models {
    public class Message
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int CourseId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Content { get; set; } = "";
        public string FormattedTimestamp => Timestamp.ToLocalTime().ToString("MMM dd, yyyy - hh:mm tt");
    }
}

