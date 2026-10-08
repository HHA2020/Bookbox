import { connection } from "next/server";
import dbConnect from "@/lib/mongodb";
import "@/models/Author"; // registers the model so populate("authorId") works
import Book from "@/models/Book";

export default async function BrowsePage() {
  // Load fresh data on every request instead of freezing it at build time.
  await connection();

  // Server components query the database directly; /api/books is for
  // client components and external callers.
  await dbConnect();
  const books = await Book.find()
    .populate("authorId", "name")
    .sort({ title: 1 })
    .lean();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explore Catalogue</h1>
      {books.length === 0 && (
        <p className="text-gray-600">
          No books yet. Run <code>npm run seed</code> to add sample data.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={String(book._id)}
            className="p-4 border rounded-lg bg-white shadow hover:shadow-md transition"
          >
            <h2 className="font-bold text-xl">{book.title}</h2>
            <p className="text-gray-600">by {book.authorId?.name ?? "Unknown author"}</p>
            <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {book.genre}
            </span>
            <div className="mt-4">
              <a
                href={`/books/${book._id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Rate & Review &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
