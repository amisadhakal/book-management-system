using BookManagement.Application.Interfaces;
using BookManagement.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BookManagement.Application
{
    // Keeps DI wiring next to the layer it configures, so Program.cs
    // just calls builder.Services.AddApplication() without needing to
    // know BookService exists.
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<IBookService, BookService>();
            return services;
        }
    }
}
