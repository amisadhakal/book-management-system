using BookManagement.Application.DTOs;
using BookManagement.Domain.Entities;

namespace BookManagement.Application.Interfaces
{
    // This interface is defined in the Application layer but IMPLEMENTED
    // in the Infrastructure layer (Dependency Inversion Principle).
    // The Application layer only knows "I can ask for books" — it has no
    // idea EF Core or SQL Server exist behind this contract.
    public interface IBookRepository
    {
        Task<IEnumerable<Book>> GetAllAsync();
        Task<Book?> GetByIdAsync(int id);
        Task AddAsync(Book book);
        void Update(Book book);
        void Remove(Book book);
        Task<bool> ExistsAsync(int id);
        Task SaveChangesAsync();

        // Search/filter feature: applies SearchTerm/Genre/Status filters
        // at the database level (translated to SQL by EF Core) instead
        // of pulling every row into memory first.
        Task<IEnumerable<Book>> GetFilteredAsync(BookFilterDto filter);
    }
}
