using BookManagement.Application.DTOs;
using BookManagement.Application.Interfaces;
using BookManagement.Domain.Entities;

namespace BookManagement.Application.Services
{
    // This is where the actual CRUD + analytics workflow logic lives. It
    // depends only on IBookRepository (an abstraction), not on EF Core or
    // SQL Server directly — so this class could be unit-tested with a fake
    // in-memory repository, with no database involved at all.
    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepository;

        public BookService(IBookRepository bookRepository)
        {
            _bookRepository = bookRepository;
        }

        public async Task<IEnumerable<BookDto>> GetAllBooksAsync()
        {
            var books = await _bookRepository.GetAllAsync();
            return books.Select(MapToDto);
        }

        public async Task<IEnumerable<BookDto>> SearchBooksAsync(BookFilterDto filter)
        {
            var books = await _bookRepository.GetFilteredAsync(filter);
            return books.Select(MapToDto);
        }

        public async Task<BookDto?> GetBookByIdAsync(int id)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            return book == null ? null : MapToDto(book);
        }

        public async Task<BookDto> CreateBookAsync(CreateBookDto dto)
        {
            var book = new Book
            {
                Title = dto.Title,
                Author = dto.Author,
                Price = dto.Price,
                PublishedYear = dto.PublishedYear,
                Genre = dto.Genre,
                Status = dto.Status,
                CreatedAt = DateTime.UtcNow
            };

            await _bookRepository.AddAsync(book);
            await _bookRepository.SaveChangesAsync();

            return MapToDto(book);
        }

        public async Task<bool> UpdateBookAsync(UpdateBookDto dto)
        {
            var book = await _bookRepository.GetByIdAsync(dto.Id);
            if (book == null)
            {
                return false;
            }

            book.Title = dto.Title;
            book.Author = dto.Author;
            book.Price = dto.Price;
            book.PublishedYear = dto.PublishedYear;
            book.Genre = dto.Genre;
            book.Status = dto.Status;

            _bookRepository.Update(book);
            await _bookRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBookAsync(int id)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            if (book == null)
            {
                return false;
            }

            _bookRepository.Remove(book);
            await _bookRepository.SaveChangesAsync();
            return true;
        }

        // Assembles every number/chart the Dashboard view needs in one
        // call. For a small-to-medium book catalog, doing the aggregation
        // in memory (LINQ-to-Objects) after one GetAllAsync() is simpler
        // and plenty fast; if the catalog grows large, push each of these
        // aggregates down into repository-level SQL queries instead.
        public async Task<DashboardDto> GetDashboardDataAsync()
        {
            var books = (await _bookRepository.GetAllAsync()).ToList();

            var dashboard = new DashboardDto
            {
                TotalBooks = books.Count,
                TotalInventoryValue = books.Sum(b => b.Price),
                AveragePrice = books.Count == 0 ? 0 : books.Average(b => b.Price),
                TotalAuthors = books.Select(b => b.Author).Distinct().Count(),

                BooksPerGenre = books
                    .GroupBy(b => b.Genre)
                    .Select(g => new GenreCountDto { Genre = g.Key.ToString(), Count = g.Count() })
                    .OrderByDescending(g => g.Count)
                    .ToList(),

                BooksPerStatus = books
                    .GroupBy(b => b.Status)
                    .Select(g => new StatusCountDto { Status = g.Key.ToString(), Count = g.Count() })
                    .OrderByDescending(g => g.Count)
                    .ToList(),

                BooksPerPublishedYear = books
                    .GroupBy(b => b.PublishedYear)
                    .Select(g => new YearTrendDto { Year = g.Key, Count = g.Count() })
                    .OrderBy(g => g.Year)
                    .ToList(),

                TopAuthors = books
                    .GroupBy(b => b.Author)
                    .Select(g => new TopAuthorDto { Author = g.Key, BookCount = g.Count() })
                    .OrderByDescending(g => g.BookCount)
                    .Take(5)
                    .ToList(),

                RecentlyAdded = books
                    .OrderByDescending(b => b.CreatedAt)
                    .Take(5)
                    .Select(MapToDto)
                    .ToList()
            };

            // Bucket prices into simple ranges for a price-distribution chart.
            var buckets = new (string Label, decimal Min, decimal Max)[]
            {
                ("$0-10", 0, 10),
                ("$10-25", 10, 25),
                ("$25-50", 25, 50),
                ("$50-100", 50, 100),
                ("$100+", 100, decimal.MaxValue)
            };

            foreach (var bucket in buckets)
            {
                var count = books.Count(b => b.Price >= bucket.Min && b.Price < bucket.Max);
                dashboard.PriceDistribution[bucket.Label] = count;
            }

            return dashboard;
        }

        private static BookDto MapToDto(Book book) => new()
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            Price = book.Price,
            PublishedYear = book.PublishedYear,
            Genre = book.Genre,
            Status = book.Status,
            CreatedAt = book.CreatedAt
        };
    }
}
