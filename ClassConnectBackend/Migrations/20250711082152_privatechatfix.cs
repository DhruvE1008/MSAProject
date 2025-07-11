﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClassConnectBackend.Migrations
{
    /// <inheritdoc />
    public partial class privatechatfix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SentAt",
                table: "ChatMessages",
                newName: "Timestamp");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "ChatMessages",
                newName: "SentAt");
        }
    }
}
