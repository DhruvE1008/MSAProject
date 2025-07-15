// this file was used to manage real-time chat functionality using SignalR and websockets
using Microsoft.AspNetCore.SignalR;

namespace ClassConnectBackend.Hubs
{
    public class ChatHub : Hub

    // the mwthods in this class are used to manage real-time chat functionality
    // this happens through SignalR, which allows for real-time communication between the server and clients
    {
        // this method is called when a user sends a message to a specific course chat
        public async Task JoinCourseGroup(string courseId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"course_{courseId}");
        }

        // this method is called when a user leaves a specific course chat
        public async Task LeaveCourseGroup(string courseId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"course_{courseId}");
        }

        // this method is called when a user sends a private message to another user
        public async Task JoinPrivateChat(string chatId)
        {
            var groupName = $"chat_{chatId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }
        
        // this method is called when a user leaves a private chat
        public async Task LeavePrivateChat(string chatId)
        {
            var groupName = $"chat_{chatId}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}