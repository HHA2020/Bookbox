import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Reviewer from "@/models/Reviewer";
import {
  assertObjectId,
  handleError,
  noContent,
  notFound,
  pick,
  readJson,
} from "@/lib/api";

const FIELDS = ["username", "email", "bio"];

// GET /api/reviewers/[id] — single reviewer
export async function GET(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();

    const reviewer = await Reviewer.findById(id);
    if (!reviewer) throw notFound("Reviewer");
    return Response.json(reviewer);
  } catch (err) {
    return handleError(err);
  }
}

// PUT /api/reviewers/[id] — update profile (bio, username, email)
export async function PUT(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();
    const body = await readJson(request);

    const reviewer = await Reviewer.findByIdAndUpdate(id, pick(body, FIELDS), {
      returnDocument: "after",
      runValidators: true,
    });
    if (!reviewer) throw notFound("Reviewer");
    return Response.json(reviewer);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/reviewers/[id] — delete user and their reviews
export async function DELETE(request, ctx) {
  try {
    const { id } = await ctx.params;
    assertObjectId(id);
    await dbConnect();

    const reviewer = await Reviewer.findByIdAndDelete(id);
    if (!reviewer) throw notFound("Reviewer");
    await Review.deleteMany({ userId: id });
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}
