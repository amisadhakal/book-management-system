using BookManagement.Application.DTOs;
using BookManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BookManagement.Web.Controllers
{
    // Same pattern as BooksController: depends only on IBookService.
    // One action, one call — GetDashboardDataAsync() assembles every
    // number and chart series the React dashboard page needs.
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly IBookService _bookService;

        public DashboardController(IBookService bookService)
        {
            _bookService = bookService;
        }

        // GET /api/dashboard
        [HttpGet]
        public async Task<ActionResult<DashboardDto>> Index()
        {
            var dashboard = await _bookService.GetDashboardDataAsync();
            return Ok(dashboard);
        }
    }
}
