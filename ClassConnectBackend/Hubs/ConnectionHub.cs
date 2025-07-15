// this file is to set up the real time connection page functionality
// so that the users see connection updates immediately instead of needing to refresh the page
using Microsoft.AspNetCore.SignalR;

namespace ClassConnectBackend.Hubs
{
    public class ConnectionHub : Hub
    {
        public async Task JoinUserGroup(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        public async Task LeaveUserGroup(string userId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            if (exception != null)
            {
                Console.WriteLine($"❌ Disconnection reason: {exception.Message}");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}