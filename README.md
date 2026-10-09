# Bookbox

Bookbox is split into two independent Next.js applications:

```text
frontend/  User-facing pages and components, served on port 3000
backend/   API routes, MongoDB models, database utilities, and seed script
```

## Development

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Install and run the backend in a second terminal:

```bash
cd backend
npm install
npm run dev -- --port 3001
```

The frontend uses `NEXT_PUBLIC_API_URL` to reach the backend. Copy
`frontend/.env.example` to `frontend/.env.local` and set:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/backend/api
```

Copy `backend/.env.example` to `backend/.env.local` and set `MONGODB_URI`
before starting the backend or running its seed script.

The backend API is available under `/backend/api`, for example:

```text
http://localhost:3001/backend/api/books
```

Environment files such as `.env.local` are ignored by Git.
