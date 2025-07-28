import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function CakeGrid({ cakes, onAddToCart, onAddToWishlist }) {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // Helper to get seller name
  const getSellerName = (cake) => cake.createdBy?.name || 'Unknown Seller';

  // Enhanced add to cart handler
  const handleAddToCart = async (cake) => {
    try {
      const result = await addToCart(cake._id);
      if (result.success) {
        toast.success(`Added ${cake.name} to cart!`);
      } else {
        toast.error(result.error || 'Failed to add to cart');
      }
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  // Enhanced add to wishlist handler
  const handleAddToWishlist = async (cake) => {
    try {
      const result = await addToWishlist(cake._id);
      if (result.success) {
        toast.success(`Added ${cake.name} to wishlist!`);
      } else {
        toast.error(result.error || 'Failed to add to wishlist');
      }
    } catch (err) {
      toast.error('Failed to add to wishlist');
    }
  };

  if (!cakes || cakes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4">🍰</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No cakes found</h3>
        <p className="text-gray-500">Check back soon for delicious cakes!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cakes.map(cake => (
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
            {/* Wishlist indicator */}
            {isInWishlist(cake._id) && (
              <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                ❤️
              </div>
            )}
            {/* Availability badge */}
            {cake.isAvailable && (cake.stock === undefined || cake.stock > 0) ? (
              <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Available
              </div>
            ) : (
              <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Out of Stock
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 text-gray-800">{cake.name}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{cake.description}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-2xl font-bold text-green-600">${cake.price}</span>
              <span className="text-sm text-gray-500">Stock: {cake.stock || 'N/A'}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Seller: {getSellerName(cake)}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddToCart(cake)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!cake.isAvailable || cake.stock === 0}
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleAddToWishlist(cake)}
                className={`flex-1 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-semibold ${
                  isInWishlist(cake._id)
                    ? 'bg-pink-600 text-white hover:bg-pink-700'
                    : 'bg-pink-500 text-white hover:bg-pink-600'
                }`}
              >
                {isInWishlist(cake._id) ? '❤️ Saved' : 'Wishlist'}
              </button>
              <Link
                to={`/cakes/${cake._id}`}
                className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-semibold text-center"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 