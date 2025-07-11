using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClassConnectBackend.Migrations
{
    /// <inheritdoc />
    public partial class connectionsChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Avatar",
                table: "Connections");

            migrationBuilder.DropColumn(
                name: "Course",
                table: "Connections");

            migrationBuilder.DropColumn(
                name: "Major",
                table: "Connections");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Connections");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "Connections");

            migrationBuilder.CreateIndex(
                name: "IX_Connections_ReceiverId",
                table: "Connections",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_Connections_RequesterId",
                table: "Connections",
                column: "RequesterId");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Users_ReceiverId",
                table: "Connections");

            migrationBuilder.DropForeignKey(
                name: "FK_Connections_Users_RequesterId",
                table: "Connections");

            migrationBuilder.DropIndex(
                name: "IX_Connections_ReceiverId",
                table: "Connections");

            migrationBuilder.DropIndex(
                name: "IX_Connections_RequesterId",
                table: "Connections");

            migrationBuilder.AddColumn<string>(
                name: "Avatar",
                table: "Connections",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Course",
                table: "Connections",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Major",
                table: "Connections",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Connections",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Year",
                table: "Connections",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
