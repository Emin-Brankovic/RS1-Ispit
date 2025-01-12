using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RS1_2024_25.API.Migrations
{
    /// <inheritdoc />
    public partial class MaticnaKnjiga : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GodinaUpisas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    datum2_ZimskiOvjera = table.Column<DateTime>(type: "datetime2", nullable: true),
                    datum1_ZimskiUpis = table.Column<DateTime>(type: "datetime2", nullable: true),
                    godinaStudija = table.Column<int>(type: "int", nullable: false),
                    studentId = table.Column<int>(type: "int", nullable: false),
                    akademskaGodinaId = table.Column<int>(type: "int", nullable: false),
                    cijenaSkolarine = table.Column<float>(type: "real", nullable: true),
                    obnovaGodine = table.Column<bool>(type: "bit", nullable: false),
                    Napomena = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GodinaUpisas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GodinaUpisas_AcademicYears_akademskaGodinaId",
                        column: x => x.akademskaGodinaId,
                        principalTable: "AcademicYears",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_GodinaUpisas_Students_studentId",
                        column: x => x.studentId,
                        principalTable: "Students",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_GodinaUpisas_akademskaGodinaId",
                table: "GodinaUpisas",
                column: "akademskaGodinaId");

            migrationBuilder.CreateIndex(
                name: "IX_GodinaUpisas_studentId",
                table: "GodinaUpisas",
                column: "studentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GodinaUpisas");
        }
    }
}
