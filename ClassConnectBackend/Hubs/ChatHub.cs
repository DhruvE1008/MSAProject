using Microsoft.AspNetCore.SignalR;

namespace ClassConnectBackend.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message, int courseId)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message, courseId);
        }
        
        public async Task JoinCourse(string courseId)
        {
            // Fix the warning by ensuring courseId is not null
            if (!string.IsNullOrEmpty(courseId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Course_{courseId}");
            }
        }
        
        public async Task LeaveCourse(string courseId)
        {
            if (!string.IsNullOrEmpty(courseId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Course_{courseId}");
            }
        }
    }
}