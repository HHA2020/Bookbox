"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

// There's no login yet, so the nav dropdown picks which reviewer you're
// acting as. The choice is remembered in localStorage.
const STORAGE_KEY = "bookbox:userId";
const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  const [reviewers, setReviewers] = useState([]);
  const [userId, setUserIdState] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/reviewers")
      .then((list) => {
        let saved = null;
        try {
          saved = localStorage.getItem(STORAGE_KEY);
        } catch {}
        setReviewers(list);
        setUserIdState(
          list.find((r) => r._id === saved)?._id ?? list[0]?._id ?? null
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setReady(true));
  }, []);

  function setUserId(id) {
    setUserIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  }

  const user = reviewers.find((r) => r._id === userId) ?? null;

  return (
    <CurrentUserContext.Provider
      value={{ reviewers, user, userId, setUserId, ready, error }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}

export function UserSelect() {
  const { reviewers, userId, setUserId, ready, error } = useCurrentUser();

  if (error) return <span className="text-sm text-red-600">{error}</span>;
  if (!ready) return <span className="text-sm text-gray-500">Loading…</span>;
  if (reviewers.length === 0) {
    return <span className="text-sm text-gray-500">No reviewers yet</span>;
  }

  return (
    <select
      aria-label="Current user"
      value={userId ?? ""}
      onChange={(e) => setUserId(e.target.value)}
      className="border rounded p-1 text-sm bg-gray-100"
    >
      {reviewers.map((r) => (
        <option key={r._id} value={r._id}>
          User: {r.username}
        </option>
      ))}
    </select>
  );
}
