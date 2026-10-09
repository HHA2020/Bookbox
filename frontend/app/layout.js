import "./globals.css";
import SiteNavigation from "./site-navigation";

export const metadata = {
  title: "Bookbox",
  description: "Letterbox for Books",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <SiteNavigation />
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
