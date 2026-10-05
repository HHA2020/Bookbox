export default async function BrowsePage() {
  // const res = await fetch('http://localhost:3000/api/books')
  // const books = await res.json()

  // Temporary mock data for UI testing
  const books = [
    {
      _id: "1",
      title: "Dune",
      genre: "Sci-Fi",
      author: { name: "Frank Herbert" },
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explore Catalogue</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={book._id}
            className="p-4 border rounded-lg bg-white shadow hover:shadow-md transition"
          >
            <h2 className="font-bold text-xl">{book.title}</h2>
            <p className="text-gray-600">by {book.author.name}</p>
            <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {book.genre}
            </span>
            <div className="mt-4">
              <a
                href={`/books/${book._id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Rate & Review &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
