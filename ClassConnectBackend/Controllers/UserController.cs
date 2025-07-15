// this file is used to manage user accounts, including creating, updating, deleting, and enrolling users in courses.
using Microsoft.AspNetCore.Mvc;
using ClassConnectBackend.Models;
using ClassConnectBackend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;


namespace ClassConnectBackend.Controllers
{
    // APIController attribute indicates that this controller responds to web API requests
    [ApiController]
    // Route attribute defines the base URL for this controller
    // e.g. http://localhost:5082/api/users
    // This means all actions in this controller will be prefixed with "api/users"
    [Route("api/users")]
    // UserController is a instance of ControllerBase
    public class UsersController : ControllerBase
    {
        // private because we don't want to expose the database context outside this controller
        private readonly AppDbContext _db;
        private readonly IPasswordHasher<User> _passwordHasher;

        // Constructor injection to get the database context
        // This allows us to use the database context in our actions
        public UsersController(AppDbContext db, IPasswordHasher<User> passwordHasher)
        {
            _db = db;
            _passwordHasher = passwordHasher;
        }

        // post is to create a new user
        [HttpPost]
        public async Task<IActionResult> Create(User user)
        {
            // Check if email already exists (case-insensitive)
            var existingUser = await _db.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == user.Email.ToLower());

            if (existingUser != null)
            {
                // Email already in use
                return Conflict(new { message = "Email is already registered." });
            }

            // Generate a random DiceBear avatar
            var randomSeed = Guid.NewGuid().ToString(); // random string
            var avatarUrl = $"https://api.dicebear.com/8.x/bottts/png?seed={randomSeed}";

            user.ProfilePictureUrl = avatarUrl;

            user.PasswordHash = _passwordHasher.HashPassword(user, user.Password); // Hash the password before saving
            _db.Users.Add(user);
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
            user.Year = updated.Year; 
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

        // Get all courses a user is enrolled in
        [HttpGet("{id}/courses")]
        public async Task<ActionResult<IEnumerable<Course>>> GetUserCourses(int id)
        {
            var user = await _db.Users
                .Include(u => u.EnrolledCourses)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound();

            return Ok(user.EnrolledCourses);
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            // Find user by email (case-insensitive)
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == loginRequest.Email.ToLower());

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var passwordVerificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, loginRequest.Password);

            if (passwordVerificationResult == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // Optionally generate JWT token here for auth, or just return user data
            return Ok(user);
        }
    }
}
