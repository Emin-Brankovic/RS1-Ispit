using RS1_2024_25.API.Data.Models.TenantSpecificTables.Modul2_Basic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Data.Models.SharedTables
{
    public class GodinaUpisa
    {
        [Key]
        public int Id { get; set; }
        public DateTime? datum2_ZimskiOvjera { get; set; }
        public DateTime? datum1_ZimskiUpis { get; set; }
        public int godinaStudija { get; set; }

        [ForeignKey(nameof(student))]
        public int studentId { get; set; }
        public Student? student { get; set; }

        [ForeignKey(nameof(akademskaGodina))]
        public int akademskaGodinaId { get; set; }
        public AcademicYear? akademskaGodina { get; set; }

        public float? cijenaSkolarine { get; set; }

        public bool obnovaGodine { get; set; }

        public string? Napomena { get; set; }
    }
}
