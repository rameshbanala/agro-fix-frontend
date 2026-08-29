import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ShoppingBag, Search, ChevronLeft, ChevronRight } from "lucide-react";
import * as productsApi from "../../api/products";
import * as ordersApi from "../../api/orders";
import * as addressesApi from "../../api/addresses";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { formatCurrency } from "../../utils/format";

const UserProducts = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [address, setAddress] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);

  const [reviewing, setReviewing] = useState(false);
  const [placing, setPlacing] = useState(false);
  const { cart, setQuantity, clearCart } = useCart();
  const toast = useToast();

  // If we arrived here via a "Reorder" action, the cart was already
  // pre-filled by UserOrders — nothing further to do here.
  useEffect(() => {
    if (location.state?.reordered) {
      toast.success("Items from that order have been added to your cart.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    productsApi.listCategories().then(setCategories).catch(() => {});
    addressesApi
      .listAddresses()
      .then((data) => {
        setAddresses(data);
        const def = data.find((a) => a.is_default);
        if (def) {
          setSelectedAddressId(def.id);
          setAddress(def.address_text);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setLoadError("");
      try {
        const result = await productsApi.listProducts({
          search: search || undefined,
          category: category || undefined,
          sort,
          page: pagination.page,
          limit: pagination.limit,
        });
        setProducts(result.products);
        setPagination(result.pagination);
      } catch (err) {
        setLoadError(err.message || "Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort, pagination.page]);

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

  const priceFor = (product, quantity) => {
    const tiers = product.price_tiers || [];
    const applicable = tiers
      .filter((t) => quantity >= t.min_quantity)
      .sort((a, b) => b.min_quantity - a.min_quantity);
    return applicable.length ? applicable[0].unit_price : product.unit_price;
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + priceFor(item.product, item.quantity) * item.quantity,
    0
  );

  const handleAddressSelect = (e) => {
    const value = e.target.value;
    setSelectedAddressId(value);
    if (value === "new") {
      setAddress("");
    } else {
      const found = addresses.find((a) => String(a.id) === value);
      setAddress(found ? found.address_text : "");
    }
  };

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
      if (selectedAddressId === "new" && saveAddress) {
        await addressesApi.createAddress({ address_text: address, is_default: addresses.length === 0 });
      }
      const data = await ordersApi.placeOrder({
        delivery_address: address,
        items: cartItems.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
      });
      toast.success(`Order placed! Order ID: ${data.order_id}`);
      clearCart();
      setReviewing(false);
      const refreshed = await productsApi.listProducts({ page: pagination.page, limit: pagination.limit });
      setProducts(refreshed.products);
      setPagination(refreshed.pagination);
    } catch (err) {
      toast.error(err.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-brand-600 to-brand-400 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center h-[40vh] text-white text-center px-6 overflow-hidden">
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

      <section className="flex-1 py-10 px-2 md:px-0">
        <div className="max-w-6xl mx-auto">
          {/* Filter bar */}
          <div className="bg-white rounded-xl shadow p-4 mb-8 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-brand-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 border border-brand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 border border-brand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-400"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 border border-brand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-400"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>

          {loadError && (
            <div className="bg-red-100 text-red-700 rounded-lg p-4 mb-6 text-center shadow">{loadError}</div>
          )}

          {loadingProducts ? (
            <Spinner />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-brand-800 mb-8">
              No products match your search.
            </div>
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
                    {product.category && (
                      <span className="text-[10px] uppercase tracking-wide text-accent-600 font-semibold mb-1">
                        {product.category}
                      </span>
                    )}
                    <h2 className="text-lg font-semibold text-brand-800 mb-1 text-center">
                      {product.name}
                    </h2>
                    <div className="text-brand-700 font-medium text-base mb-1">
                      {formatCurrency(product.unit_price)}{" "}
                      <span className="text-xs font-light">per unit</span>
                    </div>
                    {product.price_tiers?.length > 0 && (
                      <div className="text-[11px] text-brand-500 mb-1 text-center">
                        {product.price_tiers.map((t) => (
                          <div key={t.min_quantity}>
                            {t.min_quantity}+ units: {formatCurrency(t.unit_price)}/unit
                          </div>
                        ))}
                      </div>
                    )}
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
                      onChange={(e) =>
                        setQuantity(product.id, Math.min(Number(e.target.value), product.stock_quantity))
                      }
                      placeholder="Qty"
                      className="w-20 px-2 py-1 border border-accent-300 rounded-full mb-2 text-center focus:outline-none focus:ring-2 focus:ring-accent-400 transition"
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 text-white">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    className="disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </button>
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    className="disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}

              {/* Delivery Address & CTA */}
              <div className="flex flex-col gap-4 mt-8 bg-white rounded-xl shadow p-6">
                {addresses.length > 0 && (
                  <select
                    value={selectedAddressId}
                    onChange={handleAddressSelect}
                    className="px-4 py-2 border border-accent-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-400"
                  >
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}: {a.address_text}
                      </option>
                    ))}
                    <option value="new">+ Use a new address</option>
                  </select>
                )}
                {(selectedAddressId === "new" || addresses.length === 0) && (
                  <>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Delivery address"
                      rows={2}
                      className="block px-4 py-3 w-full text-brand-900 bg-white rounded-lg border border-accent-300 focus:outline-none focus:ring-2 focus:ring-accent-400 transition"
                    />
                    <label className="flex items-center gap-2 text-sm text-brand-700">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                      />
                      Save this address for next time
                    </label>
                  </>
                )}
                <Button type="submit" className="self-start text-lg">
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
                    {formatCurrency(priceFor(item.product, item.quantity) * item.quantity)}
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
