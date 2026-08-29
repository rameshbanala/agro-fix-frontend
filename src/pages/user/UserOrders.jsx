import { useEffect, useState } from "react";
import { ShoppingBag, XCircle } from "lucide-react";
import * as ordersApi from "../../api/orders";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { formatCurrency, formatDateTime, orderTotal } from "../../utils/format";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ordersApi.listMyOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async () => {
    const orderId = cancelTarget;
    setCancelLoading(orderId);
    setError(null);
    try {
      await ordersApi.cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
      toast.success("Order cancelled successfully.");
    } catch (err) {
      toast.error(err.message || "Cancel failed");
    } finally {
      setCancelLoading(null);
      setCancelTarget(null);
    }
  };

  return (
    <div className="bg-gradient-to-b from-brand-600 to-brand-400 min-h-screen flex flex-col">
      <section className="relative flex flex-col justify-center items-center h-[30vh] text-white text-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[400px] h-[400px] bg-accent-300 opacity-20 rounded-full blur-3xl top-[-100px] left-[-150px] animate-pulse" />
          <div className="absolute w-[300px] h-[300px] bg-white opacity-10 rounded-full blur-2xl bottom-[-100px] right-[-100px] animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col items-center animate-fadeIn">
          <ShoppingBag className="w-16 h-16 mb-4 text-accent-300 drop-shadow-lg" />
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">My Orders</h1>
          <p className="mt-4 text-lg md:text-2xl max-w-2xl mx-auto font-light">
            Track your orders and manage your deliveries.
          </p>
        </div>
      </section>

      <section className="flex-1 py-12 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-6 text-center shadow">{error}</div>
          )}
          {loading ? (
            <Spinner />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet." description="When you place an order, it will appear here." />
          ) : (
            <div className="space-y-8">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <span className="font-bold text-brand-800 text-lg">Order #{order.id}</span>
                      <span className="ml-4 text-sm text-gray-500">{formatDateTime(order.placed_at)}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Delivery Address:</span> {order.delivery_address}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-brand-700 font-semibold border-b">
                          <th className="py-2 pr-4 text-left">Product</th>
                          <th className="py-2 px-2 text-center">Qty</th>
                          <th className="py-2 px-2 text-center">Unit Price</th>
                          <th className="py-2 px-2 text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.product_id} className="border-b last:border-b-0">
                            <td className="py-2 pr-4 flex items-center gap-2">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-10 h-10 rounded object-cover border"
                                />
                              ) : (
                                <div className="w-10 h-10 flex items-center justify-center bg-brand-50 rounded">
                                  <ShoppingBag className="text-accent-400" size={20} />
                                </div>
                              )}
                              <span className="font-medium">{item.name}</span>
                            </td>
                            <td className="py-2 px-2 text-center">{item.quantity}</td>
                            <td className="py-2 px-2 text-center">{formatCurrency(item.unit_price)}</td>
                            <td className="py-2 px-2 text-center font-semibold">
                              {formatCurrency(item.unit_price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-brand-900 font-bold text-lg">
                      Total: {formatCurrency(orderTotal(order))}
                    </div>
                    {["pending", "in_progress"].includes(order.status) && (
                      <Button
                        variant="dangerLight"
                        onClick={() => setCancelTarget(order.id)}
                        disabled={cancelLoading === order.id}
                      >
                        <XCircle size={18} /> Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel this order?"
        message="This will restore the reserved stock and mark the order as cancelled. This cannot be undone."
        confirmLabel="Cancel Order"
        danger
        loading={cancelLoading !== null}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};

export default UserOrders;
