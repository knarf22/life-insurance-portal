namespace LifeInsurance.Api.Models
{
    public class Quote
    {
        public Guid Id { get; set; }

        public string QuoteNumber { get; set; } = string.Empty;

        public Guid CustomerId { get; set; }

        public string Product { get; set; } = string.Empty;

        public decimal CoverageAmount { get; set; }

        public int PolicyTermYears { get; set; }

        public string PaymentFrequency { get; set; } = string.Empty;

        public decimal AnnualPremium { get; set; }

        public decimal PaymentAmount { get; set; }

        public string Status { get; set; } = "DRAFT";

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Navigation property
        public Customer Customer { get; set; } = null!;
    }
}
