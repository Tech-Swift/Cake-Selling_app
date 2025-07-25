import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORIES = ["Birthday", "Wedding", "Custom", "Anniversary", "Cupcake", "Other"];

export default function CakesMy() {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "", category: CATEGORIES[0], image: null });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedCake, setSelectedCake] = useState(null);

  useEffect(() => {
    fetchCakes();
  }, []);

  const fetchCakes = () => {
    setLoading(true);
    api.get("/cakes/my-cakes")
      .then(res => setCakes(res.data))
      .catch(err => setError("Failed to load cakes"))
      .finally(() => setLoading(false));
  };

  const handleOpenModal = () => {
    setForm({ name: "", price: "", description: "", category: CATEGORIES[0], image: null });
    setImagePreview(null);
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setForm(f => ({ ...f, image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("category", form.category);
      if (form.image) formData.append("image", form.image);
      await api.post("/cakes", formData, { headers: { "Content-Type": "multipart/form-data" } });
      fetchCakes();
      setShowModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add cake");
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEditModal = (cake) => {
    setEditForm({
      ...cake,
      image: null, // for new upload
      isAvailable: cake.isAvailable ?? true,
      stock: cake.stock ?? 0,
    });
    setEditImagePreview(cake.image ? (cake.image.startsWith('http') ? cake.image : `https://cake-selling-app.onrender.com/${cake.image.replace(/^\//, '')}`) : null);
    setEditError(null);
    setEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditModal(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "image" && files && files[0]) {
      setEditForm(f => ({ ...f, image: files[0] }));
      setEditImagePreview(URL.createObjectURL(files[0]));
    } else if (name === "stock") {
      const stockValue = Number(value);
      setEditForm(f => ({
        ...f,
        stock: stockValue,
        isAvailable: stockValue > 0 // Automatically set isAvailable
      }));
    } else if (type === "checkbox") {
      setEditForm(f => ({ ...f, [name]: checked }));
    } else {
      setEditForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("price", editForm.price);
      formData.append("description", editForm.description);
      formData.append("category", editForm.category);
      formData.append("stock", editForm.stock);
      formData.append("isAvailable", editForm.isAvailable);
      if (editForm.image) formData.append("image", editForm.image);
      await api.put(`/cakes/${editForm._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      fetchCakes();
      setEditModal(false);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update cake");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCake = async (cakeId) => {
    setDeleteLoading(cakeId);
    setDeleteError(null);
    try {
      await api.delete(`/cakes/${cakeId}`);
      fetchCakes();
      setDeleteConfirm(null);
    } catch (err) {
      setDeleteError('Failed to delete cake');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Group cakes by category
  const cakesByCategory = cakes.reduce((acc, cake) => {
    const cat = cake.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cake);
    return acc;
  }, {});

  // Sort categories: those with cakes first, then empty
  const sortedCategories = [
    ...CATEGORIES.filter(cat => cakesByCategory[cat] && cakesByCategory[cat].length > 0),
    ...CATEGORIES.filter(cat => !cakesByCategory[cat] || cakesByCategory[cat].length === 0)
  ];

  return (
    <div className="py-8 w-full">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-2xl font-bold mb-2">My Cakes</h2>
        <Button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleOpenModal}>Add Cake</Button>
      </div>
      <div className="bg-white p-6 rounded shadow w-full">
        {loading ? (
          <p>Loading cakes...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : cakes.length === 0 ? (
          <p className="text-gray-600">You have not added any cakes yet.</p>
        ) : (
          <div className="space-y-8 w-full">
            {sortedCategories.map(category => (
              <div key={category} className="w-full">
                <h3 className="text-xl font-semibold mb-4">{category}</h3>
                {cakesByCategory[category] && cakesByCategory[category].length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5 w-full">
                    {cakesByCategory[category].map(cake => (
                      <Card
                        key={cake._id}
                        className="cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all p-0.5 gap-1 border rounded shadow flex flex-col items-center bg-white"
                        onClick={() => setSelectedCake(cake)}
                      >
                        <CardContent className="flex flex-col items-center p-0.5 w-full">
                          {cake.image && (
                            <img
                              src={cake.image.startsWith('http') ? cake.image : `https://cake-selling-app.onrender.com/${cake.image.replace(/^\//, '')}`}
                              alt={cake.name}
                              className="w-20 h-20 object-cover mb-1 rounded mx-auto"
                            />
                          )}
                          <div className="font-semibold text-center text-xs">{cake.name}</div>
                          <div className="text-gray-600 text-xs">${cake.price}</div>
                          <div className="text-xs text-gray-500">Stock: {cake.stock ?? 0} | {cake.isAvailable ? 'Available' : 'Out of Stock'}</div>
                          <div className="flex gap-1 mt-1">
                            <Button className="bg-yellow-500 text-white px-1 py-0.5 rounded text-xs" onClick={e => { e.stopPropagation(); handleOpenEditModal(cake); }}>Edit</Button>
                            <Button className="bg-red-500 text-white px-1 py-0.5 rounded text-xs" onClick={e => { e.stopPropagation(); setDeleteConfirm(cake._id); }} disabled={deleteLoading === cake._id}>Delete</Button>
                          </div>
                          {/* Delete confirmation dialog */}
                          {deleteConfirm === cake._id && (
                            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs flex flex-col items-center">
                                <p className="mb-4 text-center">Are you sure you want to delete <span className="font-bold">{cake.name}</span>?</p>
                                {deleteError && <p className="text-red-600 mb-2">{deleteError}</p>}
                                <div className="flex gap-4">
                                  <Button className="bg-red-600 text-white" onClick={() => handleDeleteCake(cake._id)} disabled={deleteLoading === cake._id}>
                                    {deleteLoading === cake._id ? 'Deleting...' : 'Delete'}
                                  </Button>
                                  <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 italic">No cakes in this category yet.</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Add Cake Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={handleCloseModal}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Add New Cake</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <Input name="name" value={form.name} onChange={handleFormChange} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Price</label>
                <Input name="price" type="number" value={form.price} onChange={handleFormChange} required min="0" step="0.01" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <Textarea name="description" value={form.description} onChange={handleFormChange} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Category</label>
                <select name="category" value={form.category} onChange={handleFormChange} className="w-full border rounded px-3 py-2">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Image</label>
                <Input name="image" type="file" accept="image/*" onChange={handleFormChange} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />}
              </div>
              {formError && <p className="text-red-600">{formError}</p>}
              <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full" disabled={formLoading}>
                {formLoading ? "Adding..." : "Add Cake"}
              </Button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Cake Modal */}
      {editModal && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={handleCloseEditModal}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Edit Cake</h3>
            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <Input name="name" value={editForm.name} onChange={handleEditFormChange} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Price</label>
                <Input name="price" type="number" value={editForm.price} onChange={handleEditFormChange} required min="0" step="0.01" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <Textarea name="description" value={editForm.description} onChange={handleEditFormChange} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Category</label>
                <select name="category" value={editForm.category} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Stock</label>
                <Input name="stock" type="number" value={editForm.stock} onChange={handleEditFormChange} min="0" />
              </div>
              <div className="flex items-center space-x-2">
                <input name="isAvailable" type="checkbox" checked={!!editForm.isAvailable} onChange={handleEditFormChange} id="isAvailable" />
                <label htmlFor="isAvailable" className="font-medium">Available</label>
              </div>
              <div>
                <label className="block mb-1 font-medium">Image</label>
                <Input name="image" type="file" accept="image/*" onChange={handleEditFormChange} />
                {editImagePreview && <img src={editImagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />}
              </div>
              {editError && <p className="text-red-600">{editError}</p>}
              <Button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded w-full" disabled={editLoading}>
                {editLoading ? "Updating..." : "Update Cake"}
              </Button>
            </form>
          </div>
        </div>
      )}
      {/* Cake Details Modal */}
      {selectedCake && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative flex flex-col items-center">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={() => setSelectedCake(null)}>&times;</button>
            {selectedCake.image && (
              <img
                src={selectedCake.image.startsWith('http') ? selectedCake.image : `https://cake-selling-app.onrender.com/${selectedCake.image.replace(/^\//, '')}`}
                alt={selectedCake.name}
                className="w-48 h-48 object-cover rounded mb-4"
              />
            )}
            <h3 className="text-2xl font-bold mb-2">{selectedCake.name}</h3>
            <div className="text-lg text-gray-700 mb-2">${selectedCake.price}</div>
            <div className="text-gray-600 mb-2">Stock: {selectedCake.stock ?? 0} | {selectedCake.isAvailable ? 'Available' : 'Out of Stock'}</div>
            <div className="text-gray-500 mb-2">Category: {selectedCake.category}</div>
            <div className="text-gray-700 mb-2">{selectedCake.description}</div>
            {selectedCake.flavor && <div className="text-gray-500 mb-2">Flavor: {selectedCake.flavor}</div>}
          </div>
        </div>
      )}
    </div>
  );
} 