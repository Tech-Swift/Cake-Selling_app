import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast, Toaster } from "sonner";
import { useNavigate, Link } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [editing, setEditing] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [notifications, setNotifications] = useState({ email: true });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [roleSwitcher, setRoleSwitcher] = useState(false);
  const [roleRequest, setRoleRequest] = useState(null);
  const [requestingRole, setRequestingRole] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || ""
      });
      // Fetch counts and addresses
      api.get("/orders/my-orders").then(res => setOrdersCount(res.data.length));
      api.get("/wishlist").then(res => setWishlistCount(res.data?.items?.length || 0));
      api.get("/cart").then(res => setCartCount(res.data?.items?.length || 0));
      // Fetch role request status
      fetchRoleRequest();
    }
  }, [user]);

  const fetchRoleRequest = async () => {
    try {
      const response = await api.get("/users/me/role-request");
      setRoleRequest(response.data.roleRequest);
    } catch (error) {
      console.error("Error fetching role request:", error);
    }
  };

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || ""
    });
  };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleProfilePic = e => setProfilePic(e.target.files[0]);
  const handleSave = async () => {
    try {
      // Placeholder: send update to backend
      // await api.put("/profile", form);
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };
  const handlePasswordChange = async e => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      // Placeholder: send password change to backend
      // await api.post("/profile/change-password", passwords);
      toast.success("Password changed!");
      setShowPasswordForm(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      toast.error("Failed to change password");
    }
  };
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleDeleteAccount = async () => {
    setShowDeleteModal(true);
  };
  const confirmDeleteAccount = async () => {
    try {
      // Placeholder: send delete request to backend
      // await api.delete("/profile");
      toast.success("Account deleted");
      logout();
      navigate("/auth?mode=signup");
    } catch (err) {
      toast.error("Failed to delete account");
    }
    setShowDeleteModal(false);
    setDeleteInput("");
  };
  const handleNotificationChange = e => setNotifications(n => ({ ...n, [e.target.name]: e.target.checked }));

  const handleRoleChange = async (newRole) => {
    try {
      const response = await api.put("/users/me/role", { role: newRole });
      console.log("Role update response:", response.data);
      
      // Update the user in context and localStorage
      const updatedUser = { ...user, role: newRole };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success(`Role changed to ${newRole}! Please log out and log back in to see changes.`);
      
      // Force a page reload to update the context
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Role change error:", error);
      toast.error(error.response?.data?.message || "Failed to change role");
    }
  };

  const handleRoleRequest = async (requestedRole) => {
    setRequestingRole(true);
    try {
      const response = await api.post("/users/me/role-request", {
        requestedRole,
        reason: `User requesting ${requestedRole} role`
      });
      
      toast.success("Role request submitted successfully! An admin will review your request.");
      fetchRoleRequest(); // Refresh role request status
    } catch (error) {
      console.error("Role request error:", error);
      toast.error(error.response?.data?.message || "Failed to submit role request");
    } finally {
      setRequestingRole(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Toaster position="top-right" richColors />
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Account Deletion</h2>
            <p className="mb-2">This action cannot be undone. To confirm, type <span className="font-mono font-bold">DELETE</span> below:</p>
            <input
              type="text"
              className="border rounded p-2 w-full mb-4"
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder="Type DELETE to confirm"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-300 text-gray-800"
                onClick={() => { setShowDeleteModal(false); setDeleteInput(""); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50"
                disabled={deleteInput !== "DELETE"}
                onClick={confirmDeleteAccount}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="flex items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold mr-6 overflow-hidden">
          {profilePic ? (
            <img src={URL.createObjectURL(profilePic)} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            user?.name?.[0]?.toUpperCase() || "U"
          )}
        </div>
        <div>
          <input type="file" accept="image/*" onChange={handleProfilePic} className="mb-2" />
        </div>
      </div>
      <div className="mb-6">
        <label className="block font-semibold mb-1">Name</label>
        <input name="name" value={form.name} onChange={handleChange} disabled={!editing} className="border rounded p-2 w-full mb-2" />
        <label className="block font-semibold mb-1">Email</label>
        <input name="email" value={form.email} onChange={handleChange} disabled={!editing} className="border rounded p-2 w-full mb-2" />
        <label className="block font-semibold mb-1">Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} disabled={!editing} className="border rounded p-2 w-full mb-2" />
        <label className="block font-semibold mb-1">Address</label>
        <input name="address" value={form.address} onChange={handleChange} disabled={!editing} className="border rounded p-2 w-full mb-2" />
        {editing ? (
          <div className="flex space-x-2 mt-2">
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
            <button onClick={handleCancel} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        ) : (
          <button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">Edit</button>
        )}
      </div>
      <div className="mb-6">
        <button onClick={() => setShowPasswordForm(f => !f)} className="text-blue-600 underline mb-2">Change Password</button>
        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-2 mb-2">
            <input type="password" placeholder="Current Password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className="border rounded p-2 w-full" required />
            <input type="password" placeholder="New Password" value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} className="border rounded p-2 w-full" required />
            <input type="password" placeholder="Confirm New Password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="border rounded p-2 w-full" required />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Update Password</button>
          </form>
        )}
      </div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-100 p-4 rounded text-center">
          <div className="text-2xl font-bold">{ordersCount}</div>
          <div>Orders</div>
          <Link to="/orders" className="text-blue-600 underline text-sm">View Orders</Link>
        </div>
        <div className="bg-gray-100 p-4 rounded text-center">
          <div className="text-2xl font-bold">{wishlistCount}</div>
          <div>Wishlist</div>
          <Link to="/wishlist" className="text-blue-600 underline text-sm">View Wishlist</Link>
        </div>
        <div className="bg-gray-100 p-4 rounded text-center">
          <div className="text-2xl font-bold">{cartCount}</div>
          <div>Cart</div>
          <Link to="/cart" className="text-blue-600 underline text-sm">View Cart</Link>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Address Book <span className="text-xs text-gray-500">(coming soon)</span></h2>
        <ul className="list-disc ml-6 text-gray-700">
          {addresses.length === 0 ? <li>No saved addresses yet.</li> : addresses.map((addr, i) => <li key={i}>{addr}</li>)}
        </ul>
        {/* Add address form/logic here */}
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Notifications & Preferences <span className="text-xs text-gray-500">(coming soon)</span></h2>
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="email" checked={notifications.email} onChange={handleNotificationChange} />
          <span>Email notifications</span>
        </label>
      </div>
      
      {/* Role Request System */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-2 text-blue-800">Role Request System</h2>
        <p className="text-sm text-blue-700 mb-3">
          Current role: <span className="font-bold capitalize">{user?.role || 'unknown'}</span>
        </p>
        
        {/* Role Request Status */}
        {roleRequest && (
          <div className="mb-4 p-3 bg-white rounded border">
            <h3 className="font-semibold text-gray-900 mb-2">Role Request Status</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Requested Role:</span> {roleRequest.requestedRole}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  roleRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  roleRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {roleRequest.status}
                </span>
              </p>
              <p><span className="font-medium">Request Date:</span> {roleRequest.requestDate ? new Date(roleRequest.requestDate).toLocaleString() : ''}</p>
              {roleRequest.approvalDate && (
                <p><span className="font-medium">Approval Date:</span> {new Date(roleRequest.approvalDate).toLocaleString()}</p>
              )}
              {roleRequest.adminNotes && (
                <p><span className="font-medium">Admin Notes:</span> {roleRequest.adminNotes}</p>
              )}
            </div>
          </div>
        )}

        {/* Request New Role */}
        {(!roleRequest || roleRequest.status !== 'pending') && (
          <div className="space-y-3">
            <p className="text-sm text-blue-600">
              Request a role change. An admin will review your request.
            </p>
            <div className="flex flex-wrap gap-2">
              {user?.role !== 'seller' && (
                <button
                  onClick={() => handleRoleRequest('seller')}
                  disabled={requestingRole}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestingRole ? 'Requesting...' : 'Request Seller Role'}
                </button>
              )}
              {user?.role !== 'admin' && (
                <button
                  onClick={() => handleRoleRequest('admin')}
                  disabled={requestingRole}
                  className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requestingRole ? 'Requesting...' : 'Request Admin Role'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pending Request Message */}
        {roleRequest && roleRequest.status === 'pending' && (
          <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-800">
              ⏳ Your role request is pending admin approval. You'll be notified once it's reviewed.
            </p>
          </div>
        )}

        {/* Approved Request Message */}
        {roleRequest && roleRequest.status === 'approved' && (
          <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
            <p className="text-sm text-green-800">
              ✅ Your role request has been approved! Please log out and log back in to see your new role.
            </p>
          </div>
        )}

        {/* Rejected Request Message */}
        {roleRequest && roleRequest.status === 'rejected' && (
          <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
            <p className="text-sm text-red-800">
              ❌ Your role request was rejected. You can submit a new request if needed.
            </p>
          </div>
        )}
      </div>
      
      <div className="flex space-x-4 mt-8">
        <button onClick={handleLogout} className="bg-red-600 text-white px-6 py-2 rounded">Logout</button>
        <button onClick={handleDeleteAccount} className="bg-gray-400 text-white px-6 py-2 rounded">Delete Account</button>
      </div>
    </div>
  );
} 