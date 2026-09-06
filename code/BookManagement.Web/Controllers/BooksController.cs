using BookManagement.Application.DTOs;
using BookManagement.Application.Interfaces;
using BookManagement.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

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
        // Also handles search/filter: searchTerm, genre and status all
        // come in as optional query-string params from the filter form
        // on Index.cshtml, e.g. /Books?searchTerm=tolkien&genre=Fantasy
        public async Task<IActionResult> Index(string? searchTerm, Genre? genre, BookStatus? status)
        {
            var filter = new BookFilterDto
            {
                SearchTerm = searchTerm,
                Genre = genre,
                Status = status
            };

            var books = await _bookService.SearchBooksAsync(filter);

            // Echo the current filter back to the view so the form fields
            // stay populated with what the user searched for.
            ViewBag.SearchTerm = searchTerm;
            ViewBag.GenreList = BuildGenreSelectList(genre);
            ViewBag.StatusList = BuildStatusSelectList(status);

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
            ViewBag.GenreList = BuildGenreSelectList(null);
            ViewBag.StatusList = BuildStatusSelectList(null);
            return View();
        }

        // POST /Books/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CreateBookDto dto)
        {
            if (!ModelState.IsValid)
            {
                ViewBag.GenreList = BuildGenreSelectList(dto.Genre);
                ViewBag.StatusList = BuildStatusSelectList(dto.Status);
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
                PublishedYear = book.PublishedYear,
                Genre = book.Genre,
                Status = book.Status
            };

            ViewBag.GenreList = BuildGenreSelectList(dto.Genre);
            ViewBag.StatusList = BuildStatusSelectList(dto.Status);
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
                ViewBag.GenreList = BuildGenreSelectList(dto.Genre);
                ViewBag.StatusList = BuildStatusSelectList(dto.Status);
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

        // Builds a <select> option list from the Genre enum, e.g.
        // "SciFi" -> "Sci Fi" for display, with the current value selected.
        private static List<SelectListItem> BuildGenreSelectList(Genre? selected)
        {
            return Enum.GetValues<Genre>()
                .Select(g => new SelectListItem
                {
                    Value = g.ToString(),
                    Text = System.Text.RegularExpressions.Regex.Replace(g.ToString(), "(?<!^)([A-Z])", " $1"),
                    Selected = selected.HasValue && selected.Value == g
                })
                .ToList();
        }

        private static List<SelectListItem> BuildStatusSelectList(BookStatus? selected)
        {
            return Enum.GetValues<BookStatus>()
                .Select(s => new SelectListItem
                {
                    Value = s.ToString(),
                    Text = System.Text.RegularExpressions.Regex.Replace(s.ToString(), "(?<!^)([A-Z])", " $1"),
                    Selected = selected.HasValue && selected.Value == s
                })
                .ToList();
        }
    }
}
