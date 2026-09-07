# Book Management Client (React)

A React (Vite) frontend for the BookManagement .NET API, replacing the old
Razor Views frontend in `BookManagement.Web`.

## Setup

```bash
cd book-management-client
npm install
npm run dev
```

The app runs at http://localhost:5173 and expects the API at the URL in
`.env` (`VITE_API_URL`, defaults to http://localhost:5226).

## Running the whole stack

1. Backend: `cd BookManagement.Web && dotnet run` (serves the API at
   http://localhost:5226 per `Properties/launchSettings.json`).
2. Frontend: `cd book-management-client && npm run dev`.

CORS is already configured in `Program.cs` to allow `http://localhost:5173`.

## Structure

- `src/api/client.js` — axios client + one function per API endpoint.
- `src/pages/` — BooksList, BookForm (create/edit), BookDetails, Dashboard.
- `src/components/` — Layout (nav bar), Stars.
