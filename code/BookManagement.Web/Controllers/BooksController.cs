using BookManagement.Application.DTOs;
using BookManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BookManagement.Web.Controllers
{
    // Notice the constructor only asks for IBookService. This controller
    // has never heard of ApplicationDbContext, EF Core, or SQL Server —
    // it doesn't even have a project reference to Infrastructure. That's
    // the point of Clean Architecture: swap SQL Server for PostgreSQL, or
    // even swap EF Core for Dapper, and this file never changes.
    public class BooksController : Controller
    {
        private readonly IBookService _bookService;

        public BooksController(IBookService bookService)
        {
            _bookService = bookService;
        }

        // GET /Books
        public async Task<IActionResult> Index()
        {
            var books = await _bookService.GetAllBooksAsync();
            return View(books);
        }

        // GET /Books/Details/5
        public async Task<IActionResult> Details(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
            {
                return NotFound();
            }
            return View(book);
        }

        // GET /Books/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST /Books/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CreateBookDto dto)
        {
            if (!ModelState.IsValid)
            {
                return View(dto);
            }

            await _bookService.CreateBookAsync(dto);
            return RedirectToAction(nameof(Index));
        }

        // GET /Books/Edit/5
        public async Task<IActionResult> Edit(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            var dto = new UpdateBookDto
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                Price = book.Price,
                PublishedYear = book.PublishedYear
            };

            return View(dto);
        }

        // POST /Books/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, UpdateBookDto dto)
        {
            if (id != dto.Id)
            {
                return NotFound();
            }

            if (!ModelState.IsValid)
            {
                return View(dto);
            }

            var success = await _bookService.UpdateBookAsync(dto);
            if (!success)
            {
                return NotFound();
            }

            return RedirectToAction(nameof(Index));
        }

        // GET /Books/Delete/5
        public async Task<IActionResult> Delete(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
            {
                return NotFound();
            }
            return View(book);
        }

        // POST /Books/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _bookService.DeleteBookAsync(id);
            return RedirectToAction(nameof(Index));
        }
    }
}
