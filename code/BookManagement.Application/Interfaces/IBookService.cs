using BookManagement.Application.DTOs;

namespace BookManagement.Application.Interfaces
{
    // The Web layer (controllers) depends ONLY on this interface — never
    // on IBookRepository, ApplicationDbContext, or EF Core directly.
    // This is what keeps Controllers thin and swappable: the Web project
    // doesn't even need a project reference to Infrastructure to compile
    // against this contract (it only needs one at runtime, for DI wiring
    // in Program.cs).
    public interface IBookService
    {
        Task<IEnumerable<BookDto>> GetAllBooksAsync();
        Task<IEnumerable<BookDto>> SearchBooksAsync(BookFilterDto filter);
        Task<BookDto?> GetBookByIdAsync(int id);
        Task<BookDto> CreateBookAsync(CreateBookDto dto);
        Task<bool> UpdateBookAsync(UpdateBookDto dto);
        Task<bool> DeleteBookAsync(int id);
        Task<DashboardDto> GetDashboardDataAsync();

        // Buy flow: marks the book Sold and records the checkout details.
        // Returns null if the book doesn't exist or is already sold.
        Task<OrderDto?> PurchaseBookAsync(int bookId, CheckoutDto dto);

        // Bulk cart buy: purchases all books in one shot, returns per-book
        // success/failure so the caller can show partial results.
        Task<CartOrderResultDto> PurchaseCartAsync(CartCheckoutDto dto);
    }
}
