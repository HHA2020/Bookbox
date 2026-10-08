import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import {
  assertObjectId,
  handleError,
  noContent,
  notFound,
  pick,
  readJson,
} from "@/lib/api";

// Only the content of a review is editable; it stays attached to the same
// book and reader.
const EDITABLE = ["rating", "notes"];

function populated(query) {
  return query
    .populate({
      path: "bookId",
      select: "title authorId",
      populate: { path: "authorId", select: "name" },
    })
    .populate("userId", "username");
}

// GET /api/reviews/[id] — single review
export async function GET(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();

    const review = await populated(Review.findById(id));
    if (!review) throw notFound("Review");
    return Response.json(review);
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/reviews/[id] — edit rating/notes (dashboard "Manage" step)
export async function PUT(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();
    const body = await readJson(request);

    const review = await populated(
      Review.findByIdAndUpdate(id, pick(body, EDITABLE), {
        returnDocument: "after",
        runValidators: true,
      })
    );
    if (!review) throw notFound("Review");
    return Response.json(review);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/reviews/[id] — remove entry
export async function DELETE(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();

    const review = await Review.findByIdAndDelete(id);
    if (!review) throw notFound("Review");
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
