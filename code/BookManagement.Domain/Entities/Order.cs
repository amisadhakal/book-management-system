namespace BookManagement.Domain.Entities
{
    // Records a completed checkout for a book. No real payment processor
    // is involved — this just captures who "bought" it and where it
    // would ship, so the flow feels like a real store checkout.
    public class Order
    {
        public int Id { get; set; }

        public int BookId { get; set; }
        public Book? Book { get; set; }

        public string CustomerName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;

        public decimal PricePaid { get; set; }
        public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
    }
}
