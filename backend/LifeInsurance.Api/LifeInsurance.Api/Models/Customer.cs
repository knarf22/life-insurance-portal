namespace LifeInsurance.Api.Models
{
    public class Customer
    {
        public Guid Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        public string Email { get; set; } = string.Empty;

        public string MobileNumber { get; set; } = string.Empty;

        public bool IsSmoker { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation property
        public ICollection<Quote> Quotes { get; set; } = new List<Quote>();

        public ICollection<PolicyApplication> PolicyApplications { get; set; }
            = new List<PolicyApplication>();
    }
}
