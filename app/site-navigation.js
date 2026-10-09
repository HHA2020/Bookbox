"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AUTHOR_NAME_STORAGE_KEY,
  IDENTITY_CHANGE_EVENT,
  READER_NAME_STORAGE_KEY,
} from "@/lib/reader-identity";

export default function SiteNavigation() {
  const pathname = usePathname();
  const isAuthorPage = pathname.startsWith("/author-");
  const isReaderPage =
    pathname === "/dashboard" ||
    pathname === "/reader-search" ||
    pathname.startsWith("/books/");
  const [identityName, setIdentityName] = useState("");

  useEffect(() => {
    const storageKey = isAuthorPage
      ? AUTHOR_NAME_STORAGE_KEY
      : isReaderPage
        ? READER_NAME_STORAGE_KEY
        : null;

    function updateIdentity() {
      setIdentityName(
        storageKey ? window.localStorage.getItem(storageKey) ?? "" : ""
      );
    }

    updateIdentity();
    window.addEventListener(IDENTITY_CHANGE_EVENT, updateIdentity);
    return () => window.removeEventListener(IDENTITY_CHANGE_EVENT, updateIdentity);
  }, [isAuthorPage, isReaderPage]);

  return (
    <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {isAuthorPage && (
          <>
            <Link href="/author-read" className="hover:underline">
              Books
            </Link>
            <Link href="/author-dashboard" className="hover:underline">
              Profile
            </Link>
          </>
        )}
        {isReaderPage && (
          <>
            <Link href="/reader-search" className="hover:underline">
              Book Search
            </Link>
            <Link href="/dashboard" className="hover:underline">
              Profile
            </Link>
          </>
        )}
      </div>
      {pathname !== "/" ? (
        <Link
          href="/"
          className="rounded border px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
        >
          &larr; Back
        </Link>
      ) : (
        <span />
      )}
      <div className="col-start-3 row-start-1 justify-self-end text-sm text-gray-600">
        {isAuthorPage && `Author: ${identityName || "select in Profile"}`}
        {isReaderPage && `Reader: ${identityName || "select in Profile"}`}
      </div>
    </nav>
  );
}
