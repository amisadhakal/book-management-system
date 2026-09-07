using BookManagement.Application;
using BookManagement.Infrastructure;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Plain API controllers now — no Razor views. Enums are serialized as
// their string names ("Fantasy" instead of 3) so the React frontend
// never has to know the underlying numeric values.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// The React dev server (Vite, default port 5173) runs on a different
// origin than this API, so the browser needs an explicit CORS policy
// to allow the calls through. Add your deployed frontend's URL here too.
const string ReactClientPolicy = "ReactClient";
builder.Services.AddCors(options =>
{
    options.AddPolicy(ReactClientPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Each layer registers its own services via a DI extension method.
// Program.cs (the "Composition Root") is the ONE place in the whole
// solution allowed to know that both Application and Infrastructure
// exist and need to be wired together.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();

// Serves wwwroot/uploads/covers/* as static files so cover image URLs
// returned by the API (e.g. "/uploads/covers/xyz.jpg") actually resolve.
app.UseStaticFiles();

app.UseRouting();

app.UseCors(ReactClientPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();
