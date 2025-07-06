using Microsoft.AspNetCore.Mvc;
using ClassConnectBackend.Models;
using ClassConnectBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace ClassConnectBackend.Controllers
{
    [ApiController]
    [Route("api/courses")]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CoursesController(AppDbContext db) => _db = db;

        [HttpPost]
        public async Task<IActionResult> Create(Course course)
        {
            _db.Courses.Add(course);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = course.Id }, course);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> Get(int id)
        {
            var course = await _db.Courses
                .Include(c => c.Members)
                .FirstOrDefaultAsync(c => c.Id == id);

            return course == null ? NotFound() : Ok(course);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Course>>> GetAll()
        {
            return await _db.Courses.Include(c => c.Members).ToListAsync();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Course updated)
        {
            if (id != updated.Id) return BadRequest();

            var course = await _db.Courses.FindAsync(id);
            if (course == null) return NotFound();

            course.Name = updated.Name;
            course.Description = updated.Description;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var course = await _db.Courses.FindAsync(id);
            if (course == null) return NotFound();

            _db.Courses.Remove(course);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
