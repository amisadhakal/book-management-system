using BookManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BookManagement.Web.Controllers
{
    // Same pattern as BooksController: depends only on IBookService.
    // One action, one call — GetDashboardDataAsync() assembles every
    // number and chart series the view needs.
    public class DashboardController : Controller
    {
        private readonly IBookService _bookService;

        public DashboardController(IBookService bookService)
        {
            _bookService = bookService;
        }

        // GET /Dashboard
        public async Task<IActionResult> Index()
        {
            var dashboard = await _bookService.GetDashboardDataAsync();
            return View(dashboard);
        }
    }
}
