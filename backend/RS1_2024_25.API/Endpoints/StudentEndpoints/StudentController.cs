using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models.SharedTables;
using System.Runtime.ExceptionServices;

namespace RS1_2024_25.API.Endpoints.StudentEndpoints
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class StudentController(ApplicationDbContext dbContext) : ControllerBase
    {
        [HttpPut]
        public async Task<ActionResult<StudentDeleteResponse>> DeleteStudent([FromBody] StudenDeleteRequest req,CancellationToken cancellationToken)
        {
            var student=await dbContext.Students.Include(s=>s.User)
                .FirstOrDefaultAsync(s=>s.ID==req.Id,cancellationToken);

            if (student==null) return NotFound();

            student.Obrisan = true;

            await dbContext.SaveChangesAsync(cancellationToken);

            return Ok(new StudentDeleteResponse (){
                ID = student.ID,
                FirstName=student.User.FirstName,
                LastName=student.User.LastName,
                StudentNumber=student.StudentNumber,
                Citizenship= student.Citizenship != null ? student.Citizenship.Name : null,
                BirthMunicipality= student.BirthMunicipality != null ? student.BirthMunicipality.Name : null,
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GetByIdResponse>> GetStudentById(int id)
        {
            var student = await  dbContext.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.ID == id);

            if (student==null) return NotFound();

                var result=new GetByIdResponse()
                {
                     Id = student.ID,
                     FirstName = student.User.FirstName,
                     LastName = student.User.LastName,
                };

            return Ok(result);

        }


        [HttpGet("maticna/{id}")]
        public async Task<ActionResult<List<GodinaUpisa>>> GetMaticnaForStudent (int id)
        {
            var maticna=await dbContext.GodinaUpisa
                .Include(m=>m.akademskaGodina)
                .Include(m=>m.student)
                .Where(m=>m.studentId==id)
                .ToListAsync();

            return Ok(maticna);
        }


    }


    public class GetByIdResponse
    {
        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }



    public class StudenDeleteRequest
    {
        public int Id { get; set; }
    }

    public class StudentDeleteResponse
    {
        public required int ID { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string StudentNumber { get; set; }
        public string? Citizenship { get; set; }
        public string? BirthMunicipality { get; set; }
    }
}
