// this file defines the data models for private chat functionality in the ClassConnect application
// data annotations are used to validate the data and ensure it meets certain criteria
using System.ComponentModel.DataAnnotations;

namespace ClassConnectBackend.Models
{
    // the chat model represents a private chat between two users
    // it contains properties for the chat ID, user IDs of the participants, and timestamps
    // it also includes navigation properties to link to the users and messages in the chat
    public class Chat
    {
        public int Id { get; set; }
        public int User1Id { get; set; }
        public int User2Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public User User1 { get; set; } = null!;
        public User User2 { get; set; } = null!;
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }

    // the message class represents the data for a message in a private chat
    // it includes properties for the message ID, chat ID, sender ID, content, timestamp, and read status
    // it also has navigation properties to link to the chat and the sender user
    public class ChatMessage
    {
        public int Id { get; set; }
        public int ChatId { get; set; }
        public int SenderId { get; set; }
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
        
        // Navigation properties
        public Chat Chat { get; set; } = null!;
        public User Sender { get; set; } = null!;
    }
}