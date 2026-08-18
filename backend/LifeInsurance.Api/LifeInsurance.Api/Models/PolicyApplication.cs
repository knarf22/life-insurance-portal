namespace LifeInsurance.Api.Models
{
    public class PolicyApplication
    {
        public Guid Id { get; set; }

        public string ApplicationNumber { get; set; } = string.Empty;

        public Guid QuoteId { get; set; }

        public Guid CustomerId { get; set; }

        // Quote snapshot
        public string Product { get; set; } = string.Empty;

        public decimal CoverageAmount { get; set; }

        public int PolicyTermYears { get; set; }

        public string PaymentFrequency { get; set; } = string.Empty;

        public decimal AnnualPremium { get; set; }

        public decimal PaymentAmount { get; set; }

        public DateTime ApplicationDate { get; set; }

        public string Status { get; set; } = "PENDING_UNDERWRITING";

        // Navigation properties
        public Quote Quote { get; set; } = null!;

        public Customer Customer { get; set; } = null!;
    }
}
