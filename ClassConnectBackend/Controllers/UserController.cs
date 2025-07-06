using Microsoft.AspNetCore.Mvc;
using ClassConnectBackend.Models;
using ClassConnectBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace ClassConnectBackend.Controllers {
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db) => _db = db;

        [HttpPost]
        public async Task<IActionResult> Create(User user)
        {
            // You'd hash the password here!
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
            _db.Entry(updated).State = EntityState.Modified;
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
    }       
}   
