// the model for a course in the ClassConnect application
// it contains properties for the course ID, code, name, department, professor, description,
// and lists of members and messages associated with the course
// this model is used to represent a course in the application and interact with the database
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
        public List<Message> Messages { get; set; } = new();
    }
}

