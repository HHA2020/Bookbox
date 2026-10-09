import dbConnect from "@/lib/mongodb";
import Book from "@/models/Book";
import Review from "@/models/Review";
import Reviewer from "@/models/Reviewer";
import {
  assertObjectId,
  assertRefExists,
  handleError,
  pick,
  readJson,
} from "@/lib/api";

const FIELDS = ["bookId", "userId", "rating", "notes"];

// GET /api/reviews?bookId=...  — reviews for a book
// GET /api/reviews?userId=...  — a reader's diary
// Both filters can be combined; with neither, returns every review.
export async function GET(request) {
  try {
    const params = request.nextUrl.searchParams;
    const filter = {};
    for (const key of ["bookId", "userId"]) {
      const value = params.get(key);
      if (value) {
        assertObjectId(value, key);
        filter[key] = value;
      }
    }

    await dbConnect();
    const reviews = await Review.find(filter)
      .populate({
        path: "bookId",
        select: "title authorId",
        populate: { path: "authorId", select: "name" },
      })
      .populate("userId", "username")
      .sort({ createdAt: -1 });
    return Response.json(reviews);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/reviews — submit review
export async function POST(request) {
  try {
    await dbConnect();
    const data = pick(await readJson(request), FIELDS);
    await assertRefExists(Book, data.bookId, "bookId");
    await assertRefExists(Reviewer, data.userId, "userId");

    const review = await Review.create(data);
    await review.populate([
      { path: "bookId", select: "title" },
      { path: "userId", select: "username" },
    ]);
    return Response.json(review, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
