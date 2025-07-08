using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClassConnectBackend.Migrations
{
    /// <inheritdoc />
    public partial class messages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Messages_CourseId",
                table: "Messages",
                column: "CourseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Courses_CourseId",
                table: "Messages",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Courses_CourseId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_CourseId",
                table: "Messages");
        }
    }
}
