using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models.SharedTables;
using System.Reflection.Metadata.Ecma335;

namespace RS1_2024_25.API.Endpoints
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class StudentController(ApplicationDbContext db) : ControllerBase
    {
        [HttpGet("studentID{id}")]
        public async Task<ActionResult<StudentEditDto>> getStudentById(int id)
        {
            var student= await db.Students.Include(s=>s.BirthMunicipality)
                .Include(s=>s.BirthMunicipality.City)
                .FirstOrDefaultAsync(s=>s.ID==id);

            if (student==null) { return NotFound(); }

            var result=new StudentEditDto() 
            {
                Id=student.ID,
                BirthDate=student.BirthDate,
                RegionId=student?.BirthMunicipality?.City?.RegionId,
                PhoneNumber=student?.ContactMobilePhone
            };

            return Ok(result);

        }

        [HttpGet("cityByRegion/{id}")]

        public async Task<ActionResult<City[]>> getCitiesByRegion(int id)
        {
            var cities=await db.Cities.Where(c=>c.RegionId==id).ToArrayAsync();

            if(cities.Length==0) return NotFound();

            return Ok(cities);
        }

        [HttpGet]
        public async Task<ActionResult<Region[]>> getRegions(int id)
        {
            var regions = await db.Regions.ToArrayAsync();

            if (regions.Length == 0) return NotFound();

            return Ok(regions);
        }

        [HttpPut("edit/{id}")]
        public async Task<ActionResult> EditStudent(int id, [FromBody] StudentEditDto std)
        {
            var student=await db.Students.SingleOrDefaultAsync(s => s.ID==id);
            if (student==null) return NotFound();

            var municipality=db.Municipalities.FirstOrDefault(m=>m.CityId==std.CityId);

            if (municipality==null) return NotFound();

            student.BirthDate= std.BirthDate;
            student.BirthMunicipalityId = municipality.ID;
            student.ContactMobilePhone = std.PhoneNumber;

            await db.SaveChangesAsync();

            return Ok();

        }


        [HttpDelete("delete/{id}")]
        public async Task<ActionResult> DeleteStudent(int id)
        {
            var student=await db.Students.SingleOrDefaultAsync(s => s.ID==id);

            if (student==null) return NotFound();

            student.Obrisan = true;
            
            await db.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("matriculation/studentID/{id}")]
        public async Task<ActionResult<StudentMatriculationRecord>> getStudentForMatriculationRecord(int id)
        {
            var student = await db.Students.Include(s=>s.User)
                .FirstOrDefaultAsync(s => s.ID == id);

            if (student == null) { return NotFound(); }

            var result = new StudentMatriculationRecord()
            {
                Id = student.ID,
                FirstName=student.User.FirstName,
                LastName=student.User.LastName,
                
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

    public class StudentEditDto
    {
        public int Id { get; set; }
        public DateOnly? BirthDate { get; set; }
        public int? RegionId { get; set; }
        public string? PhoneNumber { get; set; }
        public int? CityId { get; set; }
    }

    public class StudentEditDtoRequest
    {
        public int Id { get; set; }
        public DateOnly? BirthDate { get; set; }
        public int? CityId { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
