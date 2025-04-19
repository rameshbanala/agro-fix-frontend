import React, { useEffect, useState } from "react";
import { ShoppingBag, XCircle, Loader } from "lucide-react";
import Cookies from "js-cookie";

// Helper to get auth token
const getToken = () => Cookies.get("token") || "";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [error, setError] = useState(null);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/orders", {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        setOrders(data); // Adjust if data is wrapped
      } catch {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelLoading(orderId);
    setError(null);
    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL + `/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            // No 'Content-Type' or body needed
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancel failed");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
      );
    } catch (err) {
      setError(err.message || "Cancel failed");
    } finally {
      setCancelLoading(null);
    }
  };

  return (
    <div className="bg-gradient-to-b from-green-600 to-green-400 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center h-[30vh] text-white text-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[400px] h-[400px] bg-yellow-300 opacity-20 rounded-full blur-3xl top-[-100px] left-[-150px] animate-pulse" />
          <div className="absolute w-[300px] h-[300px] bg-white opacity-10 rounded-full blur-2xl bottom-[-100px] right-[-100px] animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col items-center animate-fadeIn">
          <ShoppingBag className="w-16 h-16 mb-4 text-yellow-300 drop-shadow-lg" />
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
            My Orders
          </h1>
          <p className="mt-4 text-lg md:text-2xl max-w-2xl mx-auto font-light">
            Track your orders and manage your deliveries.
          </p>
        </div>
      </section>

      {/* Orders List */}
      <section className="flex-1 py-12 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-6 text-center shadow">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="animate-spin text-yellow-400" size={40} />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-green-800">
              <p className="text-xl font-semibold mb-2">No orders yet.</p>
              <p>When you place an order, it will appear here.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <span className="font-bold text-green-800 text-lg">
                        Order #{order.id}
                      </span>
                      <span className="ml-4 text-sm text-gray-500">
                        {new Date(order.placed_at).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {order.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Delivery Address:</span>{" "}
                    {order.delivery_address}
                  </div>
                  {/* Order Items */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-green-700 font-semibold border-b">
                          <th className="py-2 pr-4 text-left">Product</th>
                          <th className="py-2 px-2 text-center">Qty</th>
                          <th className="py-2 px-2 text-center">Unit Price</th>
                          <th className="py-2 px-2 text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr
                            key={item.product_id}
                            className="border-b last:border-b-0"
                          >
                            <td className="py-2 pr-4 flex items-center gap-2">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-10 h-10 rounded object-cover border"
                                />
                              ) : (
                                <div className="w-10 h-10 flex items-center justify-center bg-green-50 rounded">
                                  <ShoppingBag
                                    className="text-yellow-400"
                                    size={20}
                                  />
                                </div>
                              )}
                              <span className="font-medium">{item.name}</span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              {item.quantity}
                            </td>
                            <td className="py-2 px-2 text-center">
                              ₹{item.unit_price}
                            </td>
                            <td className="py-2 px-2 text-center font-semibold">
                              ₹{item.unit_price * item.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Order Actions */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-green-900 font-bold text-lg">
                      Total: ₹
                      {order.items.reduce(
                        (sum, item) => sum + item.unit_price * item.quantity,
                        0
                      )}
                    </div>
                    {["pending", "in_progress"].includes(order.status) && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelLoading === order.id}
                        className="flex items-center gap-2 px-6 py-2 bg-red-100 text-red-700 rounded-full font-semibold hover:bg-red-200 transition shadow"
                      >
                        {cancelLoading === order.id ? (
                          <>
                            <Loader size={18} className="animate-spin" />{" "}
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle size={18} /> Cancel Order
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-600 text-white py-6 text-center mt-8">
        <p className="text-sm md:text-base">
          © 2025 AgroFix. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default UserOrders;
