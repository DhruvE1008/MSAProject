namespace ClassConnectBackend.Models{
    public class Course
    {
        public int Id { get; set; }
        public string Code { get; set; } = ""; // e.g. "CS101"
        public string Name { get; set; } = "";
        public string Department { get; set; } = "";
        public string Professor { get; set; } = ""; // e.g. "Dr. Smith"
        public string Description { get; set; } = "";
        public List<User> Members { get; set; } = new();
    }
}

