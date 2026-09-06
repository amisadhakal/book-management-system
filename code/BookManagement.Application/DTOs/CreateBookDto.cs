using System.ComponentModel.DataAnnotations;
using BookManagement.Domain.Enums;

namespace BookManagement.Application.DTOs
{
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

        [Required(ErrorMessage = "Please select a genre.")]
        public Genre Genre { get; set; }

        [Required(ErrorMessage = "Please select a status.")]
        public BookStatus Status { get; set; }

        // Optional — cards fall back gracefully if these are blank.
        [StringLength(20, ErrorMessage = "ISBN looks too long.")]
        public string? Isbn { get; set; }

        [StringLength(150)]
        public string? Publisher { get; set; }

        [Range(0, 5, ErrorMessage = "Rating must be between 0 and 5.")]
        public double Rating { get; set; }

        public string? CoverImagePath { get; set; }
    }
}
