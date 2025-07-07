// this file is the middleware for the backend API
// It sets up the database, CORS, and API endpoints
// It also runs EF Core migrations on startup
using Microsoft.EntityFrameworkCore;
using ClassConnectBackend.Data;

// web application builder that sets up the application
var builder = WebApplication.CreateBuilder(args);

// sets up the builder configuration
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddUserSecrets<Program>(optional: true)
    .AddEnvironmentVariables();

// Connection string to connect the backend to the PostgreSQL database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });


// CORS is what allows the frontend to make requests to the backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// EF Core migrations are used here to ensure the database schema is up-to-date
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// swagger is used to generate API documentation and a UI for testing the API
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use routing to map incoming requests to the appropriate controllers
app.UseHttpsRedirection();

// ✅ Apply CORS here
app.UseCors("AllowFrontend");

// Use authentication and authorization middleware
app.UseAuthorization();

// Map controllers to handle incoming requests
app.MapControllers();

// runs the backend application
app.Run();
