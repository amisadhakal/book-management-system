using BookManagement.Domain.Enums;

namespace BookManagement.Domain.Entities
{
    // The Domain layer is the innermost layer in Clean Architecture.
    // It has ZERO dependencies on EF Core, ASP.NET Core, or any other
    // project — just plain C#. This is the "core" that everything
    // else depends on, never the other way around.
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int PublishedYear { get; set; }

        // New fields for the dropdown feature.
        public Genre Genre { get; set; }
        public BookStatus Status { get; set; }

        // Needed so the dashboard can show "recently added" books.
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
