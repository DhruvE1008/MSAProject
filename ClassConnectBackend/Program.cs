// this file is the middleware for the backend API
// It sets up the database, CORS, and API endpoints
// It also runs EF Core migrations on startup
using Microsoft.EntityFrameworkCore;
using ClassConnectBackend.Data;
using Microsoft.AspNetCore.Identity;
using ClassConnectBackend.Models;
using ClassConnectBackend.Hubs; // Add this using directive for SignalR

// web application builder that sets up the application
var builder = WebApplication.CreateBuilder(args);

// sets up the builder configuration
// This allows the application to read configuration settings from appsettings.json and environment variables
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddUserSecrets<Program>(optional: true)
    .AddEnvironmentVariables();

// Connection string to connect the backend to the PostgreSQL database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// adds the database context to the service container
// This allows the application to use the AppDbContext for database operations
// It uses the connection string to connect to the PostgreSQL database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// add the controllers to the service container so that the application can handle HTTP requests
// between the frontend and backend
builder.Services.AddControllers();
// adds the API Explorer to the service container
// used for allowing the frontend to discover the API endpoints
builder.Services.AddEndpointsApiExplorer();
// swagger is for testing
builder.Services.AddSwaggerGen();
// allows the application to use the JSON serializer for JSON serialization
// This is used for serializing and deserializing JSON data in API requests and responses
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Add SignalR with better configuration
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true; // Enable detailed errors for debugging
    options.KeepAliveInterval = TimeSpan.FromSeconds(15); // Set keep-alive interval to prevent disconnections
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30); // Set client timeout interval to detect disconnections
});

// CORS allows the frontend to communicate with the backend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Get allowed origins from configuration
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() 
                           ?? new[] { "http://localhost:3000", "http://localhost:5173" };
        
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader() // allows any headers including custom headers
              .AllowAnyMethod()  // allows any HTTP methods (GET, POST, PUT, DELETE, etc.)
              .AllowCredentials()  // Important for SignalR; allows cookies and authentication from frontend
              .WithExposedHeaders("*") // allows the frontend to read all response headers
              .SetPreflightMaxAge(TimeSpan.FromSeconds(3600)); // caches preflight requests for 1 hour
    });
});

// makes it so that the passwords are hashed using the PasswordHasher
// AddScoped registers the PasswordHasher service with a scoped lifetime
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// builds the application
var app = builder.Build();

// EF Core migrations are used here to ensure the database schema is up-to-date
// createscope creates a scope for the database context
// This is necessary to ensure the database context is disposed of properly after use
// It applies any pending migrations to the database at startup
using (var scope = app.Services.CreateScope())
{
    // service provider retrieves the AppDbContext from the service container
    // This allows the application to interact with the database
    // The GetRequiredService method ensures that the AppDbContext is available
    // If it's not registered, an exception will be thrown
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // applies any pending migrations to the database
    // This ensures that the database schema is up-to-date with the application's model
    // If there are any pending migrations, they will be applied automatically
    // This is useful for development and deployment scenarios
    db.Database.Migrate();
}

// swagger is used to generate API documentation and a UI for testing the API
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// IMPORTANT: Middleware order matters for SignalR
// userouting() sets up the routing for the application
// This allows the application to handle incoming HTTP requests and route them to the appropriate controllers
// UseCors("AllowFrontend") applies the CORS policy defined earlier
// UseAuthorization() enables authorization for the application
app.UseRouting();
// UseCors("AllowFrontend") allows the frontend to communicate with the backend
// This is necessary for the frontend to make API requests to the backend
// It allows the frontend to access the backend resources and APIs
app.UseCors("AllowFrontend");
// UseAuthentication() enables authentication for the application
// This allows the application to authenticate users and authorize access to resources
app.UseAuthorization();

// Map controllers to handle incoming requests
app.MapControllers();

// Map SignalR hubs
app.MapHub<ChatHub>("/chatHub");
app.MapHub<ConnectionHub>("/connectionHub"); 


// runs the backend application
app.Run();
