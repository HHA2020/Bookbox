import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Bookbox.",
  description: "Letterbox for Books",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <nav className="p-4 bg-white shadow-sm flex justify-between items-center">
          <div className="font-bold text-xl">
            <Link href="/">Bookbox.</Link>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/" className="hover:underline">
              Browse
            </Link>
            <Link href="/dashboard" className="hover:underline">
              Manage
            </Link>
            {/* Mock User Selector for testing API relationships */}
            <select className="border rounded p-1 text-sm bg-gray-100">
              <option value="user1">User: Paing Hein</option>
              <option value="user2">User: Hein Htet</option>
            </select>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
