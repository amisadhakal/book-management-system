# Book Management System — Clean Architecture (ASP.NET Core MVC + EF Core + SQL Server)

## Solution layout

```
BookManagement.sln
├── BookManagement.Domain          (innermost — no dependencies)
│   └── Entities/Book.cs
│
├── BookManagement.Application      (depends only on Domain)
│   ├── DTOs/                       BookDto, CreateBookDto, UpdateBookDto
│   ├── Interfaces/                 IBookRepository, IBookService
│   ├── Services/BookService.cs     business logic — maps DTOs <-> entity
│   └── DependencyInjection.cs      AddApplication()
│
├── BookManagement.Infrastructure   (depends on Application + Domain)
│   ├── Data/ApplicationDbContext.cs
│   ├── Repositories/BookRepository.cs   implements IBookRepository via EF Core
│   └── DependencyInjection.cs      AddInfrastructure()
│
└── BookManagement.Web              (depends on Application + Infrastructure)
    ├── Controllers/BooksController.cs   depends ONLY on IBookService
    ├── Views/Books/*.cshtml
    ├── Program.cs                  the Composition Root
    └── appsettings.json
```

### The dependency rule

Arrows point inward only:

```
Web  ---->  Infrastructure ----\
  \                              ---->  Application  ---->  Domain
   \-------------------------->/
```

- **Domain** knows about nothing else. Just the `Book` class.
- **Application** knows about Domain only. It defines *interfaces*
  (`IBookRepository`) it needs but doesn't implement them.
- **Infrastructure** knows about Application + Domain, and *implements*
  `IBookRepository` using EF Core — this is the only project that
  references `Microsoft.EntityFrameworkCore.SqlServer`.
- **Web** knows about Application (for DTOs/`IBookService`) and
  Infrastructure (only so `Program.cs` can wire everything together at
  startup). `BooksController` itself only ever asks for `IBookService`.

This is Dependency Inversion in practice: the Application layer defines
*what* it needs (`IBookRepository`), and Infrastructure provides *how*
(EF Core + SQL Server) — without Application ever depending on
Infrastructure.

## Setup

1. Install the .NET 8 SDK and SQL Server / LocalDB.
2. Unzip and `cd` into the `BookManagement` folder (the one with
   `BookManagement.sln`).
3. Restore all four projects at once:
   ```
   dotnet restore
   ```
4. Check `BookManagement.Web/appsettings.json` → `ConnectionStrings:DefaultConnection`
   and adjust it if you're not using LocalDB.
5. EF Core migrations need to know which project has the `DbContext`
   (Infrastructure) and which project to run as the app (Web):
   ```
   dotnet tool install --global dotnet-ef   # once, if not already installed
   dotnet ef migrations add InitialCreate --project BookManagement.Infrastructure --startup-project BookManagement.Web
   dotnet ef database update --project BookManagement.Infrastructure --startup-project BookManagement.Web
   ```
   This creates the `BookManagementDb` database and `Books` table.
6. Run the Web project:
   ```
   dotnet run --project BookManagement.Web
   ```
7. Browse to the printed URL — it redirects to `/Books`.

## Workflow through the layers — "Add a Book" end to end

1. **Web/View** — `Create.cshtml` (bound to `CreateBookDto`) posts the form
   to `BooksController.Create(CreateBookDto dto)`.
2. **Web/Controller** — model binding fills `dto`; `ModelState.IsValid`
   runs the `[Required]`/`[Range]` attributes declared *on the DTO in the
   Application layer*. If invalid, the controller just re-renders the
   view — it never reaches the service.
3. **Application/Service** — the controller calls
   `_bookService.CreateBookAsync(dto)`. `BookService` (Application layer)
   maps the DTO onto a new `Book` **Domain entity**, then calls
   `_bookRepository.AddAsync(book)` and `SaveChangesAsync()` — but it only
   knows `IBookRepository`, not that EF Core exists.
4. **Infrastructure/Repository** — the DI container has wired
   `IBookRepository` to `BookRepository`, so those calls actually run
   `_context.Books.AddAsync(book)` and `_context.SaveChangesAsync()`
   against `ApplicationDbContext`.
5. **SQL Server** — `SaveChangesAsync()` is where EF Core generates and
   executes the real `INSERT INTO Books (...) VALUES (...)`.
6. **Back up the stack** — the new entity flows back to `BookService`,
   which maps it to a `BookDto` and returns it to the controller, which
   redirects to `Index`.
7. **Read** — `Index()` calls `_bookService.GetAllBooksAsync()` →
   `BookRepository.GetAllAsync()` → `SELECT * FROM Books` → mapped to
   `IEnumerable<BookDto>` → rendered by `Index.cshtml`.

Edit and Delete follow the same path — Controller → `IBookService` →
`IBookRepository` → EF Core → SQL Server — with `Update`/`Remove` +
`SaveChangesAsync()` instead of `Add`.

## Why this is "clean"

- `BooksController` has **zero knowledge** of EF Core, connection strings,
  or SQL Server — swap SQL Server for PostgreSQL and only
  `BookManagement.Infrastructure` changes.
- `BookService`'s business logic (mapping, orchestrating the CRUD steps)
  can be unit-tested with an in-memory fake `IBookRepository` — no real
  database needed.
- Validation rules live with the DTOs in Application, not scattered across
  the Web project or baked into the Domain entity.

No authentication, roles, APIs, or extra features were added — same five
CRUD screens as before, just organized so each layer only depends on the
one beneath it.
