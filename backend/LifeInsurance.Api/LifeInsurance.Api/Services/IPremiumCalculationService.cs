using LifeInsurance.Api.Models;

namespace LifeInsurance.Api.Services
{
    public interface IPremiumCalculationService
    {
        PremiumResult Calculate(
            Customer customer,
            string product,
            decimal coverageAmount,
            int policyTermYears,
            string paymentFrequency);
    }
}
