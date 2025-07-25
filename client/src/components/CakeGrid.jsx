import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function CakeGrid({ cakes, onAddToCart, onAddToWishlist }) {
  // Helper to get seller name
  const getSellerName = (cake) => cake.createdBy?.name || 'Unknown Seller';

  // Enhanced add to cart handler
  const handleAddToCart = async (cake) => {
    try {
      // Fetch current cart
      const res = await import('@/utils/api').then(m => m.default.get('/cart'));
      const items = res.data?.items || [];
      if (items.length > 0) {
        const existingSeller = items[0].cake.createdBy?._id || items[0].cake.createdBy;
        const newSeller = cake.createdBy?._id || cake.createdBy;
        if (existingSeller !== newSeller) {
          toast.error('You can only add cakes from one seller per order.');
          return;
        }
      }
      // If here, either cart is empty or sellers match, proceed to add
      await import('@/utils/api').then(m => m.default.post('/cart/add', { cakeId: cake._id }));
      toast.success(`Added ${cake.name} to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  if (!cakes || cakes.length === 0) return <div>No cakes found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cakes.map(cake => (
        <div key={cake._id} className="border rounded p-4 shadow flex flex-col items-center bg-white">
          {cake.image && (
            <img
              src={cake.image.startsWith('http') ? cake.image : `http://localhost:5000/${cake.image.replace(/^\//, '')}`}
              alt={cake.name}
              className="w-32 h-32 object-cover mb-2 rounded"
            />
          )}
          <h3 className="font-semibold text-lg mb-1">{cake.name}</h3>
          <p className="mb-1">{cake.description}</p>
          <p className="mb-1 text-sm text-gray-600">Category: {cake.category}</p>
          <p className="mb-1 text-sm text-gray-600">Seller: {getSellerName(cake)}</p>
          <p className="font-bold mb-2">${cake.price}</p>
          {/* Availability badge */}
          {cake.isAvailable && (cake.stock === undefined || cake.stock > 0) ? (
            <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mb-2">Available</span>
          ) : (
            <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mb-2">Out of Stock</span>
          )}
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => handleAddToCart(cake)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              disabled={!cake.isAvailable || cake.stock === 0}
            >
              Add to Cart
            </button>
            <button
              onClick={() => onAddToWishlist && onAddToWishlist(cake)}
              className="bg-pink-500 text-white px-3 py-1 rounded text-sm"
            >
              Wishlist
            </button>
            <Link
              to={`/cakes/${cake._id}`}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
} 