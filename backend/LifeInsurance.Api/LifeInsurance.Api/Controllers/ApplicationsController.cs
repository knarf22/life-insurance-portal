using LifeInsurance.Api.Data;
using LifeInsurance.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeInsurance.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ApplicationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetApplications(
            [FromQuery] string? status)
        {
            var query = _context.PolicyApplications
                .AsNoTracking()
                .Include(x => x.Customer)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var validStatuses = new[]
                {
                    "PENDING_UNDERWRITING"
                };

                if (!validStatuses.Contains(status))
                {
                    return BadRequest(new
                    {
                        message = "Invalid application status."
                    });
                }

                query = query.Where(x => x.Status == status);
            }

            var applications = await query
                .OrderByDescending(x => x.ApplicationDate)
                .Select(x => new PolicyApplicationListDto
                {
                    Id = x.Id,
                    ApplicationNumber = x.ApplicationNumber,
                    QuoteId = x.QuoteId,
                    CustomerId = x.CustomerId,
                    CustomerName = x.Customer.FullName,
                    Product = x.Product,
                    CoverageAmount = x.CoverageAmount,
                    PolicyTermYears = x.PolicyTermYears,
                    AnnualPremium = x.AnnualPremium,
                    PaymentAmount = x.PaymentAmount,
                    ApplicationDate = x.ApplicationDate,
                    Status = x.Status
                })
                .ToListAsync();

            return Ok(applications);
        }
    }
}