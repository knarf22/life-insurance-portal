using System.ComponentModel.DataAnnotations;

namespace LifeInsurance.Api.DTOs
{
    public class UpdateQuoteStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}