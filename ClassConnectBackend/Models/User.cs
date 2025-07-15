// dataannotations.schema is used for the NotMapped attribute
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassConnectBackend.Models {
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Bio { get; set; } = "";
        public string PasswordHash { get; set; } = "";
        public string Username { get; set; } = ""; // e.g. "john_doe"
        public string Year { get; set; } = "";   // e.g. "Freshman", "Senior", etc.
        public string Major { get; set; } = "";  // e.g. "Computer Science"
        public string ProfilePictureUrl { get; set; } = ""; // URL to profile picture
        public List<Course> EnrolledCourses { get; set; } = new();

        // will be used in the frontend to get the user's password when authenticating the account.
        [NotMapped]
        public string? Password { get; set; } // Not mapped to the database, used for user input only
    }
}
