// this file is for the many-to-many relationship between users and courses
namespace ClassConnectBackend.Models
{
    public class EnrollRequest
    {
        public int CourseId { get; set; }
        public int UserId { get; set; }
    }
}
