import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import Book from "@/models/Book";
import {
  ApiError,
  assertObjectId,
  handleError,
  noContent,
  notFound,
  pick,
  readJson,
} from "@/lib/api";

const FIELDS = ["name", "bio", "nationality", "birthYear"];

// GET /api/authors/[id] — single author details
export async function GET(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();

    const author = await Author.findById(id);
    if (!author) throw notFound("Author");
    return Response.json(author);
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/authors/[id] — update author
export async function PUT(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();
    const body = await readJson(request);

    const author = await Author.findByIdAndUpdate(id, pick(body, FIELDS), {
      returnDocument: "after",
      runValidators: true,
    });
    if (!author) throw notFound("Author");
    return Response.json(author);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/authors/[id] — remove author record
// Refuses while books still reference the author, so no book is left orphaned.
export async function DELETE(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();

    const bookCount = await Book.countDocuments({ authorId: id });
    if (bookCount > 0) {
      throw new ApiError(
        409,
        `Author still has ${bookCount} book(s). Delete or reassign them first.`
      );
    }

    const author = await Author.findByIdAndDelete(id);
    if (!author) throw notFound("Author");
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
