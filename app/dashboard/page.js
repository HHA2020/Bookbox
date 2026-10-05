"use client";

export default function DashboardPage() {
  // Mock data for UI layout
  const userReviews = [
    {
      _id: "101",
      bookTitle: "Dune",
      rating: 5,
      notes: "Incredible world-building.",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Reading Diary</h1>

      <div className="flex flex-col gap-4">
        {userReviews.map((review) => (
          <div
            key={review._id}
            className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center"
          >
            <div>
              <h2 className="font-bold text-lg">{review.bookTitle}</h2>
              <p className="text-sm text-yellow-500">
                Rating: {review.rating} / 5
              </p>
              <p className="text-gray-600 mt-1">"{review.notes}"</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-semibold">
                Edit
              </button>
              <button className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-semibold">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
