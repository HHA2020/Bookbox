"use client";

import { useState } from "react";
import Link from "next/link";

export default function CatalogueSearch({ books, showReviewLink = true }) {
  const [search, setSearch] = useState("");
  const [expandedBookId, setExpandedBookId] = useState(null);
  const [reviewsByBook, setReviewsByBook] = useState({});
  const query = search.trim().toLocaleLowerCase();
  const filteredBooks = query
    ? books.filter((book) => book.title.toLocaleLowerCase().includes(query))
    : books;

  async function toggleReviews(bookId) {
    if (expandedBookId === bookId) {
      setExpandedBookId(null);
      return;
    }

    setExpandedBookId(bookId);
    if (reviewsByBook[bookId]?.status === "loaded" || reviewsByBook[bookId]?.status === "loading") {
      return;
    }

    setReviewsByBook((current) => ({
      ...current,
      [bookId]: { status: "loading", reviews: [] },
    }));

    try {
      const response = await fetch(`/api/reviews?bookId=${encodeURIComponent(bookId)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message ?? `Request failed (${response.status})`);
      }
      setReviewsByBook((current) => ({
        ...current,
        [bookId]: { status: "loaded", reviews: data },
      }));
    } catch (error) {
      setReviewsByBook((current) => ({
        ...current,
        [bookId]: { status: "error", message: error.message, reviews: [] },
      }));
    }
  }

  return (
    <>
      <label htmlFor="book-search" className="sr-only">
        Search books by title
      </label>
      <input
        id="book-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search books by title..."
        className="mb-6 w-full rounded border bg-white p-3"
      />

      {filteredBooks.length === 0 ? (
        <p className="text-gray-600">
          {books.length === 0
            ? "No books yet. Run npm run seed to add sample data."
            : "No books match your search."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="rounded-lg border bg-white p-4 shadow transition hover:shadow-md"
            >
              <h2 className="text-xl font-bold">
                <button
                  type="button"
                  onClick={() => toggleReviews(book.id)}
                  aria-expanded={expandedBookId === book.id}
                  aria-controls={`reviews-${book.id}`}
                  className="text-left hover:text-blue-700 hover:underline"
                >
                  {book.title}
                </button>
              </h2>
              <p className="text-gray-600">by {book.authorName}</p>
              {book.genre && (
                <span className="mt-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  {book.genre}
                </span>
              )}
              {showReviewLink && (
                <div className="mt-4">
                  <Link
                    href={`/books/${book.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Rate &amp; Review &rarr;
                  </Link>
                </div>
              )}
              {expandedBookId === book.id && (
                <section
                  id={`reviews-${book.id}`}
                  className="mt-4 border-t pt-3"
                  aria-label={`Reviews for ${book.title}`}
                >
                  <h3 className="mb-2 font-semibold">Reviews</h3>
                  {reviewsByBook[book.id]?.status === "loading" ? (
                    <p className="text-sm text-gray-600">Loading reviews...</p>
                  ) : reviewsByBook[book.id]?.status === "error" ? (
                    <div>
                      <p role="alert" className="text-sm text-red-700">
                        {reviewsByBook[book.id].message}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setReviewsByBook((current) => ({
                            ...current,
                            [book.id]: undefined,
                          }));
                          toggleReviews(book.id);
                        }}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : reviewsByBook[book.id]?.reviews.length ? (
                    <ul className="flex flex-col gap-2">
                      {reviewsByBook[book.id].reviews.map((review) => (
                        <li
                          key={review._id}
                          className="rounded bg-gray-50 p-2 text-sm"
                        >
                          <span className="font-semibold">{review.rating} / 5</span>
                          {" - "}
                          {review.notes || "No written review"}
                          {" - by "}
                          {review.userId?.username ?? "Unknown reader"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600">No reviews yet.</p>
                  )}
                </section>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
