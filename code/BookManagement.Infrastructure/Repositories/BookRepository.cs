using BookManagement.Application.Interfaces;
using BookManagement.Domain.Entities;
using BookManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookManagement.Infrastructure.Repositories
{
    // This class is the ONLY place in the entire solution that issues
    // EF Core / SQL Server calls for books. If you ever swapped SQL
    // Server for another database, or EF Core for Dapper, this is the
    // only file that would need to change — Application and Web
    // wouldn't notice, since they only know about IBookRepository.
    public class BookRepository : IBookRepository
    {
        private readonly ApplicationDbContext _context;

        public BookRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Book>> GetAllAsync()
        {
            return await _context.Books.ToListAsync();
        }

        public async Task<Book?> GetByIdAsync(int id)
        {
            return await _context.Books.FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task AddAsync(Book book)
        {
            await _context.Books.AddAsync(book);
        }

        public void Update(Book book)
        {
            _context.Books.Update(book);
        }

        public void Remove(Book book)
        {
            _context.Books.Remove(book);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Books.AnyAsync(b => b.Id == id);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
