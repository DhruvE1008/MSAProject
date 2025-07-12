// this file is the middleware for the backend API
// It sets up the database, CORS, and API endpoints
// It also runs EF Core migrations on startup
using Microsoft.EntityFrameworkCore;
using ClassConnectBackend.Data;
using Microsoft.AspNetCore.Identity; // Make sure this is at the top
using ClassConnectBackend.Models;    // Make sure this is at the top
using ClassConnectBackend.Hubs; // Add this using directive for SignalR

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
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173") // Add your React app URLs
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Important for SignalR
    });
});

builder.Services.AddSignalR(); // Add SignalR services
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

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

// IMPORTANT: Middleware order matters for SignalR
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthorization();

// Map controllers to handle incoming requests
app.MapControllers();

// Map SignalR hub
app.MapHub<ChatHub>("/chatHub");

// Add debug line to confirm hub is mapped
Console.WriteLine("SignalR Hub mapped to /chatHub");

// runs the backend application
app.Run();
