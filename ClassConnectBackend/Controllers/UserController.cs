using Microsoft.AspNetCore.Mvc;
using ClassConnectBackend.Models;
using ClassConnectBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace ClassConnectBackend.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db) => _db = db;

        [HttpPost]
        public async Task<IActionResult> Create(User user)
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> Get(int id)
        {
            var user = await _db.Users
                .Include(u => u.EnrolledCourses)
                .FirstOrDefaultAsync(u => u.Id == id);

            return user == null ? NotFound() : Ok(user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, User updated)
        {
            if (id != updated.Id) return BadRequest();

            var user = await _db.Users
                .Include(u => u.EnrolledCourses)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            user.Name = updated.Name;
            user.Bio = updated.Bio;
            user.Year = updated.Year; // e.g. "Freshman", "Senior", etc.
            user.Major = updated.Major; // e.g. "Computer Science"
            // Don't update email/password here without validation

            // Optional: update courses if needed
            // user.EnrolledCourses = await _db.Courses
            //     .Where(c => updated.EnrolledCourses.Select(ec => ec.Id).Contains(c.Id))
            //     .ToListAsync();

            await _db.SaveChangesAsync();
            return NoContent();
        }

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
            var course = await _db.Courses.FindAsync(courseId);

            if (user == null || course == null) return NotFound();

            if (!user.EnrolledCourses.Contains(course))
            {
                user.EnrolledCourses.Add(course);
                await _db.SaveChangesAsync();
            }

            return Ok(user);
        }
    }
}
