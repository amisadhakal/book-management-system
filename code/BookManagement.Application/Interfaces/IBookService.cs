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
        Task<BookDto?> GetBookByIdAsync(int id);
        Task<BookDto> CreateBookAsync(CreateBookDto dto);
        Task<bool> UpdateBookAsync(UpdateBookDto dto);
        Task<bool> DeleteBookAsync(int id);
    }
}
