using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models.SharedTables;
using RS1_2024_25.API.Helper;
using static RS1_2024_25.API.Endpoints.StudentEndpoints.StudentGetAllEndpoint;

namespace RS1_2024_25.API.Endpoints
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class StudentController(ApplicationDbContext db) : ControllerBase
    {

        [HttpGet("{id}")]
        public async Task<ActionResult<StudentEdit>> GetStudentByIdForEdit(int id,CancellationToken cancellationToken)
        {
            var student=await db.Students
                //.Include(s=>s.BirthMunicipality)
                //.Include(s=>s.BirthMunicipality!.City)
                //.Include(s=>s.BirthMunicipality!.City!.Region)
                //.Include(s => s.BirthMunicipality!.City!.Region)
                .Select(s=>new StudentEdit
                {
                    Id=s.ID,
                    BirthDate=s.BirthDate,
                    PhoneNumber=s.ContactMobilePhone,
                    MunicipalityId=s.BirthMunicipalityId,
                    CountryId= s.BirthMunicipality!.City!.Region!.CountryId

                })
                .FirstOrDefaultAsync(s=>s.Id==id,cancellationToken);

            if(student==null)  return NotFound();

            return Ok(student);
        }

        [HttpGet]
        public async Task<ActionResult<Country[]>> GetCountriesForStudentEdit(CancellationToken cancellationToken)
        {
            var countries=await db.Countries.ToArrayAsync(cancellationToken);

            return Ok(countries);
        }


        [HttpGet("countryId/{id}")]
        public async Task<ActionResult<Municipality[]>> GetMunicipalitiesForStudentEditByCountryId(int id,CancellationToken cancellationToken)
        {
            var municipalites = await db.Municipalities
                .Where(m=>m.City!.Region!.CountryId==id)
                .ToArrayAsync(cancellationToken);

            return Ok(municipalites);
        }


        [HttpPost("{id}")]
        public async Task<ActionResult> EditStudent(int id,[FromBody] StudentEdit edit,CancellationToken cancellationToken)
        {
            var student=await db.Students.FirstOrDefaultAsync(s=>s.ID==id,cancellationToken);

            if(student==null) return NotFound();

            student.BirthDate = edit.BirthDate;
            student.ContactMobilePhone = edit.PhoneNumber;
            student.BirthMunicipalityId=edit.MunicipalityId;

            db.SaveChanges();

            return NoContent();
        }


        [HttpGet]
        public async Task<ActionResult<MyPagedList<StudentGetAllResponse>>> GetAllStudents([FromQuery]StudentGetAllRequest request,CancellationToken cancellationToken)
        {
                
            var query=db.Students
                .Include(s=>s.User)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Q))
            {
                query = query.Where(s => s.User.FirstName.ToLower().Contains(request.Q.ToLower())
                || s.User.LastName.ToLower().Contains(request.Q.ToLower()));
            }

            var selection = query.Select(s => new StudentGetAllResponse
            {
                ID = s.ID,
                FirstName = s.User.FirstName,
                LastName = s.User.LastName,
                StudentNumber = s.StudentNumber,
                Citizenship = s.Citizenship != null ? s.Citizenship.Name : null,
                BirthMunicipality = s.BirthMunicipality != null ? s.BirthMunicipality.Name : null,
            });


            var paginatedResult = await MyPagedList<StudentGetAllResponse>.CreateAsync(selection, request, cancellationToken);



            return Ok(paginatedResult);
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteStudent(int id, CancellationToken cancellationToken)
        {
            var student = await db.Students.FirstOrDefaultAsync(s => s.ID == id, cancellationToken);

            if (student == null) return NotFound();

            student.Obrisan = true;

            db.SaveChanges();

            return NoContent();
        }

        [HttpGet("matriculation/studentID/{id}")]
        public async Task<ActionResult<StudentMatriculationRecord>> getStudentForMatriculationRecord(int id)
        {
            var student = await db.Students.Include(s => s.User)
                .FirstOrDefaultAsync(s => s.ID == id);

            if (student == null) { return NotFound(); }

            var result = new StudentMatriculationRecord()
            {
                Id = student.ID,
                FirstName = student.User.FirstName,
                LastName = student.User.LastName,

            };

            return Ok(result);

        }


    }

    public class StudentMatriculationRecord
    {
        public int Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }

    public class StudentEdit
    {
        public int Id { get; set; }
        public DateOnly? BirthDate { get; set; }
        public string? PhoneNumber { get; set; }
        public int? MunicipalityId { get; set; }
        public int CountryId { get; set; }
    }
}
