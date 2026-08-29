import { useEffect, useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import * as productsApi from "../../api/products";
import * as ordersApi from "../../api/orders";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { formatCurrency } from "../../utils/format";

const UserProducts = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [address, setAddress] = useState("");
  const [loadError, setLoadError] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [placing, setPlacing] = useState(false);
  const { cart, setQuantity, clearCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadError("");
      try {
        const data = await productsApi.listProducts();
        setProducts(data);
      } catch (err) {
        setLoadError(err.message || "Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([productId, quantity]) => ({
          product: productsById.get(Number(productId)),
          productId: Number(productId),
          quantity,
        }))
        .filter((item) => item.product && item.quantity > 0),
    [cart, productsById]
  );

  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.unit_price * item.quantity, 0);

  const handleReview = (e) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Please provide a delivery address.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Select at least one product to order.");
      return;
    }
    setReviewing(true);
  };

  const handleConfirmOrder = async () => {
    setPlacing(true);
    try {
      const data = await ordersApi.placeOrder({
        delivery_address: address,
        items: cartItems.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
      });
      toast.success(`Order placed! Order ID: ${data.order_id}`);
      clearCart();
      setAddress("");
      setReviewing(false);
      const refreshed = await productsApi.listProducts();
      setProducts(refreshed);
    } catch (err) {
      toast.error(err.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-brand-600 to-brand-400 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center h-[50vh] text-white text-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[320px] h-[320px] bg-accent-300 opacity-20 rounded-full blur-3xl top-[-60px] left-[-100px] animate-pulse" />
          <div className="absolute w-[200px] h-[200px] bg-white opacity-10 rounded-full blur-2xl bottom-[-60px] right-[-60px] animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col items-center animate-fadeIn">
          <ShoppingBag className="w-14 h-14 mb-4 text-accent-300 drop-shadow-lg" />
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
            Products Catalogue
          </h1>
          <p className="mt-4 text-lg md:text-2xl max-w-xl mx-auto font-light">
            Browse and order fresh produce in bulk.
          </p>
        </div>
      </section>

      {/* Product Grid & Order Form */}
      <section className="flex-1 py-10 px-2 md:px-0">
        <div className="max-w-6xl mx-auto">
          {loadError && (
            <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-6 text-center shadow">{loadError}</div>
          )}

          {loadingProducts ? (
            <Spinner />
          ) : (
            <form onSubmit={handleReview} className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-5 flex flex-col items-center border border-brand-100"
                  >
                    <div className="w-28 h-28 mb-3 bg-brand-50 rounded-lg overflow-hidden flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-accent-400">
                          <ShoppingBag size={40} />
                        </div>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-brand-800 mb-1 text-center">
                      {product.name}
                    </h2>
                    <div className="text-brand-700 font-medium text-base mb-1">
                      {formatCurrency(product.unit_price)}{" "}
                      <span className="text-xs font-light">per unit</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">In stock: {product.stock_quantity}</div>
                    <p className="text-gray-600 text-xs mb-3 text-center min-h-[32px]">
                      {product.description?.slice(0, 50) || "No description."}
                      {product.description && product.description.length > 50 ? "..." : ""}
                    </p>
                    <input
                      type="number"
                      min={0}
                      max={product.stock_quantity}
                      value={cart[product.id] || ""}
                      onChange={(e) => setQuantity(product.id, Math.min(Number(e.target.value), product.stock_quantity))}
                      placeholder="Qty"
                      className="w-20 px-2 py-1 border border-accent-300 rounded-full mb-2 text-center focus:outline-none focus:ring-2 focus:ring-accent-400 transition"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 mt-8">
                <div className="relative w-full md:w-2/3">
                  <input
                    type="text"
                    id="delivery_address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block px-4 py-3 w-full text-brand-900 bg-white rounded-full border border-accent-300 appearance-none focus:outline-none focus:ring-2 focus:ring-accent-400 peer transition"
                    placeholder=" "
                  />
                  <label
                    htmlFor="delivery_address"
                    className="absolute left-4 top-3 text-gray-500 text-base pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-5 peer-focus:text-sm peer-focus:text-accent-600 bg-white px-1"
                  >
                    Delivery Address
                  </label>
                </div>
                <Button type="submit" className="mt-4 md:mt-0 text-lg">
                  Review Order ({cartItems.length}) <ShoppingBag size={20} />
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Order Review Modal */}
      {reviewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90] p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-brand-900 mb-4">Review Your Order</h3>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Deliver to:</span> {address}
            </p>
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between items-center py-2 text-sm">
                  <div>
                    <span className="font-medium">{item.product.name}</span>{" "}
                    <span className="text-gray-500">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-brand-700">
                    {formatCurrency(item.product.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t font-bold text-brand-900">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setReviewing(false)} disabled={placing}>
                Back to Edit
              </Button>
              <Button onClick={handleConfirmOrder} loading={placing}>
                {placing ? "Placing Order..." : "Confirm & Place Order"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProducts;
