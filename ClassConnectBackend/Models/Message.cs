// the model for a message in the ClassConnect application
// it contains properties for the message ID, sender ID, course ID, timestamp, content,
// and a navigation property to the sender user
// this model is used to represent a message in the application and interact with the database
using System;
namespace ClassConnectBackend.Models {
    public class Message
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int CourseId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Content { get; set; } = "";
        // formatted timestamp for display purposes
        public string FormattedTimestamp => Timestamp.ToLocalTime().ToString("MMM dd, yyyy - hh:mm tt");
        // the ? after User indicates that this property can be null
        public User Sender { get; set; }
    }
}

