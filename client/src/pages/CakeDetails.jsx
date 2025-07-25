import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/utils/api";

export default function CakeDetails() {
  const { id } = useParams();
  const [cake, setCake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/cakes/${id}`)
      .then(res => setCake(res.data))
      .catch(() => setError("Cake not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading cake details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!cake) return null;

  return (
    <div className="max-w-xl mx-auto p-4">
      <Link to="/" className="text-blue-600 underline mb-4 inline-block">&larr; Back to Home</Link>
      {cake.image && (
        <img
          src={cake.image.startsWith('http') ? cake.image : `http://localhost:5000/${cake.image.replace(/^\//, '')}`}
          alt={cake.name}
          className="w-full h-64 object-cover rounded mb-4"
        />
      )}
      <h1 className="text-2xl font-bold mb-2">{cake.name}</h1>
      <p className="mb-2">{cake.description}</p>
      <p className="font-bold mb-2">${cake.price}</p>
      <p className="mb-2">Category: {cake.category}</p>
      <p className="mb-2">Flavor: {cake.flavor}</p>
      <p className="mb-2">Seller: {cake.createdBy?.name || 'Unknown Seller'}</p>
      {/* Add more cake details as needed */}
    </div>
  );
} 