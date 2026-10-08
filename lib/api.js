import mongoose from "mongoose";

// Every error response has the same shape:
// { error: { message: string, details?: { [field]: string } } }

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(entity) {
  return new ApiError(404, `${entity} not found`);
}

export function noContent() {
  return new Response(null, { status: 204 });
}

// Copies only the listed fields from a request body, so clients can't
// overwrite things like _id or joinedDate.
export function pick(body, fields) {
  const out = {};
  for (const field of fields) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

export async function readJson(request) {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body;
  } catch {}
  throw new ApiError(400, "Request body must be a JSON object");
}

export function assertObjectId(id, label = "id") {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label}: ${id}`);
  }
}

// Converts known errors into a JSON response with the right status code.
export function handleError(err) {
  if (err instanceof ApiError) {
    return errorJson(err.status, err.message, err.details);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = {};
    for (const [field, e] of Object.entries(err.errors)) {
      details[field] = e.message;
    }
    return errorJson(400, "Validation failed", details);
  }

  if (err instanceof mongoose.Error.CastError) {
    return errorJson(400, `Invalid value for ${err.path}`);
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    return errorJson(409, `A record with that ${field} already exists`, {
      [field]: "Must be unique",
    });
  }

  console.error(err);
  return errorJson(500, "Internal server error");
}

function errorJson(status, message, details) {
  const error = details ? { message, details } : { message };
  return Response.json({ error }, { status });
}

// Checks that a referenced document exists (e.g. a book's authorId), so we
// never save a reference to nothing. Skips undefined: required-ness is the
// schema's job.
export async function assertRefExists(Model, id, field) {
  if (id === undefined) return;
  assertObjectId(id, field);
  if (!(await Model.exists({ _id: id }))) {
    throw new ApiError(400, "Validation failed", {
      [field]: `No ${Model.modelName.toLowerCase()} with that id`,
    });
  }
}
