"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentUser } from "@/components/CurrentUser";
import RatingSelect, { stars } from "@/components/RatingSelect";

export default function DashboardPage() {
  const { user, userId, ready } = useCurrentUser();
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    apiFetch(`/api/reviews?userId=${userId}`)
      .then((list) => {
        setReviews(list);
        setError(null);
      })
      .catch((err) => setError(err.message));
  }, [userId]);

  function replaceReview(updated) {
    setReviews((list) => list.map((r) => (r._id === updated._id ? updated : r)));
  }

  function removeReview(id) {
    setReviews((list) => list.filter((r) => r._id !== id));
  }

  let body;
  if (error) {
    body = <p className="text-red-600">{error}</p>;
  } else if (ready && !userId) {
    body = <p className="text-gray-600">No reviewers yet. Run <code>npm run seed</code>.</p>;
  } else if (!reviews) {
    body = <p className="text-gray-500">Loading…</p>;
  } else if (reviews.length === 0) {
    body = (
      <p className="text-gray-600">
        No reviews yet.{" "}
        <Link href="/" className="text-blue-600 hover:underline">
          Browse books
        </Link>{" "}
        to write one.
      </p>
    );
  } else {
    body = (
      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onSaved={replaceReview}
            onDeleted={removeReview}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">My Reading Diary</h1>
      <p className="text-gray-600 mb-6">
        {user ? `Reviews by ${user.username}` : " "}
      </p>
      {body}
    </div>
  );
}

function ReviewCard({ review, onSaved, onDeleted }) {
  const [mode, setMode] = useState("view"); // "view" | "edit" | "confirmDelete"
  const [rating, setRating] = useState(String(review.rating));
  const [notes, setNotes] = useState(review.notes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const book = review.bookId;

  function startEdit() {
    setRating(String(review.rating));
    setNotes(review.notes);
    setError(null);
    setMode("edit");
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const updated = await apiFetch(`/api/reviews/${review._id}`, {
        method: "PUT",
        body: JSON.stringify({ rating: Number(rating), notes }),
      });
      onSaved(updated);
      setMode("view");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/reviews/${review._id}`, { method: "DELETE" });
      onDeleted(review._id);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="font-bold text-lg">
            {book ? (
              <Link href={`/books/${book._id}`} className="hover:underline">
                {book.title}
              </Link>
            ) : (
              "Deleted book"
            )}
          </h2>
          {book?.authorId?.name && (
            <p className="text-sm text-gray-500">by {book.authorId.name}</p>
          )}
        </div>

        {mode === "view" && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={startEdit}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold"
            >
              Edit
            </button>
            <button
              onClick={() => setMode("confirmDelete")}
              className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-semibold"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {mode === "edit" ? (
        <form onSubmit={save} className="flex flex-col gap-3 mt-3">
          <RatingSelect value={rating} onChange={setRating} />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 rounded w-full h-24"
            placeholder="Reading notes"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="px-3 py-1 bg-black text-white hover:bg-gray-800 rounded text-sm font-semibold disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              disabled={busy}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="text-sm mt-2">
            {stars(review.rating)}{" "}
            <span className="text-gray-500">{review.rating} / 5</span>
          </p>
          {review.notes && (
            <p className="text-gray-600 mt-1">&ldquo;{review.notes}&rdquo;</p>
          )}
        </>
      )}

      {mode === "confirmDelete" && (
        <div className="mt-3 flex items-center gap-2 bg-red-50 p-2 rounded">
          <span className="text-sm text-red-800">Delete this review?</span>
          <button
            onClick={remove}
            disabled={busy}
            className="px-3 py-1 bg-red-600 text-white hover:bg-red-700 rounded text-sm font-semibold disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Yes, delete"}
          </button>
          <button
            onClick={() => setMode("view")}
            disabled={busy}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
