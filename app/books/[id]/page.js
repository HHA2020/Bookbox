"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { READER_ID_STORAGE_KEY } from "@/lib/reader-identity";

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Request failed (${response.status})`);
  }

  return data;
}

export default function BookReviewPage({ params }) {
  const { id } = use(params);
  const [book, setBook] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedReaderName, setSelectedReaderName] = useState("");
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPageData() {
      setLoading(true);
      setError("");
      try {
        const [bookData, reviewerData] = await Promise.all([
          requestJson(`/api/books/${encodeURIComponent(id)}`),
          requestJson("/api/reviewers"),
        ]);
        if (!active) return;
        setBook(bookData);
        const storedUserId = window.localStorage.getItem(READER_ID_STORAGE_KEY);
        const selectedReader = reviewerData.find(
          (reviewer) => String(reviewer._id) === storedUserId
        );
        setSelectedUserId(selectedReader ? String(selectedReader._id) : "");
        setSelectedReaderName(selectedReader?.username ?? "");
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPageData();
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      await requestJson("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: id,
          userId: selectedUserId,
          rating: Number(rating),
          notes,
        }),
      });
      setRating("");
      setNotes("");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-3xl font-bold">
        {loading ? "Loading book..." : book?.title ?? "Book not found"}
      </h1>
      {book && (
        <p className="mb-6 text-gray-600">
          by {book.authorId?.name ?? "Unknown author"}
          {book.genre ? ` · ${book.genre}` : ""}
        </p>
      )}

      {error && (
        <p role="alert" className="mb-4 rounded bg-red-100 p-3 text-red-800">
          {error}
        </p>
      )}

      {success && (
        <div className="mb-4 rounded bg-green-100 p-3 text-green-800" role="status">
          Review published. You can find it in{" "}
          <Link href="/dashboard" className="font-semibold underline">
            Reader Review
          </Link>
          .
        </div>
      )}

      {!loading && book && (
        !selectedUserId ? (
          <p className="text-gray-600">
            Choose your reader identity in{" "}
            <Link href="/dashboard" className="font-semibold text-blue-600 hover:underline">
              Profile
            </Link>
            {" "}before writing a review.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">Reviewing as {selectedReaderName}</p>

            <div>
              <label className="mb-1 block font-semibold" htmlFor="rating">
                Rating
              </label>
              <select
                id="rating"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className="w-full rounded border p-2"
                required
              >
                <option value="" disabled>
                  Select a rating...
                </option>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} / 5
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold" htmlFor="notes">
                Review
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="h-32 w-full rounded border p-2"
                placeholder="Write your review..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedUserId}
              className="rounded bg-black py-2 font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Review"}
            </button>
          </form>
        )
      )}
    </div>
  );
}
