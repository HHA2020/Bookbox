import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import Book from "@/models/Book";
import {
  assertObjectId,
  assertRefExists,
  handleError,
  pick,
  readJson,
} from "@/lib/api";

const FIELDS = ["title", "authorId", "genre", "publishedYear"];

// GET /api/books — catalogue, with optional ?genre= and ?authorId= filters
export async function GET(request) {
  try {
    const params = request.nextUrl.searchParams;
    const filter = {};

    const genre = params.get("genre");
    if (genre) filter.genre = genre;

    const authorId = params.get("authorId");
    if (authorId) {
      assertObjectId(authorId, "authorId");
      filter.authorId = authorId;
    }

    await dbConnect();
    const books = await Book.find(filter)
      .populate("authorId", "name")
      .sort({ title: 1 });
    return Response.json(books);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/books — insert new book title
export async function POST(request) {
  try {
    await dbConnect();
    const data = pick(await readJson(request), FIELDS);
    await assertRefExists(Author, data.authorId, "authorId");

    const book = await Book.create(data);
    await book.populate("authorId", "name");
    return Response.json(book, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

