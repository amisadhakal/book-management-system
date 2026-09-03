using System.ComponentModel.DataAnnotations;

namespace BookManagement.Application.DTOs
{
    public class UpdateBookDto
    {
        public int Id { get; set; }

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
