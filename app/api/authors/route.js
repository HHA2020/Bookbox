import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import { handleError, pick, readJson } from "@/lib/api";

const FIELDS = ["name", "bio", "nationality", "birthYear"];

// GET /api/authors — list all authors
export async function GET() {
  try {
    await dbConnect();
    const authors = await Author.find().sort({ name: 1 });
    return Response.json(authors);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/authors — create author profile
export async function POST(request) {
  try {
    await dbConnect();
    const body = await readJson(request);
    const author = await Author.create(pick(body, FIELDS));
    return Response.json(author, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
