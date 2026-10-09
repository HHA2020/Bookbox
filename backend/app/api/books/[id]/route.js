import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import Book from "@/models/Book";
import Review from "@/models/Review";
import {
  assertObjectId,
  assertRefExists,
  handleError,
  noContent,
  notFound,
  pick,
  readJson,
} from "@/lib/api";

const FIELDS = ["title", "authorId", "genre", "publishedYear"];

// GET /api/books/[id] — book with populated author data
export async function GET(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();

    const book = await Book.findById(id).populate("authorId");
    if (!book) throw notFound("Book");
    return Response.json(book);
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/books/[id] — modify book metadata or author link
export async function PUT(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();
    const data = pick(await readJson(request), FIELDS);
    await assertRefExists(Author, data.authorId, "authorId");

    const book = await Book.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    }).populate("authorId");
    if (!book) throw notFound("Book");
    return Response.json(book);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/books/[id] — delete book record and its reviews
export async function DELETE(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();

    const book = await Book.findByIdAndDelete(id);
    if (!book) throw notFound("Book");
    await Review.deleteMany({ bookId: id });
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
