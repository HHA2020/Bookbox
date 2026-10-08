"use client";
import { use, useState } from "react";

export default function BookReviewPage({ params }) {
  const { id } = use(params);
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Future POST request to /api/reviews goes here
    console.log("Submitting review:", { bookId: id, rating, notes });
    alert("Review published!");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold mb-2">Book Details</h1>
      <p className="text-gray-600 mb-6">Leave your thoughts on this title.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block font-semibold mb-1">
            Instant Star Rating
          </label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="border p-2 rounded w-full"
            required
          >
            <option value="" disabled>
              Select a rating...
            </option>
            <option value="5">⭐⭐⭐⭐⭐ - Masterpiece</option>
            <option value="4">⭐⭐⭐⭐ - Great</option>
            <option value="3">⭐⭐⭐ - Good</option>
            <option value="2">⭐⭐ - Fair</option>
            <option value="1">⭐ - Poor</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Reading Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 rounded w-full h-32"
            placeholder="Write your review here..."
            required
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white font-bold py-2 rounded hover:bg-gray-800"
        >
          Publish Review
        </button>
      </form>
    </div>
  );
}
