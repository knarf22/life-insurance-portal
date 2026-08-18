using System.ComponentModel.DataAnnotations;

namespace LifeInsurance.Api.DTOs
{
    public class CreateQuoteDto
    {
        [Required]
        public Guid CustomerId { get; set; }

        [Required]
        public string Product { get; set; } = string.Empty;

        [Range(100000, 5000000)]
        public decimal CoverageAmount { get; set; }

        [Required]
        public int PolicyTermYears { get; set; }

        [Required]
        public string PaymentFrequency { get; set; } = string.Empty;
    }
}
