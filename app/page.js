import Link from "next/link";

export default function StartPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="mb-3 text-center text-3xl font-bold">Welcome to Bookbox</h1>
      <p className="mb-8 text-center text-gray-600">
        Choose where you would like to go.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/author-dashboard"
          className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="mb-2 text-xl font-bold">Author</h2>
          <p className="text-gray-600">Manage your books in the catalogue.</p>
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="mb-2 text-xl font-bold">Reader</h2>
          <p className="text-gray-600">Choose a reader and manage their reviews.</p>
        </Link>
      </div>
    </div>
  );
}
