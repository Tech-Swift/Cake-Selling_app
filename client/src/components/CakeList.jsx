import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

export default function CakeList() {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Placeholder for search/filter state
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/cakes")
      .then(res => setCakes(res.data))
      .catch(err => setError("Failed to load cakes"))
      .finally(() => setLoading(false));
  }, []);

  // Filter cakes by search (simple name match)
  const filteredCakes = cakes.filter(cake =>
    cake.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading cakes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="my-8">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">All Cakes</h2>
        <input
          type="text"
          placeholder="Search cakes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredCakes.length === 0 ? (
          <div>No cakes found.</div>
        ) : (
          filteredCakes.map(cake => (
            <div key={cake._id} className="border rounded p-4 shadow flex flex-col items-center">
              {cake.image && (
                <img
                  src={cake.image.startsWith('http') ? cake.image : `https://cake-selling-app.onrender.com/${cake.image.replace(/^\//, '')}`}
                  alt={cake.name}
                  className="w-32 h-32 object-cover mb-2 rounded"
                />
              )}
              <h3 className="font-semibold text-lg mb-1">{cake.name}</h3>
              <p className="mb-1">{cake.description}</p>
              <p className="font-bold mb-2">${cake.price}</p>
              <Link to={`/cakes/${cake._id}`} className="text-blue-600 underline">View Details</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 