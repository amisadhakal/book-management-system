using BookManagement.Application;
using BookManagement.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add MVC services (controllers + Razor views)
builder.Services.AddControllersWithViews();

// Each layer registers its own services via a DI extension method.
// Program.cs (the "Composition Root") is the ONE place in the whole
// solution allowed to know that both Application and Infrastructure
// exist and need to be wired together.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Books}/{action=Index}/{id?}");

app.Run();
