import mongoose from "mongoose";
import "./Author.js"; // registers the model referenced by authorId

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: [true, "authorId is required"],
    },
    genre: { type: String, trim: true },
    publishedYear: {
      type: Number,
      max: [new Date().getFullYear(), "Published year can't be in the future"],
    },
  },
  { timestamps: true }
);

BookSchema.index({ genre: 1 });
BookSchema.index({ authorId: 1 });

export default mongoose.models.Book || mongoose.model("Book", BookSchema);
