using BookManagement.Application.DTOs;
using BookManagement.Application.Interfaces;
using BookManagement.Domain.Entities;

namespace BookManagement.Application.Services
{
    // This is where the actual CRUD workflow logic lives. It depends
    // only on IBookRepository (an abstraction), not on EF Core or SQL
    // Server directly — so this class could be unit-tested with a fake
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
                PublishedYear = dto.PublishedYear
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

        private static BookDto MapToDto(Book book) => new()
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            Price = book.Price,
            PublishedYear = book.PublishedYear
        };
    }
}
