// this file sets up the ASP.NET Core application, including services, middleware, and routing.
// It also configures the Entity Framework Core context to connect to a PostgreSQL database.
using Microsoft.EntityFrameworkCore;
using ClassConnectBackend.Models;

namespace ClassConnectBackend.Data
{
    // appdbcontext is the main class that represents the database context
    // It inherits from DbContext and defines the DbSets for each model
    // This is where you configure the database connection and relationships between entities
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<User> Users => Set<User>();
        public DbSet<Course> Courses => Set<Course>();
        public DbSet<ConnectionRequest> ConnectionRequests => Set<ConnectionRequest>();
        public DbSet<Message> Messages => Set<Message>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Many-to-many: User <-> Course
            modelBuilder.Entity<User>()
                .HasMany(u => u.EnrolledCourses)
                .WithMany(c => c.Members);
        }
    }
}
