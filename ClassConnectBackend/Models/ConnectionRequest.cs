namespace ClassConnectBackend.Models {
    public class ConnectionRequest
    {
        public int Id { get; set; }
        public int FromUserId { get; set; }
        public int ToUserId { get; set; }
        public string Status { get; set; } = "Pending";
    }
}

