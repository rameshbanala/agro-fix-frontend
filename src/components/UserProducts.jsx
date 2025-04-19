import React, { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import Cookies from "js-cookie";

// Helper to get auth token
const getToken = () => Cookies.get("token") || "";

const UserProducts = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setError(null);
      try {
        const res = await fetch(
          import.meta.env.VITE_BACKEND_URL + "/products",
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setProducts(data);
      } catch {
        setError("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  const handleQuantity = (productId, quantity) => {
    setCart((prev) => ({
      ...prev,
      [productId]: Math.max(0, quantity),
    }));
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrderSuccess(null);
    setError(null);

    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([product_id, quantity]) => ({
        product_id: Number(product_id),
        quantity,
      }));

    if (!address || items.length === 0) {
      setError(
        "Please provide a delivery address and select at least one product."
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ delivery_address: address, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      setOrderSuccess(`Order placed! Order ID: ${data.order_id}`);
      setCart({});
      setAddress("");
      //location.reload(); // Reload to fetch updated product stock
    } catch (err) {
      setError(err.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-green-600 to-green-400 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center h-[50vh] text-white text-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[320px] h-[320px] bg-yellow-300 opacity-20 rounded-full blur-3xl top-[-60px] left-[-100px] animate-pulse" />
          <div className="absolute w-[200px] h-[200px] bg-white opacity-10 rounded-full blur-2xl bottom-[-60px] right-[-60px] animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col items-center animate-fadeIn">
          <ShoppingBag className="w-14 h-14 mb-4 text-yellow-300 drop-shadow-lg" />
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
          {/* Feedback */}
          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-6 text-center shadow">
              {error}
            </div>
          )}
          {orderSuccess && (
            <div className="bg-green-100 text-green-700 rounded-lg p-4 mb-6 text-center shadow">
              {orderSuccess}
            </div>
          )}

          <form onSubmit={handleOrder} className="space-y-10">
            {/* Product List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-5 flex flex-col items-center border border-green-100"
                >
                  {/* Product Image */}
                  <div className="w-28 h-28 mb-3 bg-green-50 rounded-lg overflow-hidden flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-yellow-400">
                        <ShoppingBag size={40} />
                      </div>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-green-800 mb-1 text-center">
                    {product.name}
                  </h2>
                  <div className="text-green-700 font-medium text-base mb-1">
                    ₹{product.unit_price}{" "}
                    <span className="text-xs font-light">per unit</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    In stock: {product.stock_quantity}
                  </div>
                  <p className="text-gray-600 text-xs mb-3 text-center min-h-[32px]">
                    {product.description?.slice(0, 50) || "No description."}
                    {product.description && product.description.length > 50
                      ? "..."
                      : ""}
                  </p>
                  <input
                    type="number"
                    min={0}
                    max={product.stock_quantity}
                    value={cart[product.id] || ""}
                    onChange={(e) =>
                      handleQuantity(product.id, Number(e.target.value))
                    }
                    placeholder="Qty"
                    className="w-20 px-2 py-1 border border-yellow-300 rounded-full mb-2 text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                  />
                </div>
              ))}
            </div>

            {/* Delivery Address & CTA */}
            <div className="flex flex-col md:flex-row items-center gap-4 mt-8">
              <div className="relative w-full md:w-2/3">
                <input
                  type="text"
                  id="delivery_address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block px-4 py-3 w-full text-green-900 bg-white rounded-full border border-yellow-300 appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400 peer transition"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="delivery_address"
                  className="absolute left-4 top-3 text-gray-500 text-base pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-5 peer-focus:text-sm peer-focus:text-yellow-600 bg-white px-1"
                >
                  Delivery Address
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-yellow-400 text-green-900 rounded-full text-lg font-bold hover:bg-yellow-500 transition shadow flex items-center gap-2 mt-4 md:mt-0"
              >
                {loading ? (
                  <span className="animate-pulse">Placing Order...</span>
                ) : (
                  <>
                    Place Order <ShoppingBag size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
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

export default UserProducts;
