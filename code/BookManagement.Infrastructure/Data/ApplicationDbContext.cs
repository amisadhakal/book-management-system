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

                // Speeds up the dashboard/filter queries once the table grows.
                entity.HasIndex(b => b.Genre);
                entity.HasIndex(b => b.Status);
            });
        }
    }
}
