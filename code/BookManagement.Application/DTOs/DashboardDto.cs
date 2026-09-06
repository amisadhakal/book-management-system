namespace BookManagement.Application.DTOs
{
    // Small value-object-style DTOs that feed the dashboard's charts.
    public class GenreCountDto
    {
        public string Genre { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class StatusCountDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class YearTrendDto
    {
        public int Year { get; set; }
        public int Count { get; set; }
    }

    public class TopAuthorDto
    {
        public string Author { get; set; } = string.Empty;
        public int BookCount { get; set; }
    }

    // Everything the Dashboard view needs, assembled in one service call
    // so the controller makes a single round trip instead of five.
    public class DashboardDto
    {
        public int TotalBooks { get; set; }
        public decimal TotalInventoryValue { get; set; }
        public decimal AveragePrice { get; set; }
        public int TotalAuthors { get; set; }

        public List<GenreCountDto> BooksPerGenre { get; set; } = new();
        public List<StatusCountDto> BooksPerStatus { get; set; } = new();
        public List<YearTrendDto> BooksPerPublishedYear { get; set; } = new();
        public List<TopAuthorDto> TopAuthors { get; set; } = new();
        public List<BookDto> RecentlyAdded { get; set; } = new();

        // Simple price-distribution buckets for a chart (e.g. "$0-10", "$10-25"...).
        public Dictionary<string, int> PriceDistribution { get; set; } = new();
    }
}
