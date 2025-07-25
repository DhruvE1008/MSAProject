using Microsoft.AspNetCore.Mvc;
using ClassConnectBackend.Models;
using ClassConnectBackend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
// connectionHub is used here to notify users regarding course updates
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
            // gets the course with the matching ID from the database
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

            // finds the course with the matching ID in the database
            var course = await _db.Courses.FindAsync(id);
            if (course == null) return NotFound();

            // updates the course's properties with the new values
            course.Code = updated.Code;
            course.Name = updated.Name;
            course.Department = updated.Department;
            course.Professor = updated.Professor;
            course.Description = updated.Description;

            // saves the changes to the database
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

        // used to delete a course by its ID
        // this will also remove the course from all users' enrolled courses
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // finds the course with the matching ID in the database
            var course = await _db.Courses.FindAsync(id);
            if (course == null) return NotFound();

            // removes the course from the database and saves the changes
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
            // gets the course and the enrolled users from the database
            var course = await _db.Courses
                .Include(c => c.Members)
                .FirstOrDefaultAsync(c => c.Id == request.CourseId);
            // gets the user who is unenrolling from the course
            var user = await _db.Users
                .Include(u => u.EnrolledCourses)
                .FirstOrDefaultAsync(u => u.Id == request.UserId);

            if (course == null || user == null)
                return NotFound("Course or user not found");

            // removes the user from the list of members in the course
            // removes the course from the user's enrolled courses
            // this is a many-to-many relationship so we need to remove the user from the course's
            //  members and the course from the user's enrolled courses
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
            // gets all the courses that has a member with the matching userId
            // the .ToListAsync() method is used to execute the query and return the results as a list
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
