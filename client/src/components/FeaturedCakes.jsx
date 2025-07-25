import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

export default function FeaturedCakes() {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/cakes/featured")
      .then(res => setCakes(res.data.data || res.data))
      .catch(() => setError("Failed to load featured cakes"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading featured cakes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!cakes.length) return null;

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">Featured Cakes</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {cakes.map(cake => (
          <div key={cake._id} className="min-w-[220px] border rounded p-4 shadow flex flex-col items-center bg-white">
            {cake.image && (
              <img
                src={cake.image.startsWith('http') ? cake.image : `https://cake-selling-app.onrender.com/${cake.image.replace(/^\//, '')}`}
                alt={cake.name}
                className="w-32 h-32 object-cover mb-2 rounded"
              />
            )}
            <h3 className="font-semibold text-lg mb-1">{cake.name}</h3>
            <Link to={`/cakes/${cake._id}`} className="text-blue-600 underline">View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
} 