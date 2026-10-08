const OPTIONS = [
  [5, "Masterpiece"],
  [4, "Great"],
  [3, "Good"],
  [2, "Fair"],
  [1, "Poor"],
];

export function stars(rating) {
  return "⭐".repeat(rating);
}

export default function RatingSelect({ value, onChange, id }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border p-2 rounded w-full"
      required
    >
      <option value="" disabled>
        Select a rating...
      </option>
      {OPTIONS.map(([n, label]) => (
        <option key={n} value={n}>
          {stars(n)} - {label}
        </option>
      ))}
    </select>
  );
}
