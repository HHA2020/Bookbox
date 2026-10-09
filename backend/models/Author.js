import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    bio: { type: String, trim: true, default: "" },
    nationality: { type: String, trim: true },
    birthYear: {
      type: Number,
      min: [0, "Birth year must be positive"],
      max: [new Date().getFullYear(), "Birth year can't be in the future"],
    },
  },
  { timestamps: true }
);

// Reuse the compiled model across hot reloads.
export default mongoose.models.Author || mongoose.model("Author", AuthorSchema);
