using FluentValidation;
using RS1_2024_25.API.Data;

namespace RS1_2024_25.API.Endpoints
{
    public class StudentControllerValidator:AbstractValidator<StudentEdit>
    {
        public StudentControllerValidator(ApplicationDbContext db)
        {
            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .Matches("/^06\\d-\\d{3}-\\d{3}$/").WithMessage("Invalid fromat");
            RuleFor(x => x.BirthDate)
                .NotEmpty().WithMessage("Birth date is required")
                .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Now));


        }
    }
}
