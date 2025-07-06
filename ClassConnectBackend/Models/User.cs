namespace ClassConnectBackend.Models {
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Bio { get; set; } = "";
        public string PasswordHash { get; set; } = "";

        public string Year { get; set; } = "";   // e.g. "Freshman", "Senior", etc.
        public string Major { get; set; } = "";  // e.g. "Computer Science"

        public List<Course> EnrolledCourses { get; set; } = new();
    }
}
