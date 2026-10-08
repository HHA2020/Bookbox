"use client";

import { useEffect, useState } from "react";
import {
  AUTHOR_ID_STORAGE_KEY,
  AUTHOR_NAME_STORAGE_KEY,
  IDENTITY_CHANGE_EVENT,
} from "@/lib/reader-identity";

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Request failed (${response.status})`);
  }

  return data;
}

export default function AuthorDashboardPage() {
  const [authors, setAuthors] = useState([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const [books, setBooks] = useState([]);
  const [bookSearch, setBookSearch] = useState("");
  const [form, setForm] = useState({ title: "", genre: "", publishedYear: "" });
  const [editingBookId, setEditingBookId] = useState(null);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAuthors() {
      try {
        const data = await requestJson("/api/authors");
        if (!active) return;
        setAuthors(data);
        const storedAuthorId = window.localStorage.getItem(AUTHOR_ID_STORAGE_KEY);
        const selectedAuthor =
          data.find((author) => String(author._id) === storedAuthorId) ?? data[0];
        const authorId = String(selectedAuthor?._id ?? "");
        setSelectedAuthorId(authorId);
        if (selectedAuthor) {
          window.localStorage.setItem(AUTHOR_ID_STORAGE_KEY, authorId);
          window.localStorage.setItem(AUTHOR_NAME_STORAGE_KEY, selectedAuthor.name);
          window.dispatchEvent(new Event(IDENTITY_CHANGE_EVENT));
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoadingAuthors(false);
      }
    }

    loadAuthors();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadBooks() {
      if (!selectedAuthorId) {
        setBooks([]);
        setLoadingBooks(false);
        return;
      }

      setLoadingBooks(true);
      setError("");
      try {
        const data = await requestJson(
          `/api/books?authorId=${encodeURIComponent(selectedAuthorId)}`
        );
        if (active) setBooks(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoadingBooks(false);
      }
    }

    loadBooks();
    return () => {
      active = false;
    };
  }, [selectedAuthorId]);

  const selectedAuthor = authors.find(
    (author) => String(author._id) === selectedAuthorId
  );
  const searchQuery = bookSearch.trim().toLocaleLowerCase();
  const filteredBooks = searchQuery
    ? books.filter((book) => book.title.toLocaleLowerCase().includes(searchQuery))
    : books;

  function resetForm() {
    setForm({ title: "", genre: "", publishedYear: "" });
    setEditingBookId(null);
  }

  async function refreshBooks() {
    const data = await requestJson(
      `/api/books?authorId=${encodeURIComponent(selectedAuthorId)}`
    );
    setBooks(data);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const isEditing = Boolean(editingBookId);
      const url = isEditing ? `/api/books/${editingBookId}` : "/api/books";
      const body = {
        title: form.title,
        genre: form.genre,
        ...(form.publishedYear && { publishedYear: Number(form.publishedYear) }),
        ...(!isEditing && { authorId: selectedAuthorId }),
      };

      await requestJson(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      resetForm();
      await refreshBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(book) {
    setEditingBookId(String(book._id));
    setForm({
      title: book.title,
      genre: book.genre ?? "",
      publishedYear: book.publishedYear ? String(book.publishedYear) : "",
    });
    setError("");
  }

  async function deleteBook(book) {
    const confirmed = window.confirm(
      `Delete "${book.title}"? This also deletes its reviews. This cannot be undone.`
    );
    if (!confirmed) return;

    const bookId = String(book._id);
    setDeletingBookId(bookId);
    setError("");
    try {
      await requestJson(`/api/books/${bookId}`, { method: "DELETE" });
      setBooks((current) =>
        current.filter((item) => String(item._id) !== bookId)
      );
      if (editingBookId === bookId) resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingBookId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Author Studio</h1>
      <p className="mb-6 text-gray-600">
        Manage books linked to an author in the catalogue.
      </p>

      <section className="mb-8 rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Choose an author</h2>
        {loadingAuthors ? (
          <p className="text-gray-600">Loading authors...</p>
        ) : authors.length === 0 ? (
          <p className="text-gray-600">No authors found in the database.</p>
        ) : (
          <>
            <label className="mb-1 block font-semibold" htmlFor="author">
              Author
            </label>
            <select
              id="author"
              value={selectedAuthorId}
              onChange={(event) => {
                const authorId = event.target.value;
                const author = authors.find(
                  (item) => String(item._id) === authorId
                );
                setSelectedAuthorId(authorId);
                if (author) {
                  window.localStorage.setItem(AUTHOR_ID_STORAGE_KEY, authorId);
                  window.localStorage.setItem(AUTHOR_NAME_STORAGE_KEY, author.name);
                  window.dispatchEvent(new Event(IDENTITY_CHANGE_EVENT));
                }
                setBookSearch("");
                resetForm();
              }}
              className="w-full rounded border p-2"
            >
              {authors.map((author) => (
                <option key={author._id} value={String(author._id)}>
                  {author.name}
                </option>
              ))}
            </select>
          </>
        )}
      </section>

      {error && (
        <p role="alert" className="mb-4 rounded bg-red-100 p-3 text-red-800">
          {error}
        </p>
      )}

      {selectedAuthorId && (
        <>
          <section className="mb-8 rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-bold">
              {editingBookId ? "Edit book" : "Add a book"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block font-semibold" htmlFor="title">
                  Book title
                </label>
                <input
                  id="title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  className="w-full rounded border p-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold" htmlFor="genre">
                  Genre
                </label>
                <input
                  id="genre"
                  value={form.genre}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, genre: event.target.value }))
                  }
                  className="w-full rounded border p-2"
                  placeholder="e.g. Fantasy"
                />
              </div>
              <div>
                <label
                  className="mb-1 block font-semibold"
                  htmlFor="publishedYear"
                >
                  Published year (optional)
                </label>
                <input
                  id="publishedYear"
                  type="number"
                  min="0"
                  max={new Date().getFullYear()}
                  value={form.publishedYear}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      publishedYear: event.target.value,
                    }))
                  }
                  className="w-full rounded border p-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingBookId ? "Save changes" : "Add book"}
                </button>
                {editingBookId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded bg-gray-200 px-4 py-2 font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold">{selectedAuthor?.name}&apos;s books</h2>
            <label htmlFor="author-book-search" className="sr-only">
              Search books by title
            </label>
            <input
              id="author-book-search"
              type="search"
              value={bookSearch}
              onChange={(event) => setBookSearch(event.target.value)}
              placeholder="Search your books by title..."
              className="mb-4 w-full rounded border bg-white p-3"
            />
            {loadingBooks ? (
              <p className="text-gray-600">Loading books...</p>
            ) : filteredBooks.length === 0 ? (
              <p className="text-gray-600">
                {books.length === 0
                  ? "No books for this author yet."
                  : "No books match your search."}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredBooks.map((book) => {
                  const bookId = String(book._id);
                  return (
                    <article
                      key={bookId}
                      className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm"
                    >
                      <div>
                        <h3 className="text-lg font-bold">{book.title}</h3>
                        <p className="text-gray-600">
                          {book.genre || "Genre not specified"}
                          {book.publishedYear ? ` · ${book.publishedYear}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(book)}
                          className="rounded bg-gray-200 px-3 py-1 text-sm font-semibold hover:bg-gray-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBook(book)}
                          disabled={deletingBookId === bookId}
                          className="rounded bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          {deletingBookId === bookId ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
