import { connection } from "next/server";
import dbConnect from "@/lib/mongodb";
import "@/models/Author";
import Book from "@/models/Book";
import CatalogueSearch from "../catalogue-search";

export default async function ReaderSearchPage() {
  await connection();
  await dbConnect();
  const books = await Book.find()
    .populate("authorId", "name")
    .sort({ title: 1 })
    .lean();
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
