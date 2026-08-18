using LifeInsurance.Api.Models;

namespace LifeInsurance.Api.Services
{
    public class PremiumCalculationService : IPremiumCalculationService
    {
        public PremiumResult Calculate(
            Customer customer,
            string product,
            decimal coverageAmount,
            int policyTermYears,
            string paymentFrequency)
        {
            // Base annual premium
            var baseAnnualPremium = coverageAmount * 0.012m;

            // Risk loading
            decimal riskLoadingPercent = 0m;

            // Age loading
            var age = CalculateAge(customer.DateOfBirth);

            if (age >= 31 && age <= 45)
            {
                riskLoadingPercent += 0.15m;
            }
            else if (age >= 46 && age <= 55)
            {
                riskLoadingPercent += 0.35m;
            }
            else if (age >= 56 && age <= 65)
            {
                riskLoadingPercent += 0.70m;
            }

            // Smoker loading
            if (customer.IsSmoker)
            {
                riskLoadingPercent += 0.25m;
            }

            // Product loading
            if (product == "WHOLE_LIFE")
            {
                riskLoadingPercent += 0.20m;
            }

            // Policy term loading
            if (policyTermYears == 15)
            {
                riskLoadingPercent += 0.10m;
            }
            else if (policyTermYears == 20)
            {
                riskLoadingPercent += 0.20m;
            }

            // Final annual premium
            var finalAnnualPremium =
                baseAnnualPremium * (1 + riskLoadingPercent);

            // Payment amount
            var paymentAmount = paymentFrequency == "MONTHLY"
                ? finalAnnualPremium / 12
                : finalAnnualPremium;

            return new PremiumResult
            {
                BaseAnnualPremium = baseAnnualPremium,
                RiskLoadingPercent = riskLoadingPercent,
                AnnualPremium = finalAnnualPremium,
                PaymentAmount = paymentAmount
            };
        }

        private int CalculateAge(DateTime dateOfBirth)
        {
            var today = DateTime.Today;

            var age = today.Year - dateOfBirth.Year;

            if (dateOfBirth.Date > today.AddYears(-age))
            {
                age--;
            }

            return age;
        }
    }

    public class PremiumResult
    {
        public decimal BaseAnnualPremium { get; set; }

        public decimal RiskLoadingPercent { get; set; }

        public decimal AnnualPremium { get; set; }

        public decimal PaymentAmount { get; set; }
    }
}