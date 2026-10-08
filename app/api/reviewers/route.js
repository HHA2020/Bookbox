import dbConnect from "@/lib/mongodb";
import Reviewer from "@/models/Reviewer";
import { handleError, pick, readJson } from "@/lib/api";

const FIELDS = ["username", "email", "bio"];

// GET /api/reviewers — list members
export async function GET() {
  try {
    await dbConnect();
    const reviewers = await Reviewer.find().sort({ joinedDate: -1 });
    return Response.json(reviewers);
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/reviewers — register user
export async function POST(request) {
  try {
    await dbConnect();
    const body = await readJson(request);
    const reviewer = await Reviewer.create(pick(body, FIELDS));
    return Response.json(reviewer, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
