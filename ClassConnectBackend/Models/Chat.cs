using System.ComponentModel.DataAnnotations;

namespace ClassConnectBackend.Models
{
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