import { useEffect, useState } from "react";
import { ShoppingBag, Pencil } from "lucide-react";
import * as ordersApi from "../../api/orders";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatCurrency, formatDateTime, orderTotal } from "../../utils/format";

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
  const toast = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ordersApi.listAllOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleEditStatus = (orderId, currentStatus) => {
    setEditStatusId(orderId);
    setNewStatus(currentStatus);
  };

  const handleSaveStatus = async (orderId) => {
    setStatusLoading(orderId);
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o
        )
      );
      setEditStatusId(null);
      toast.success(`Order #${orderId} updated to ${newStatus.replace("_", " ")}.`);
    } catch (err) {
      toast.error(err.message || "Status update failed");
    } finally {
      setStatusLoading(null);
    }
  };

  return (
    <div className="bg-gradient-to-b from-brand-600 to-brand-400 min-h-screen flex flex-col">
      <section className="relative flex flex-col justify-center items-center h-[28vh] text-white text-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[400px] h-[400px] bg-accent-300 opacity-20 rounded-full blur-3xl top-[-100px] left-[-150px] animate-pulse" />
          <div className="absolute w-[300px] h-[300px] bg-white opacity-10 rounded-full blur-2xl bottom-[-100px] right-[-100px] animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col items-center animate-fadeIn">
          <ShoppingBag className="w-14 h-14 mb-3 text-accent-300 drop-shadow-lg" />
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
            Admin Orders Management
          </h1>
          <p className="mt-2 text-lg md:text-xl max-w-2xl mx-auto font-light">
            View, update, and manage all customer orders.
          </p>
        </div>
      </section>

      <section className="flex-1 py-10 px-2 md:px-0">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-6 text-center shadow">{error}</div>
          )}
          {loading ? (
            <Spinner />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow">
                <thead>
                  <tr className="bg-brand-100 text-brand-900 text-left">
                    <th className="py-3 px-4 font-bold">Order #</th>
                    <th className="py-3 px-4 font-bold">Buyer</th>
                    <th className="py-3 px-4 font-bold">Placed At</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Delivery Address</th>
                    <th className="py-3 px-4 font-bold">Items</th>
                    <th className="py-3 px-4 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-b-0 hover:bg-brand-50 transition">
                      <td className="py-3 px-4 font-semibold text-brand-800">#{order.id}</td>
                      <td className="py-3 px-4">{order.buyer_name}</td>
                      <td className="py-3 px-4">{formatDateTime(order.placed_at)}</td>
                      <td className="py-3 px-4">
                        {editStatusId === order.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="border border-accent-300 rounded px-2 py-1 text-brand-900 focus:ring-2 focus:ring-accent-400"
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
                              className="bg-accent-400 hover:bg-accent-500 text-brand-900 px-3 py-1 rounded font-semibold transition disabled:opacity-60"
                            >
                              {statusLoading === order.id ? "Saving..." : "Save"}
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
                            <StatusBadge status={order.status} />
                            <button
                              type="button"
                              onClick={() => handleEditStatus(order.id, order.status)}
                              className="text-accent-500 hover:text-accent-700"
                              title="Edit Status"
                            >
                              <Pencil size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">{order.delivery_address}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-2">
                          {order.items?.map((item) => (
                            <div key={item.product_id} className="flex items-center gap-2 text-sm">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-8 h-8 rounded object-cover border"
                                />
                              ) : (
                                <div className="w-8 h-8 flex items-center justify-center bg-brand-50 rounded">
                                  <ShoppingBag className="text-accent-400" size={16} />
                                </div>
                              )}
                              <span className="font-medium">{item.name}</span>
                              <span className="text-gray-500">x{item.quantity}</span>
                              <span className="text-brand-700 font-semibold">
                                {formatCurrency(item.unit_price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-brand-900">{formatCurrency(orderTotal(order))}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminOrders;
