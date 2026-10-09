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

BOOKBOX

Team Members

Hein Htet Aung, Than Kyaw Oo, Paing Hein Soe.

Project Description

Bookbox is a book review similar to that of Letterboxd. But Instead of reviewing movies, users can upload their own books and other users can review them. When in the opening homepage, user can press 2 buttons to determine what kind of user they are. There are 2 types of users.

Author - Have 2 pages. The first page is a Profile page where they can (1) upload books by filling relevant information, (2) delete books they have uploaded if they want to, (3) search up all of their books they have uploaded. the second page is to search all the books written by every author and they can press the book to see what are the reviews given.

Reader - Have 2 pages. The first page is a Profile page where they can (1) search books they have reviewed before, (2) edit the reviews they have already given, (3) delete the reviews they have given. On the second page, the user can search books by title and read all the reviews given to them and they can upload their own reviews and ratings.

Tools 


Language  - JavaScript
Frontend -  Next.js and React
Backend - Next.js API route handler
Full-stack framework and routing - Next.js 16 App Router
Database - MongoDB
Database library - Mongoose
Styling - Tailwind CSS 4 with PostCSS and global CSS
Linting - ESLint 9
Runtime/package manager - Node.js and npm



System Architecture 

Frontend 
-app
  - author-dashboard
  - author-search
  - books
      -id
  - reader-dashboard
  - reader-search
Backend 
-app
  - api
    - authors
      - id
    - books
      - id
    - reviewers
      - id
    - reviews
      - id

Screenshots

main page 
<img width="1919" height="846" alt="image" src="https://github.com/user-attachments/assets/0be2ed55-3dd6-46fb-a995-91f7acc1c423" />

Author profile Dashboard
<img width="1919" height="887" alt="image" src="https://github.com/user-attachments/assets/0ca5ce49-3a85-489f-9f58-62121838447e" />

Author Search bar
<img width="1919" height="881" alt="image" src="https://github.com/user-attachments/assets/47b887a0-d26a-4cc2-95eb-247ffae46719" />

<img width="1919" height="510" alt="image" src="https://github.com/user-attachments/assets/4966ae7b-2153-45ad-bc7d-be974e9f16e1" />

Reader profile Dashboard
<img width="1903" height="866" alt="image" src="https://github.com/user-attachments/assets/db714747-36fb-496f-a2a8-fddbabc7a1fa" />


Reader Search bar
<img width="1913" height="835" alt="image" src="https://github.com/user-attachments/assets/d7d38dc5-8fdb-43d8-9b79-4cec5b202330" />


Reader Review page
<img width="1919" height="407" alt="image" src="https://github.com/user-attachments/assets/e53e8280-9972-4765-b81f-3df58003c65a" />









