import mongoose from "mongoose";

const ReviewerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Email is invalid"],
  },
  bio: { type: String, trim: true, default: "" },
  joinedDate: { type: Date, default: Date.now },
});

export default mongoose.models.Reviewer ||
  mongoose.model("Reviewer", ReviewerSchema);
