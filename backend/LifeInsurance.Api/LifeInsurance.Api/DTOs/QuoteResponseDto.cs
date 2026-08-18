namespace LifeInsurance.Api.DTOs
{
    public class QuoteResponseDto
    {
        public Guid Id { get; set; }

        public string QuoteNumber { get; set; } = string.Empty;

        public Guid CustomerId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string Product { get; set; } = string.Empty;

        public decimal CoverageAmount { get; set; }

        public int PolicyTermYears { get; set; }

        public string PaymentFrequency { get; set; } = string.Empty;

        public decimal AnnualPremium { get; set; }

        public decimal PaymentAmount { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}