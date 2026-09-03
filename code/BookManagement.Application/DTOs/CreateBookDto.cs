using System.ComponentModel.DataAnnotations;

namespace BookManagement.Application.DTOs
{
    // Bound to the Create form. Validation lives here (Application layer)
    // rather than on the Domain entity, since "what a valid create request
    // looks like" is an application concern, not a core business rule.
    public class CreateBookDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Author is required.")]
        [StringLength(150)]
        public string Author { get; set; } = string.Empty;

        [Required(ErrorMessage = "Price is required.")]
        [Range(0.01, 100000, ErrorMessage = "Price must be greater than 0.")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Published year is required.")]
        [Range(1000, 2100, ErrorMessage = "Enter a reasonable published year.")]
        public int PublishedYear { get; set; }
    }
}
