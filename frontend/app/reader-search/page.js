import { requestJson } from "@/lib/api-client";
import CatalogueSearch from "../catalogue-search";

export const dynamic = "force-dynamic";

export default async function ReaderSearchPage() {
  const books = await requestJson("/books");
  const catalogueBooks = books.map((book) => ({
    id: String(book._id),
    title: book.title,
    genre: book.genre ?? "",
    authorName: book.authorId?.name ?? "Unknown author",
  }));

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Book Search</h1>
      <CatalogueSearch books={catalogueBooks} />
    </div>
  );
}
