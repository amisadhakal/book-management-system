using BookManagement.Domain.Enums;

namespace BookManagement.Application.DTOs
{
    // Used for READ operations (Index, Details). Controllers and Views
    // never touch the Domain entity directly — they work with DTOs,
    // which keeps the Web layer decoupled from how data is stored.
    public class BookDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int PublishedYear { get; set; }
        public Genre Genre { get; set; }
        public BookStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
