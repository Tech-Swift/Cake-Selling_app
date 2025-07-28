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

  if (loading) return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured Cakes</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="min-w-[280px] bg-gray-200 rounded-lg p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-300 rounded mb-3"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured Cakes</h2>
      <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
    </div>
  );

  if (!cakes.length) return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured Cakes</h2>
      <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-lg">No featured cakes available at the moment.</p>
        <p className="text-sm mt-2">Check back soon for new additions!</p>
      </div>
    </div>
  );

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured Cakes</h2>
      <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
        {cakes.map(cake => (
          <div key={cake._id} className="min-w-[280px] bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="relative">
              {cake.image ? (
                <img
                  src={cake.image.startsWith('http') ? cake.image : `https://cake-selling-app.onrender.com${cake.image}`}
                  alt={cake.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/280x192?text=Cake+Image';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No Image</span>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                Featured
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 text-gray-800">{cake.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{cake.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">${cake.price}</span>
                <Link 
                  to={`/cakes/${cake._id}`} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 