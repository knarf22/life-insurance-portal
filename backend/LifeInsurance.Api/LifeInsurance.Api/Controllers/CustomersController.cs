using LifeInsurance.Api.Data;
using LifeInsurance.Api.DTOs;
using LifeInsurance.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeInsurance.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : Controller
    {
        private readonly AppDbContext _context;
        public CustomersController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost]
        public async Task<IActionResult> CreateCustomer( CreateCustomerDto dto)
        {
                // Validate age
                var today = DateTime.Today;

                var age = today.Year - dto.DateOfBirth.Year;

                if (dto.DateOfBirth.Date > today.AddYears(-age))
                {
                    age--;
                }

                if (age > 65)
                {
                    return BadRequest(new
                    {
                        message = "Customer age must not exceed 65 years old."
                    });
                }

                // Prevent future date of birth
                if (dto.DateOfBirth.Date > today)
                {
                    return BadRequest(new
                    {
                        message = "Date of birth cannot be in the future."
                    });
                }

                // Check duplicate email
                var emailExists = await _context.Customers
                    .AnyAsync(x => x.Email == dto.Email);

                if (emailExists)
                {
                    return Conflict(new
                    {
                        message = "A customer with this email already exists."
                    });
                }

                var customer = new Customer
                {
                    Id = Guid.NewGuid(),
                    FullName = dto.FullName.Trim(),
                    DateOfBirth = dto.DateOfBirth.Date,
                    Email = dto.Email.Trim(),
                    MobileNumber = dto.MobileNumber.Trim(),
                    IsSmoker = dto.IsSmoker,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Customers.Add(customer);

                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetCustomer),
                    new { id = customer.Id },
                    customer);
        }

        [HttpGet]
        public async Task<IActionResult> GetCustomer([FromQuery] string? search)
        {
                var query = _context.Customers
                    .AsNoTracking()
                    .AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    search = search.Trim();

                    query = query.Where(x =>
                        x.FullName.Contains(search) ||
                        x.Email.Contains(search));
                }

                var customers = await query
                    .OrderBy(x => x.FullName)
                    .ToListAsync();

            return Ok(customers);
        }
    }
}
