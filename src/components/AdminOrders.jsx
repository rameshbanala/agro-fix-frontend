import React, { useEffect, useState } from "react";
import { ShoppingBag, Loader, Pencil } from "lucide-react";
import Cookies from "js-cookie";

// Helper to get auth token
const getToken = () => Cookies.get("token") || "";

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "delivered", label: "Delivered" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [editStatusId, setEditStatusId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(null);
  const [error, setError] = useState(null);

  // Fetch all orders (admin)
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          import.meta.env.VITE_BACKEND_URL + "/orders/admin/orders",
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        setOrders(data);
      } catch {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Handle status edit
  const handleEditStatus = (orderId, currentStatus) => {
    setEditStatusId(orderId);
    setNewStatus(currentStatus);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleSaveStatus = async (orderId) => {
    setStatusLoading(orderId);
    setError(null);
    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + `/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status update failed");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
            : o
        )
      );
      setEditStatusId(null);
    } catch (err) {
      setError(err.message || "Status update failed");
    } finally {
      setStatusLoading(null);
    }
  };

  return (
    <div className="bg-gradient-to-b from-green-600 to-green-400 min-h-screen flex flex-col">
      {/* Header */}
      <section className="relative flex flex-col justify-center items-center h-[28vh] text-white text-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[400px] h-[400px] bg-yellow-300 opacity-20 rounded-full blur-3xl top-[-100px] left-[-150px] animate-pulse" />
          <div className="absolute w-[300px] h-[300px] bg-white opacity-10 rounded-full blur-2xl bottom-[-100px] right-[-100px] animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col items-center animate-fadeIn">
          <ShoppingBag className="w-14 h-14 mb-3 text-yellow-300 drop-shadow-lg" />
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
            Admin Orders Management
          </h1>
          <p className="mt-2 text-lg md:text-xl max-w-2xl mx-auto font-light">
            View, update, and manage all customer orders.
          </p>
        </div>
      </section>

      {/* Orders Table */}
      <section className="flex-1 py-10 px-2 md:px-0">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-6 text-center shadow">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader className="animate-spin text-yellow-400" size={40} />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-green-800">
              <p className="text-xl font-semibold mb-2">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow">
                <thead>
                  <tr className="bg-green-100 text-green-900 text-left">
                    <th className="py-3 px-4 font-bold">Order #</th>
                    <th className="py-3 px-4 font-bold">Buyer</th>
                    <th className="py-3 px-4 font-bold">Placed At</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Delivery Address</th>
                    <th className="py-3 px-4 font-bold">Items</th>
                    <th className="py-3 px-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-b-0 hover:bg-green-50 transition"
                    >
                      <td className="py-3 px-4 font-semibold text-green-800">
                        #{order.id}
                      </td>
                      <td className="py-3 px-4">{order.buyer_name}</td>
                      <td className="py-3 px-4">
                        {new Date(order.placed_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {editStatusId === order.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={newStatus}
                              onChange={handleStatusChange}
                              className="border border-yellow-300 rounded px-2 py-1 text-green-900 focus:ring-2 focus:ring-yellow-400"
                            >
                              {ORDER_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleSaveStatus(order.id)}
                              disabled={statusLoading === order.id}
                              className="bg-yellow-400 hover:bg-yellow-500 text-green-900 px-3 py-1 rounded font-semibold transition"
                            >
                              {statusLoading === order.id ? (
                                <Loader
                                  size={18}
                                  className="animate-spin inline"
                                />
                              ) : (
                                "Save"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditStatusId(null)}
                              className="ml-1 text-gray-400 hover:text-red-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : order.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : order.status === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {order.status.replace("_", " ").toUpperCase()}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleEditStatus(order.id, order.status)
                              }
                              className="text-yellow-500 hover:text-yellow-700"
                              title="Edit Status"
                            >
                              <Pencil size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.delivery_address}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-2">
                          {order.items &&
                            order.items.map((item) => (
                              <div
                                key={item.product_id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-8 h-8 rounded object-cover border"
                                />
                                <span className="font-medium">{item.name}</span>
                                <span className="text-gray-500">
                                  x{item.quantity}
                                </span>
                                <span className="text-green-700 font-semibold">
                                  ₹{item.unit_price}
                                </span>
                              </div>
                            ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-green-900">
                          ₹
                          {order.items
                            ? order.items.reduce(
                                (sum, item) =>
                                  sum + item.unit_price * item.quantity,
                                0
                              )
                            : 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-600 text-white py-5 text-center mt-8">
        <p className="text-xs md:text-base">
          © 2025 AgroFix. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default AdminOrders;
