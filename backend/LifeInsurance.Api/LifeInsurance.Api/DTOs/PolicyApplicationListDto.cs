namespace LifeInsurance.Api.DTOs
{
    public class PolicyApplicationListDto
    {
        public Guid Id { get; set; }

        public string ApplicationNumber { get; set; } = string.Empty;

        public Guid QuoteId { get; set; }

        public Guid CustomerId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string Product { get; set; } = string.Empty;

        public decimal CoverageAmount { get; set; }

        public int PolicyTermYears { get; set; }

        public decimal AnnualPremium { get; set; }

        public decimal PaymentAmount { get; set; }

        public DateTime ApplicationDate { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}