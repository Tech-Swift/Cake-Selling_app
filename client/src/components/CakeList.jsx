import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

const categories = ["All", "Birthday", "Wedding", "Custom", "Anniversary", "Cupcake", "Other"];

export default function CakeList() {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    api.get("/cakes")
      .then(res => setCakes(res.data))
      .catch(err => setError("Failed to load cakes"))
      .finally(() => setLoading(false));
  }, []);

  // Filter cakes by search and category
  const filteredCakes = cakes.filter(cake => {
    const matchesSearch = cake.name.toLowerCase().includes(search.toLowerCase()) ||
                         cake.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || cake.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="my-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Browse Cakes</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(cat => (
            <div key={cat} className="h-8 bg-gray-200 rounded-full px-4 animate-pulse"></div>
          ))}
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-gray-200 rounded-lg p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-300 rounded mb-3"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Browse Cakes</h2>
      <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
    </div>
  );

  return (
    <div className="my-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Browse Cakes</h2>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search cakes by name or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600">
        {filteredCakes.length} cake{filteredCakes.length !== 1 ? 's' : ''} found
      </div>

      {/* Cakes Grid */}
      {filteredCakes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🍰</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No cakes found</h3>
          <p className="text-gray-500">
            {search || selectedCategory !== "All" 
              ? "Try adjusting your search or category filter"
              : "No cakes available at the moment. Check back soon!"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCakes.map(cake => (
            <div key={cake._id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="relative">
                {cake.image ? (
                  <img
                    src={cake.image.startsWith('http') ? cake.image : `https://cake-selling-app.onrender.com${cake.image}`}
                    alt={cake.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Cake+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  {cake.category}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{cake.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{cake.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-green-600">${cake.price}</span>
                  <span className="text-sm text-gray-500">Stock: {cake.stock}</span>
                </div>
                <Link 
                  to={`/cakes/${cake._id}`} 
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center block font-semibold"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 