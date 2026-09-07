using BookManagement.Application.DTOs;
using BookManagement.Application.Interfaces;
using BookManagement.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace BookManagement.Web.Controllers
{
    // Same IBookService dependency as before — only *how the result gets
    // to the caller* changed. Instead of picking a .cshtml view and
    // rendering HTML server-side, every action now returns plain JSON
    // (via Ok(...)/NotFound()/etc.), which any frontend — React, mobile,
    // whatever — can consume. Clean Architecture pays off here: nothing
    // in Domain/Application/Infrastructure had to change for this.
    [ApiController]
    [Route("api/books")]
    public class BooksController : ControllerBase
    {
        private static readonly string[] AllowedCoverExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private const long MaxCoverSizeBytes = 5 * 1024 * 1024; // 5 MB

        private readonly IBookService _bookService;
        private readonly IWebHostEnvironment _env;

        public BooksController(IBookService bookService, IWebHostEnvironment env)
        {
            _bookService = bookService;
            _env = env;
        }

        // GET /api/books?searchTerm=tolkien&genre=Fantasy&status=Available
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> Index(string? searchTerm, Genre? genre, BookStatus? status)
        {
            var filter = new BookFilterDto
            {
                SearchTerm = searchTerm,
                Genre = genre,
                Status = status
            };

            var books = await _bookService.SearchBooksAsync(filter);
            return Ok(books);
        }

        // GET /api/books/options
        // The React app calls this once to populate the Genre/Status
        // dropdowns, so the enum lists live in one place (the backend).
        [HttpGet("options")]
        public ActionResult GetOptions()
        {
            return Ok(new
            {
                genres = BuildOptionList(Enum.GetValues<Genre>().Cast<Enum>()),
                statuses = BuildOptionList(Enum.GetValues<BookStatus>().Cast<Enum>())
            });
        }

        // GET /api/books/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<BookDto>> Details(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
            {
                return NotFound();
            }
            return Ok(book);
        }

        // POST /api/books  (multipart/form-data so a cover image can ride along)
        [HttpPost]
        public async Task<ActionResult<BookDto>> Create([FromForm] CreateBookDto dto, IFormFile? coverImage)
        {
            if (coverImage != null && coverImage.Length > 0 && !TryValidateCoverImage(coverImage, out var error))
            {
                ModelState.AddModelError(nameof(coverImage), error!);
            }

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (coverImage != null && coverImage.Length > 0)
            {
                dto.CoverImagePath = await SaveCoverImageAsync(coverImage);
            }

            var created = await _bookService.CreateBookAsync(dto);
            return CreatedAtAction(nameof(Details), new { id = created.Id }, created);
        }

        // PUT /api/books/5  (multipart/form-data)
        [HttpPut("{id:int}")]
        public async Task<ActionResult> Edit(int id, [FromForm] UpdateBookDto dto, IFormFile? coverImage)
        {
            if (id != dto.Id)
            {
                return BadRequest("Route id and body id must match.");
            }

            if (coverImage != null && coverImage.Length > 0 && !TryValidateCoverImage(coverImage, out var error))
            {
                ModelState.AddModelError(nameof(coverImage), error!);
            }

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            // dto.CoverImagePath should be posted back from the client as
            // the existing path; only overwrite it if a new file came in.
            if (coverImage != null && coverImage.Length > 0)
            {
                dto.CoverImagePath = await SaveCoverImageAsync(coverImage);
            }

            var success = await _bookService.UpdateBookAsync(dto);
            if (!success)
            {
                return NotFound();
            }

            return NoContent();
        }

        // DELETE /api/books/5
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await _bookService.DeleteBookAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }

        // POST /api/books/5/buy
        // Full checkout flow (name, address, card-style fields) but no
        // real payment processor is involved — card details are validated
        // for shape only and never stored. On success the book flips to
        // BookStatus.Sold and an Order record is created.
        [HttpPost("{id:int}/buy")]
        public async Task<ActionResult<OrderDto>> Buy(int id, [FromBody] CheckoutDto dto)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var order = await _bookService.PurchaseBookAsync(id, dto);
            if (order == null)
            {
                return Conflict("This book doesn't exist or has already been sold.");
            }

            return Ok(order);
        }

        // Builds { value, label } pairs from an enum, e.g.
        // "SciFi" -> "Sci Fi", for the React dropdowns.
        private static List<object> BuildOptionList(IEnumerable<Enum> values)
        {
            return values
                .Select(v => (object)new
                {
                    value = v.ToString(),
                    label = System.Text.RegularExpressions.Regex.Replace(v.ToString()!, "(?<!^)([A-Z])", " $1")
                })
                .ToList();
        }

        // Saves the uploaded file under wwwroot/uploads/covers with a
        // random file name and returns the relative URL to store on the
        // book, e.g. "/uploads/covers/3f2a1c9e4b7d4a2f.jpg". The React
        // app resolves this against the API's base URL to show the image.
        private async Task<string> SaveCoverImageAsync(IFormFile file)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "covers");
            Directory.CreateDirectory(uploadsFolder);

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/covers/{fileName}";
        }

        private static bool TryValidateCoverImage(IFormFile file, out string? error)
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedCoverExtensions.Contains(extension))
            {
                error = "Cover image must be a .jpg, .png, .gif, or .webp file.";
                return false;
            }

            if (file.Length > MaxCoverSizeBytes)
            {
                error = "Cover image must be smaller than 5 MB.";
                return false;
            }

            error = null;
            return true;
        }
    }
}