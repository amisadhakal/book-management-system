using BookManagement.Domain.Enums;

namespace BookManagement.Application.DTOs
{
    // Carries the search/filter criteria from the Index page's filter
    // form down to the repository. All properties are optional (nullable)
    // so "no filter selected" just means "don't filter on this field".
    public class BookFilterDto
    {
        public string? SearchTerm { get; set; }   // matches Title or Author
        public Genre? Genre { get; set; }
        public BookStatus? Status { get; set; }
    }
}
