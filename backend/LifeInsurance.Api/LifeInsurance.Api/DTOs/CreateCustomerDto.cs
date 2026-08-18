using System.ComponentModel.DataAnnotations;

namespace LifeInsurance.Api.DTOs
{
    public class CreateCustomerDto
    {
        [Required]
        [StringLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(
            @"^\+?[1-9]\d{7,14}$",
            ErrorMessage = "Mobile number must be a valid phone number."
        )]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        public bool IsSmoker { get; set; }
    }
}
