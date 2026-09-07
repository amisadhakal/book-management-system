using BookManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookManagement.Infrastructure.Data
{
    // Notice this lives in Infrastructure, not Application or Domain.
    // Only Infrastructure (and, via DI registration, the Web startup)
    // knows EF Core exists at all.
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Book> Books { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Book>(entity =>
            {
                entity.ToTable("Books");
                entity.HasKey(b => b.Id);
                entity.Property(b => b.Title).IsRequired().HasMaxLength(200);
                entity.Property(b => b.Author).IsRequired().HasMaxLength(150);
                entity.Property(b => b.Price).HasColumnType("decimal(10,2)");

                // Store enums as readable strings ("SciFi", "CheckedOut")
                // instead of raw ints, so the Books table is legible if you
                // ever query it directly.
                entity.Property(b => b.Genre)
                    .HasConversion<string>()
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(b => b.Status)
                    .HasConversion<string>()
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(b => b.CreatedAt).IsRequired();

                entity.Property(b => b.Isbn).HasMaxLength(20);
                entity.Property(b => b.Publisher).HasMaxLength(150);
                entity.Property(b => b.Rating).HasColumnType("float").HasDefaultValue(0.0);
                entity.Property(b => b.CoverImagePath).HasMaxLength(300);

                // Speeds up the dashboard/filter queries once the table grows.
                entity.HasIndex(b => b.Genre);
                entity.HasIndex(b => b.Status);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.ToTable("Orders");
                entity.HasKey(o => o.Id);

                entity.Property(o => o.CustomerName).IsRequired().HasMaxLength(150);
                entity.Property(o => o.Email).IsRequired().HasMaxLength(200);
                entity.Property(o => o.AddressLine1).IsRequired().HasMaxLength(200);
                entity.Property(o => o.AddressLine2).HasMaxLength(200);
                entity.Property(o => o.City).IsRequired().HasMaxLength(100);
                entity.Property(o => o.PostalCode).IsRequired().HasMaxLength(20);
                entity.Property(o => o.Country).IsRequired().HasMaxLength(100);
                entity.Property(o => o.PricePaid).HasColumnType("decimal(10,2)");
                entity.Property(o => o.PurchasedAt).IsRequired();

                // A book can accumulate at most one order in this simple
                // model (once sold, it's sold), but the FK is kept
                // unrestricted (no cascade delete) so removing a book
                // doesn't silently wipe its sales history.
                entity.HasOne(o => o.Book)
                    .WithMany()
                    .HasForeignKey(o => o.BookId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
