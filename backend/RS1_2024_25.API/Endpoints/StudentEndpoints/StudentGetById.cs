using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;

namespace RS1_2024_25.API.Endpoints.StudentEndpoints
{
    [Route("students")]
    public class StudentGetById(ApplicationDbContext dbContext) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithActionResult<StudentGetByIdResponse>
    {

        [HttpGet("{id}")]
        public override async Task<ActionResult<StudentGetByIdResponse>> HandleAsync(int id, CancellationToken cancellationToken = default)
        {
            var student = await dbContext.Students.Include(s=>s.BirthMunicipality).Include(s=>s.BirthCountry)
                .FirstOrDefaultAsync(s => s.ID == id, cancellationToken);

            if (student == null) return NotFound();

            var result = new StudentGetByIdResponse()
            {
                Id = student.ID,
                CityId = student.BirthMunicipality != null ? student.BirthMunicipality.CityId : 0,
                CountryId = student.BirthCountry != null ? student.BirthCountry.ID : 0,
                BirthDate = student.BirthDate,
                ContactMobilePhone = student.ContactMobilePhone,
            };

            return Ok(result);
        }
    }



    public class StudentGetByIdResponse
    {
        public int Id { get; set; }
        public DateOnly? BirthDate { get; set; }
        public int CityId { get; set; }
        public int CountryId { get; set; }
        public int RegionId { get; set; }
        public string? ContactMobilePhone { get; set; }
    }
}
