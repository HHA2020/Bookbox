"use client";
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentUser } from "@/components/CurrentUser";
import RatingSelect, { stars } from "@/components/RatingSelect";

export default function BookReviewPage({ params }) {
  const { id } = use(params);
  const { user, userId } = useCurrentUser();

  const [book, setBook] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { ok: boolean, text }

  const loadReviews = useCallback(
    () => apiFetch(`/api/reviews?bookId=${id}`).then(setReviews),
    [id]
  );

  useEffect(() => {
    apiFetch(`/api/books/${id}`)
      .then(setBook)
      .catch((err) => setLoadError(err.message));
    loadReviews().catch(() => {});
  }, [id, loadReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({ bookId: id, userId, rating: Number(rating), notes }),
      });
      setRating("");
      setNotes("");
      await loadReviews();
      setMessage({ ok: true, text: "Review published! It's listed below and in Manage." });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Book not found</h1>
        <p className="text-gray-600 mb-4">{loadError}</p>
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Back to the catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {book ? (
          <>
            <h1 className="text-3xl font-bold mb-1">{book.title}</h1>
            <p className="text-gray-600">
              by {book.authorId?.name ?? "Unknown author"}
              {book.publishedYear ? ` · ${book.publishedYear}` : ""}
            </p>
            {book.genre && (
              <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {book.genre}
              </span>
            )}
          </>
        ) : (
          <p className="text-gray-500">Loading book…</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <div>
            <label htmlFor="rating" className="block font-semibold mb-1">
              Instant Star Rating
            </label>
            <RatingSelect id="rating" value={rating} onChange={setRating} />
          </div>

          <div>
            <label htmlFor="notes" className="block font-semibold mb-1">
              Reading Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border p-2 rounded w-full h-32"
              placeholder="Write your review here..."
              required
            />
          </div>

          {message && (
            <p className={message.ok ? "text-green-700" : "text-red-600"}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={!userId || submitting}
            className="bg-black text-white font-bold py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting
              ? "Publishing…"
              : user
                ? `Publish Review as ${user.username}`
                : "Publish Review"}
          </button>
        </form>
      </div>

      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first!</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews.map((review) => (
              <li key={review._id} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {review.userId?.username ?? "Deleted user"}
                    {review.userId?._id === userId && (
                      <span className="ml-2 text-xs text-gray-500">(you)</span>
                    )}
                  </span>
                  <span className="text-sm">{stars(review.rating)}</span>
                </div>
                {review.notes && <p className="text-gray-700 mt-1">{review.notes}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
