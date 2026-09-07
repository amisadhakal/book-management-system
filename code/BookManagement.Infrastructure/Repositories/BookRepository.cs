using BookManagement.Application.DTOs;
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

        // Builds the query incrementally so EF Core translates only the
        // filters that are actually set into a single SQL WHERE clause —
        // no unnecessary conditions, no pulling the whole table into memory.
        public async Task<IEnumerable<Book>> GetFilteredAsync(BookFilterDto filter)
        {
            var query = _context.Books.AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var term = filter.SearchTerm.Trim();
                query = query.Where(b =>
                    EF.Functions.Like(b.Title, $"%{term}%") ||
                    EF.Functions.Like(b.Author, $"%{term}%"));
            }

            if (filter.Genre.HasValue)
            {
                query = query.Where(b => b.Genre == filter.Genre.Value);
            }

            if (filter.Status.HasValue)
            {
                query = query.Where(b => b.Status == filter.Status.Value);
            }

            return await query.OrderBy(b => b.Title).ToListAsync();
        }

        public async Task AddOrderAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
        }
    }
}
