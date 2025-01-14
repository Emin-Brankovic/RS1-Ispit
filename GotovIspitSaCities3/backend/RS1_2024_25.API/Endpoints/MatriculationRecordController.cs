using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data.Models.SharedTables;

namespace RS1_2024_25.API.Endpoints
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class MatriculationRecordController(ApplicationDbContext db) : ControllerBase
    {

        [HttpGet("{id}")]
        public async Task<ActionResult<GodinaUpisa[]>> GetAllRecords(int id)
        {
            var records=await db.GodinaUpisa
                .Include(s=>s.student)
                .Include(s=>s.akademskaGodina)
                .Where(s=>s.studentId==id)
                .ToArrayAsync();

            return Ok(records);

        }

        [HttpPost]
        public async Task<ActionResult> CreatRecord([FromBody] GodinaUpisa godina)
        {
            if (godina == null) return BadRequest();

            db.GodinaUpisa.Add(godina);

            await db.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        public async Task<ActionResult<AcademicYear[]>> GetAllAcademicYears()
        {
            var years=await db.AcademicYears.ToArrayAsync();

            return Ok(years);
        }
    }
}
