using BookManagement.Domain.Enums;

namespace BookManagement.Application.DTOs
{
    public class BookDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int PublishedYear { get; set; }
        public Genre Genre { get; set; }
        public BookStatus Status { get; set; }
        public string? Isbn { get; set; }
        public string? Publisher { get; set; }
        public double Rating { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
