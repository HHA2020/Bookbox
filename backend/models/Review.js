import mongoose from "mongoose";

// Bridge entity linking a Reviewer to a Book.
const ReviewSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "bookId is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reviewer",
      required: [true, "userId is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

ReviewSchema.index({ bookId: 1 });
ReviewSchema.index({ userId: 1 });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
