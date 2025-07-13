using Microsoft.AspNetCore.Mvc;
using ClassConnectBackend.Models;
using ClassConnectBackend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using ClassConnectBackend.Hubs; // <-- Add this for your ConnectionHub

namespace ClassConnectBackend.Controllers
{
    [ApiController]
    [Route("api/courses")]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<ConnectionHub> _hub; // Inject the hub

        public CoursesController(AppDbContext db, IHubContext<ConnectionHub> hub)
        {
            _db = db;
            _hub = hub;
        }

        [HttpPost]
        public async Task<IActionResult> Create(Course course)
        {
            _db.Courses.Add(course);
            await _db.SaveChangesAsync();

            // Notify all users (or filter as needed)
            await _hub.Clients.All.SendAsync("CourseCreated", new
            {
                course.Id,
                course.Code,
                course.Name,
                course.Department,
                course.Professor,
                course.Description
            });

            return CreatedAtAction(nameof(Get), new { id = course.Id }, course);
        }

        // to get a course by its ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> Get(int id)
        {
            var course = await _db.Courses
                .Where(c => c.Id == id)
                .Select(c => new 
                {
                    c.Id,
                    c.Code,
                    c.Name,
                    c.Department,
                    c.Professor,
                    c.Description,
                    StudentCount = c.Members.Count()
                })
                .FirstOrDefaultAsync();

            if (course == null) return NotFound();

            return Ok(course);
        }

        // to get all courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Course>>> GetAll()
        {
            var courses = await _db.Courses
                .Select(c => new
                {
                    c.Id,
                    c.Code,
                    c.Name,
                    c.Department,
                    c.Professor,
                    c.Description,
                    StudentCount = c.Members.Count()
                })
                .ToListAsync();

            return Ok(courses);
        }

        // to update a course by its ID
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Course updated)
        {
            if (id != updated.Id) return BadRequest();

            var course = await _db.Courses.FindAsync(id);
            if (course == null) return NotFound();

            course.Code = updated.Code;
            course.Name = updated.Name;
            course.Department = updated.Department;
            course.Professor = updated.Professor;
            course.Description = updated.Description;

            await _db.SaveChangesAsync();

            // Notify all users (or filter as needed)
            await _hub.Clients.All.SendAsync("CourseUpdated", new
            {
                course.Id,
                course.Code,
                course.Name,
                course.Department,
                course.Professor,
                course.Description
            });

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var course = await _db.Courses.FindAsync(id);
            if (course == null) return NotFound();

            _db.Courses.Remove(course);
            await _db.SaveChangesAsync();

            // Notify all users (or filter as needed)
            await _hub.Clients.All.SendAsync("CourseDeleted", new { courseId = id });

            return NoContent();
        }

        // removes the user from the course and the course from the user's enrolled courses
        [HttpPost("unenroll")]
        public async Task<IActionResult> UnenrollUser([FromBody] EnrollRequest request)
        {
            var course = await _db.Courses
                .Include(c => c.Members)
                .FirstOrDefaultAsync(c => c.Id == request.CourseId);
            var user = await _db.Users
                .Include(u => u.EnrolledCourses)
                .FirstOrDefaultAsync(u => u.Id == request.UserId);

            if (course == null || user == null)
                return NotFound("Course or user not found");

            course.Members.Remove(user);
            user.EnrolledCourses.Remove(course);

            await _db.SaveChangesAsync();

            // Notify the user who was unenrolled
            await _hub.Clients.User(request.UserId.ToString()).SendAsync("UserUnenrolled", new
            {
                courseId = course.Id,
                courseName = course.Name
            });

            return Ok("User unenrolled successfully");
        }

        // basically gets all the courses that a user is enrolled in
        // GET: api/courses/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCoursesForUser(int userId)
        {
            var courses = await _db.Courses
                .Where(c => c.Members.Any(m => m.Id == userId))
                .Select(c => new
                {
                    c.Id,
                    c.Code,
                    c.Name,
                    c.Department,
                    c.Professor,
                    c.Description,
                    StudentCount = c.Members.Count()
                })
                .ToListAsync();

            return Ok(courses);
        }


    }
}
