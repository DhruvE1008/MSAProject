// this file was used to manage real-time chat functionality using SignalR and websockets
using Microsoft.AspNetCore.SignalR;

namespace ClassConnectBackend.Hubs
{
    public class ChatHub : Hub
    {
        // this method is called when a user sends a message to a specific course chat
        public async Task JoinCourseGroup(string courseId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"course_{courseId}");
            Console.WriteLine($"User {Context.ConnectionId} joined course group: course_{courseId}");
        }

        // this method is called when a user leaves a specific course chat
        public async Task LeaveCourseGroup(string courseId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"course_{courseId}");
            Console.WriteLine($"User {Context.ConnectionId} left course group: course_{courseId}");
        }

        // this method is called when a user sends a private message to another user
        public async Task JoinPrivateChat(string chatId)
        {
            var groupName = $"chat_{chatId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            Console.WriteLine($"User {Context.ConnectionId} joined private chat group: {groupName}");
        }
        
        // this method is called when a user leaves a private chat
        public async Task LeavePrivateChat(string chatId)
        {
            var groupName = $"chat_{chatId}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            Console.WriteLine($"User {Context.ConnectionId} left private chat group: {groupName}");
        }

        // this was for testing purposes to check if the connection is working
        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"User connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        // also for testing purposes to check if the disconnection is working
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine($"User disconnected: {Context.ConnectionId}");
            if (exception != null)
            {
                Console.WriteLine($"Disconnection exception: {exception.Message}");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}