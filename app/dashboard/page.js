"use client";

import { useEffect, useState } from "react";
import {
  IDENTITY_CHANGE_EVENT,
  READER_ID_STORAGE_KEY,
  READER_NAME_STORAGE_KEY,
} from "@/lib/reader-identity";

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Request failed (${response.status})`);
  }

  return data;
}

export default function DashboardPage() {
  const [reviewers, setReviewers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewSearch, setReviewSearch] = useState("");
  const [form, setForm] = useState({ rating: "", notes: "" });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [error, setError] = useState("");
  const searchQuery = reviewSearch.trim().toLocaleLowerCase();
  const filteredReviews = searchQuery
    ? reviews.filter((review) =>
        review.bookId?.title?.toLocaleLowerCase().includes(searchQuery)
      )
    : reviews;

  useEffect(() => {
    let active = true;

    async function loadReferences() {
      try {
        const reviewerData = await requestJson("/api/reviewers");

        if (!active) return;
        setReviewers(reviewerData);
        const storedUserId = window.localStorage.getItem(READER_ID_STORAGE_KEY);
        const userId = reviewerData.some(
          (reviewer) => String(reviewer._id) === storedUserId
        )
          ? storedUserId
          : String(reviewerData[0]?._id ?? "");
        const selectedReviewer = reviewerData.find(
          (reviewer) => String(reviewer._id) === userId
        );
        setSelectedUserId(userId);
        if (selectedReviewer) {
          window.localStorage.setItem(READER_ID_STORAGE_KEY, userId);
          window.localStorage.setItem(
            READER_NAME_STORAGE_KEY,
            selectedReviewer.username
          );
          window.dispatchEvent(new Event(IDENTITY_CHANGE_EVENT));
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadReferences();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      if (!selectedUserId) {
        setReviews([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await requestJson(
          `/api/reviews?userId=${encodeURIComponent(selectedUserId)}`
        );
        if (active) setReviews(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReviews();
    return () => {
      active = false;
    };
  }, [selectedUserId]);

  function resetForm() {
    setForm({ rating: "", notes: "" });
    setEditingReviewId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await requestJson(`/api/reviews/${editingReviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: Number(form.rating),
          notes: form.notes,
        }),
      });

      resetForm();
      const updatedReviews = await requestJson(
        `/api/reviews?userId=${encodeURIComponent(selectedUserId)}`
      );
      setReviews(updatedReviews);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(review) {
    setEditingReviewId(String(review._id));
    setForm({
      rating: String(review.rating),
      notes: review.notes ?? "",
    });
    setError("");
  }

  async function deleteReview(reviewId) {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;

    setDeletingReviewId(reviewId);
    setError("");
    try {
      await requestJson(`/api/reviews/${reviewId}`, { method: "DELETE" });
      setReviews((current) =>
        current.filter((review) => String(review._id) !== reviewId)
      );
      if (editingReviewId === reviewId) resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingReviewId(null);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Reading Diary</h1>

      <section className="mb-8 rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Choose a reader</h2>
        <label className="block font-semibold mb-1" htmlFor="reviewer">
          Demo reader
        </label>
        <select
          id="reviewer"
          value={selectedUserId}
          onChange={(event) => {
            const userId = event.target.value;
            setSelectedUserId(userId);
            const reviewer = reviewers.find(
              (item) => String(item._id) === userId
            );
            if (reviewer) {
              window.localStorage.setItem(READER_ID_STORAGE_KEY, userId);
              window.localStorage.setItem(
                READER_NAME_STORAGE_KEY,
                reviewer.username
              );
              window.dispatchEvent(new Event(IDENTITY_CHANGE_EVENT));
            }
            setReviewSearch("");
            resetForm();
          }}
          className="mb-4 w-full rounded border p-2"
          disabled={reviewers.length === 0}
        >
          {reviewers.length === 0 && <option value="">No readers found</option>}
          {reviewers.map((reviewer) => (
            <option key={reviewer._id} value={String(reviewer._id)}>
              {reviewer.username}
            </option>
          ))}
          </select>
      </section>

      {error && (
        <p role="alert" className="mb-4 rounded bg-red-100 p-3 text-red-800">
          {error}
        </p>
      )}

      {editingReviewId && (
        <section className="mb-8 rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Edit review</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block font-semibold" htmlFor="rating">
                Rating
              </label>
              <select
                id="rating"
                value={form.rating}
                onChange={(event) =>
                  setForm((current) => ({ ...current, rating: event.target.value }))
                }
                className="w-full rounded border p-2"
                required
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} / 5
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
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                className="h-28 w-full rounded border p-2"
                placeholder="Write your review..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded bg-gray-200 px-4 py-2 font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <h2 className="text-xl font-bold mb-4">Reviews</h2>
      <label htmlFor="review-book-search" className="sr-only">
        Search reviewed books by title
      </label>
      <input
        id="review-book-search"
        type="search"
        value={reviewSearch}
        onChange={(event) => setReviewSearch(event.target.value)}
        placeholder="Search books you have reviewed..."
        className="mb-4 w-full rounded border bg-white p-3"
        disabled={reviews.length === 0}
      />
      {loading ? (
        <p className="text-gray-600">Loading reviews...</p>
      ) : filteredReviews.length === 0 ? (
        <p className="text-gray-600">
          {reviews.length === 0
            ? "No reviews for this reader yet."
            : "No reviewed books match your search."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredReviews.map((review) => {
            const reviewId = String(review._id);
            return (
              <article
                key={reviewId}
                className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm"
              >
                <div>
                  <h3 className="font-bold text-lg">
                    {review.bookId?.title ?? "Unknown book"}
                  </h3>
                  <p className="text-sm text-yellow-600">
                    Rating: {review.rating} / 5
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-gray-600">
                    {review.notes || "No notes."}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(review)}
                    className="rounded bg-gray-200 px-3 py-1 text-sm font-semibold hover:bg-gray-300"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReview(reviewId)}
                    disabled={deletingReviewId === reviewId}
                    className="rounded bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    {deletingReviewId === reviewId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
