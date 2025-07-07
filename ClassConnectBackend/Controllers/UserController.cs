// this file is used to manage user accounts, including creating, updating, deleting, and enrolling users in courses.
using Microsoft.AspNetCore.Mvc;
using ClassConnectBackend.Models;
using ClassConnectBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace ClassConnectBackend.Controllers
{
    // APIController attribute indicates that this controller responds to web API requests
    [ApiController]
    // Route attribute defines the base URL for this controller
    // e.g. http://localhost:5000/api/users
    // This means all actions in this controller will be prefixed with "api/users"
    [Route("api/users")]
    // UserController is a instance of ControllerBase
    public class UsersController : ControllerBase
    {
        // private because we don't want to expose the database context outside this controller
        private readonly AppDbContext _db;

        // Constructor injection to get the database context
        // This allows us to use the database context in our actions
        public UsersController(AppDbContext db) => _db = db;

        // post is to create a new user
        [HttpPost]
        public async Task<IActionResult> Create(User user)
        {   
            _db.Users.Add(user);
            // await is used to asynchronously save changes to the database
            // so that the database operation does not block the thread
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
        }

        // get {id} is to get a user by id
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> Get(int id)
        {
            // access the users relation
            var user = await _db.Users
                .Include(u => u.EnrolledCourses)
                .FirstOrDefaultAsync(u => u.Id == id);

            // ok() returns a 200 OK response with the user data
            return user == null ? NotFound() : Ok(user);
        }

        // put {id} is to update a user by id
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, User updated)
        {
            if (id != updated.Id) return BadRequest();

            var user = await _db.Users
                .Include(u => u.EnrolledCourses)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            // updates the user properties with the values from the edit form.
            user.Name = updated.Name;
            user.Bio = updated.Bio;
            user.Year = updated.Year; // e.g. "Freshman", "Senior", etc.
            user.Major = updated.Major; // e.g. "Computer Science"
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // delete {id} is to delete a user by id
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // Enroll user in a course
        [HttpPost("{userId}/enroll/{courseId}")]
        public async Task<IActionResult> Enroll(int userId, int courseId)
        {
            var user = await _db.Users
                .Include(u => u.EnrolledCourses)
                .FirstOrDefaultAsync(u => u.Id == userId);
            // finds the course by its ID
            var course = await _db.Courses.FindAsync(courseId);
            // if user or course is not found, return 404 Not Found
            if (user == null || course == null) return NotFound();
            // if the user is not already enrolled in the course, add it to their enrolled courses
            // and save the changes to the database
            if (!user.EnrolledCourses.Contains(course))
            {
                user.EnrolledCourses.Add(course);
                await _db.SaveChangesAsync();
            }

            return Ok(user);
        }

        // Unenroll user from a course
        // This action removes the course from the user's enrolled courses
        [HttpDelete("{userId}/unenroll/{courseId}")]
        public async Task<IActionResult> Unenroll(int userId, int courseId)
        {
            var user = await _db.Users.Include(u => u.EnrolledCourses)
                                    .FirstOrDefaultAsync(u => u.Id == userId);
            var course = await _db.Courses.FindAsync(courseId);

            if (user == null || course == null) return NotFound();

            if (user.EnrolledCourses.Contains(course))
            {
                user.EnrolledCourses.Remove(course);
                await _db.SaveChangesAsync();
            }

            return Ok(user);
        }
    }
}
