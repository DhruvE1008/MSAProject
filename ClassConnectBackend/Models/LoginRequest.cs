// basically a Data Transfer Object (DTO) for login requests
namespace ClassConnectBackend.Models
{
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
