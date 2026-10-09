import { requestJson } from "@/lib/api-client";
import CatalogueSearch from "../catalogue-search";

export const dynamic = "force-dynamic";

export default async function AuthorSearchPage() {
  const books = await requestJson("/books");
  const catalogueBooks = books.map((book) => ({
    id: String(book._id),
    title: book.title,
    genre: book.genre ?? "",
    authorName: book.authorId?.name ?? "Unknown author",
  }));

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Books</h1>
      <p className="mb-6 text-gray-600">
        Search the catalogue and read about books by every author.
      </p>
      <CatalogueSearch books={catalogueBooks} showReviewLink={false} />
    </div>
  );
}
