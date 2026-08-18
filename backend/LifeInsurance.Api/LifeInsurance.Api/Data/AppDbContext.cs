using LifeInsurance.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LifeInsurance.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Models.Customer> Customers { get; set; } = null!;
        public DbSet<Models.Quote> Quotes { get; set; } = null!;
        public DbSet<Models.PolicyApplication> PolicyApplications { get; set; } = null!;
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Customer
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.ToTable("Customers");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.FullName)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(x => x.DateOfBirth)
                    .HasColumnType("date")
                    .IsRequired();

                entity.Property(x => x.Email)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(x => x.MobileNumber)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(x => x.IsSmoker)
                    .IsRequired();

                entity.Property(x => x.CreatedAt)
                    .HasColumnType("datetime2")
                    .IsRequired();
            });

            // Quote
            modelBuilder.Entity<Quote>(entity =>
            {
                entity.ToTable("Quotes");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.QuoteNumber)
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(x => x.Product)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(x => x.CoverageAmount)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.PaymentFrequency)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(x => x.AnnualPremium)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.PaymentAmount)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.Status)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(x => x.CreatedAt)
                    .HasColumnType("datetime2")
                    .IsRequired();

                entity.Property(x => x.UpdatedAt)
                    .HasColumnType("datetime2")
                    .IsRequired();

                entity.HasOne(x => x.Customer)
                    .WithMany(x => x.Quotes)
                    .HasForeignKey(x => x.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Policy Application
            modelBuilder.Entity<PolicyApplication>(entity =>
            {
                entity.ToTable("PolicyApplications");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.ApplicationNumber)
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(x => x.Product)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(x => x.CoverageAmount)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.PaymentFrequency)
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(x => x.AnnualPremium)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.PaymentAmount)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(x => x.ApplicationDate)
                    .HasColumnType("datetime2")
                    .IsRequired();

                entity.Property(x => x.Status)
                    .HasMaxLength(30)
                    .IsRequired();

                entity.HasOne(x => x.Customer)
                    .WithMany(x => x.PolicyApplications)
                    .HasForeignKey(x => x.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.Quote)
                    .WithOne()
                    .HasForeignKey<PolicyApplication>(x => x.QuoteId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
