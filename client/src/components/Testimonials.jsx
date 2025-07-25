import { useEffect, useState } from "react";
import api from "@/utils/api";

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/reviews?limit=4")
      .then(res => setReviews(res.data))
      .catch(() => setError("Failed to load testimonials"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading testimonials...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!reviews.length) return null;

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">Testimonials</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review, idx) => (
          <div key={idx} className="border rounded p-4 shadow bg-white">
            <p className="italic mb-2">"{review.comment}"</p>
            <div className="text-sm text-gray-600">- {review.user?.name || "Anonymous"} on {review.cake?.name || "Cake"}</div>
            <div className="text-yellow-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 