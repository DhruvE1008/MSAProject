using Microsoft.AspNetCore.SignalR;

namespace ClassConnectBackend.Hubs
{
    public class ConnectionHub : Hub
    {
        public async Task JoinUserGroup(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            Console.WriteLine($"✅ User {userId} joined their group (Connection: {Context.ConnectionId})");
        }

        public async Task LeaveUserGroup(string userId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
            Console.WriteLine($"❌ User {userId} left their group (Connection: {Context.ConnectionId})");
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"🔗 SignalR Connection established: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine($"🔗 SignalR Connection disconnected: {Context.ConnectionId}");
            if (exception != null)
            {
                Console.WriteLine($"❌ Disconnection reason: {exception.Message}");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}