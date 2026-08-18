using LifeInsurance.Api.Data;
using LifeInsurance.Api.DTOs;
using LifeInsurance.Api.Models;
using LifeInsurance.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeInsurance.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuotesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPremiumCalculationService _premiumService;

        public QuotesController(
            AppDbContext context,
            IPremiumCalculationService premiumService)
        {
            _context = context;
            _premiumService = premiumService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateQuote(CreateQuoteDto dto)
        {
            // Validate product
            var validProducts = new[]
            {
                "TERM_LIFE",
                "WHOLE_LIFE"
            };

            if (!validProducts.Contains(dto.Product))
            {
                return BadRequest(new
                {
                    message = "Invalid product type."
                });
            }

            // Validate policy term
            var validTerms = new[] { 5, 10, 15, 20 };

            if (!validTerms.Contains(dto.PolicyTermYears))
            {
                return BadRequest(new
                {
                    message = "Policy term must be 5, 10, 15, or 20 years."
                });
            }

            // Validate payment frequency
            var validFrequencies = new[]
            {
                "MONTHLY",
                "ANNUAL"
            };

            if (!validFrequencies.Contains(dto.PaymentFrequency))
            {
                return BadRequest(new
                {
                    message = "Payment frequency must be MONTHLY or ANNUAL."
                });
            }

            // Validate coverage
            if (dto.CoverageAmount < 100000 ||
                dto.CoverageAmount > 5000000)
            {
                return BadRequest(new
                {
                    message = "Coverage must be between 100,000 and 5,000,000."
                });
            }

            // Find customer
            var customer = await _context.Customers
                .FirstOrDefaultAsync(x => x.Id == dto.CustomerId);

            if (customer == null)
            {
                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            // Calculate premium
            var premium = _premiumService.Calculate(
                customer,
                dto.Product,
                dto.CoverageAmount,
                dto.PolicyTermYears,
                dto.PaymentFrequency);

            // Create quote
            var quote = new Quote
            {
                Id = Guid.NewGuid(),
                QuoteNumber = $"Q-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                CustomerId = customer.Id,
                Product = dto.Product,
                CoverageAmount = dto.CoverageAmount,
                PolicyTermYears = dto.PolicyTermYears,
                PaymentFrequency = dto.PaymentFrequency,
                AnnualPremium = premium.AnnualPremium,
                PaymentAmount = premium.PaymentAmount,
                Status = "DRAFT",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Quotes.Add(quote);

            await _context.SaveChangesAsync();

            var response = new QuoteResponseDto
            {
                Id = quote.Id,
                QuoteNumber = quote.QuoteNumber,
                CustomerId = quote.CustomerId,
                CustomerName = customer.FullName,
                Product = quote.Product,
                CoverageAmount = quote.CoverageAmount,
                PolicyTermYears = quote.PolicyTermYears,
                PaymentFrequency = quote.PaymentFrequency,
                AnnualPremium = quote.AnnualPremium,
                PaymentAmount = quote.PaymentAmount,
                Status = quote.Status,
                CreatedAt = quote.CreatedAt,
                UpdatedAt = quote.UpdatedAt
            };

            return CreatedAtAction(
                nameof(GetQuote),
                new { id = quote.Id },
                response);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetQuote(Guid id)
        {
            var quote = await _context.Quotes
                .AsNoTracking()
                .Include(x => x.Customer)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (quote == null)
            {
                return NotFound(new
                {
                    message = "Quote not found."
                });
            }

            var response = new QuoteResponseDto
            {
                Id = quote.Id,
                QuoteNumber = quote.QuoteNumber,
                CustomerId = quote.CustomerId,
                CustomerName = quote.Customer.FullName,
                Product = quote.Product,
                CoverageAmount = quote.CoverageAmount,
                PolicyTermYears = quote.PolicyTermYears,
                PaymentFrequency = quote.PaymentFrequency,
                AnnualPremium = quote.AnnualPremium,
                PaymentAmount = quote.PaymentAmount,
                Status = quote.Status,
                CreatedAt = quote.CreatedAt,
                UpdatedAt = quote.UpdatedAt
            };

            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> GetQuotes([FromQuery] string? status)
        {
            var query = _context.Quotes
                .AsNoTracking()
                .Include(x => x.Customer)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                    var validStatuses = new[]
                    {
                        "DRAFT",
                        "ACCEPTED",
                        "DECLINED",
                        "CONVERTED"
                    };

                if (!validStatuses.Contains(status))
                {
                    return BadRequest(new
                    {
                        message = "Invalid quote status."
                    });
                }

                query = query.Where(x => x.Status == status);
            }

            var quotes = await query
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new QuoteListDto
                {
                    Id = x.Id,
                    QuoteNumber = x.QuoteNumber,
                    CustomerId = x.CustomerId,
                    CustomerName = x.Customer.FullName,
                    Product = x.Product,
                    CoverageAmount = x.CoverageAmount,
                    PolicyTermYears = x.PolicyTermYears,
                    AnnualPremium = x.AnnualPremium,
                    PaymentAmount = x.PaymentAmount,
                    CreatedAt = x.CreatedAt,
                    Status = x.Status
                })
                .ToListAsync();

            return Ok(quotes);
        }


        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateQuoteStatus(Guid id, UpdateQuoteStatusDto dto)
        {
            var quote = await _context.Quotes
                .FirstOrDefaultAsync(x => x.Id == id);

            if (quote == null)
            {
                return NotFound(new
                {
                    message = "Quote not found."
                });
            }

            var newStatus = dto.Status.ToUpperInvariant();

            // Only ACCEPTED or DECLINED are valid target statuses
            if (newStatus != "ACCEPTED" &&
                newStatus != "DECLINED")
            {
                return BadRequest(new
                {
                    message = "Quote can only be changed to ACCEPTED or DECLINED."
                });
            }

            // Only DRAFT quotes can change status
            if (quote.Status != "DRAFT")
            {
                return BadRequest(new
                {
                    message = $"Quote with status {quote.Status} cannot be updated."
                });
            }

            quote.Status = newStatus;
            quote.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(quote);
        }

        [HttpPost("{id:guid}/convert")]
        public async Task<IActionResult> ConvertQuote(Guid id)
        {
            var quote = await _context.Quotes
                .Include(x => x.Customer)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (quote == null)
            {
                return NotFound(new
                {
                    message = "Quote not found."
                });
            }

            // Only ACCEPTED quotes can be converted
            if (quote.Status != "ACCEPTED")
            {
                return BadRequest(new
                {
                    message = "Only an ACCEPTED quote can be converted."
                });
            }

            // Prevent duplicate conversion
            var existingApplication = await _context.PolicyApplications
                .FirstOrDefaultAsync(x => x.QuoteId == quote.Id);

            if (existingApplication != null)
            {
                return Conflict(new
                {
                    message = "This quote has already been converted."
                });
            }

            // Generate application number
            var applicationNumber =
                $"APP-{DateTime.UtcNow:yyyyMMddHHmmssfff}";

            var application = new PolicyApplication
            {
                Id = Guid.NewGuid(),

                ApplicationNumber = applicationNumber,

                QuoteId = quote.Id,

                CustomerId = quote.CustomerId,

                // Quote snapshot
                Product = quote.Product,
                CoverageAmount = quote.CoverageAmount,
                PolicyTermYears = quote.PolicyTermYears,
                PaymentFrequency = quote.PaymentFrequency,
                AnnualPremium = quote.AnnualPremium,
                PaymentAmount = quote.PaymentAmount,

                ApplicationDate = DateTime.UtcNow,

                Status = "PENDING_UNDERWRITING"
            };

            // Mark quote as converted
            quote.Status = "CONVERTED";
            quote.UpdatedAt = DateTime.UtcNow;

            _context.PolicyApplications.Add(application);

            await _context.SaveChangesAsync();

            var response = new PolicyApplicationResponseDto
            {
                Id = application.Id,
                ApplicationNumber = application.ApplicationNumber,
                QuoteId = application.QuoteId,
                CustomerId = application.CustomerId,
                CustomerName = quote.Customer.FullName,
                Product = application.Product,
                CoverageAmount = application.CoverageAmount,
                PolicyTermYears = application.PolicyTermYears,
                PaymentFrequency = application.PaymentFrequency,
                AnnualPremium = application.AnnualPremium,
                PaymentAmount = application.PaymentAmount,
                ApplicationDate = application.ApplicationDate,
                Status = application.Status
            };

            return Ok(response);
        }

        [HttpPost("calculate-premium")]
        public async Task<IActionResult> CalculatePremium(CreateQuoteDto dto)
        {
            // Find customer
            var customer = await _context.Customers
                .FirstOrDefaultAsync(x => x.Id == dto.CustomerId);

            if (customer == null)
            {
                return NotFound(new
                {
                    message = "Customer not found."
                });
            }

            // Validate product
            var validProducts = new[]
            {
                "TERM_LIFE",
                "WHOLE_LIFE"
            };

            if (!validProducts.Contains(dto.Product))
            {
                return BadRequest(new
                {
                    message = "Invalid product type."
                });
            }

            // Validate policy term
            var validTerms = new[] { 5, 10, 15, 20 };

            if (!validTerms.Contains(dto.PolicyTermYears))
            {
                return BadRequest(new
                {
                    message =
                        "Policy term must be 5, 10, 15, or 20 years."
                });
            }

            // Validate payment frequency
            var validFrequencies = new[]
            {
                "MONTHLY",
                "ANNUAL"
            };

            if (!validFrequencies.Contains(dto.PaymentFrequency))
            {
                return BadRequest(new
                {
                    message =
                        "Payment frequency must be MONTHLY or ANNUAL."
                });
            }

            // Validate coverage
            if (dto.CoverageAmount < 100000 ||
                dto.CoverageAmount > 5000000)
            {
                return BadRequest(new
                {
                    message =
                        "Coverage must be between 100,000 and 5,000,000."
                });
            }

            // Calculate premium
            var premium = _premiumService.Calculate(
                customer,
                dto.Product,
                dto.CoverageAmount,
                dto.PolicyTermYears,
                dto.PaymentFrequency);

            return Ok(new
            {
                baseAnnualPremium = premium.BaseAnnualPremium,
                riskLoadingPercent = premium.RiskLoadingPercent,
                annualPremium = premium.AnnualPremium,
                paymentAmount = premium.PaymentAmount
            });
        }
    }
}