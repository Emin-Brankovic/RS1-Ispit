using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data.Models.SharedTables;
using RS1_2024_25.API.Services;

namespace RS1_2024_25.API.Endpoints
{
    [MyAuthorization(isAdmin: true, isManager: false)]
    [Route("[controller]/[action]")]
    [ApiController]
    public class MatriculationRecordController(ApplicationDbContext db) : ControllerBase
    {

        [HttpGet("{id}")]
        public async Task<ActionResult<GodinaUpisa[]>> GetAllRecords(int id)
        {
            var records = await db.GodinaUpisa
                .Include(s => s.student)
                .Include(s => s.akademskaGodina)
                .Where(s => s.studentId == id)
                .ToArrayAsync();

            return Ok(records);

        }

        [HttpGet]
        public async Task<ActionResult<AcademicYear[]>> GetAllAcaedmicYears(CancellationToken cancellationToken)
        {
            var academicYears=await db.AcademicYears.ToArrayAsync(cancellationToken);

            return Ok(academicYears);

        }

        [HttpPost]
        public async Task<ActionResult> AddRecord(GodinaUpisa godina,CancellationToken cancellationToken)
        {
            db.GodinaUpisa.Add(godina);
            await db.SaveChangesAsync(cancellationToken);

            return Created();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<VerifySemesterRequest>> VerifySemester(int Id,[FromBody] VerifySemesterRequest request,CancellationToken cancellationToken)
        {
            var year = await db.GodinaUpisa.FirstOrDefaultAsync(y => y.Id == Id,cancellationToken);

            if(year == null) return NotFound();

            year.datum2_ZimskiOvjera = request.VerifyDate;
            year.Napomena = request.Remark;

           await db.SaveChangesAsync(cancellationToken);

            return Ok(request);
        }
    }
}

public class VerifySemesterRequest
{
    public int YearId { get; set; }
    public DateTime VerifyDate { get; set; }
    public string? Remark { get; set; }
}
