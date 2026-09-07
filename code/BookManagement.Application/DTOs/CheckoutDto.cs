using System.ComponentModel.DataAnnotations;

namespace BookManagement.Application.DTOs
{
    // What the React checkout form submits.
    public class CheckoutDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(150)]
        public string CustomerName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Enter a valid email address.")]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required.")]
        [StringLength(200)]
        public string AddressLine1 { get; set; } = string.Empty;

        [StringLength(200)]
        public string? AddressLine2 { get; set; }

        [Required(ErrorMessage = "City is required.")]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [Required(ErrorMessage = "Postal code is required.")]
        [StringLength(20)]
        public string PostalCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Country is required.")]
        [StringLength(100)]
        public string Country { get; set; } = string.Empty;

        // Card-style fields are collected for a realistic checkout feel
        // but are never stored or sent anywhere — no real payment processor
        // is involved. See BooksController.Buy for details.
        [Required(ErrorMessage = "Card number is required.")]
        [StringLength(19, MinimumLength = 12, ErrorMessage = "Enter a valid card number.")]
        public string CardNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Expiry is required.")]
        [StringLength(7)]
        public string CardExpiry { get; set; } = string.Empty;

        [Required(ErrorMessage = "CVC is required.")]
        [StringLength(4, MinimumLength = 3)]
        public string CardCvc { get; set; } = string.Empty;
    }

    // What the API returns after a successful "purchase".
    public class OrderDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public decimal PricePaid { get; set; }
        public DateTime PurchasedAt { get; set; }
    }
}
