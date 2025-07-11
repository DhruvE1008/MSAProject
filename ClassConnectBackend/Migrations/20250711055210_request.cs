using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClassConnectBackend.Migrations
{
    /// <inheritdoc />
    public partial class request : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Users_ReceiverId",
                table: "Connections");

            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Users_RequesterId",
                table: "Connections");

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_Users_ReceiverId",
                table: "Connections",
                column: "ReceiverId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_Users_RequesterId",
                table: "Connections",
                column: "RequesterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Users_ReceiverId",
                table: "Connections");

            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Users_RequesterId",
                table: "Connections");

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_Users_ReceiverId",
                table: "Connections",
                column: "ReceiverId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Connections_Users_RequesterId",
                table: "Connections",
                column: "RequesterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
