import { useState, useEffect } from "react";
import { Pencil, Trash } from "lucide-react";
import ProductEditForm from "./ProductEditForm";
import ProductCreateForm from "./ProductCreateForm";

const ProductListAdmin = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setError("");
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch products");
        setProducts(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProducts();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");
      setRefresh((r) => !r);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-2 sm:px-4">
      <h2 className="text-3xl font-bold text-green-700 mb-8 text-center">
        Product Catalogue
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-center">
          {error}
        </div>
      )}

      {/* Responsive: Cards on mobile, table on md+ */}
      <div className="block md:hidden mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-xl shadow p-5 flex flex-col justify-between"
            >
              {prod.image_url ? (
                <img
                  src={prod.image_url}
                  alt={prod.name}
                  className="w-full h-40 object-cover rounded mb-4"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-40 bg-green-100 flex items-center justify-center rounded mb-4 text-green-400 font-semibold">
                  No Image
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-1 truncate">
                  {prod.name}
                </h3>
                <p className="text-green-600 mb-2 line-clamp-2 min-h-[3rem]">
                  {prod.description || "No description."}
                </p>
                <p className="font-semibold text-yellow-600 mb-1">
                  Price: ₹{prod.unit_price}
                </p>
                <p
                  className={`font-semibold ${
                    prod.stock_quantity > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  Stock: {prod.stock_quantity}
                </p>
              </div>
              <div className="mt-4 flex gap-3 justify-end">
                <button
                  onClick={() => setEditingId(prod.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-green-900 rounded hover:bg-yellow-500 transition"
                  aria-label={`Edit ${prod.name}`}
                >
                  <Pencil size={18} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(prod.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  aria-label={`Delete ${prod.name}`}
                >
                  <Trash size={18} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table for md+ screens */}
      <div className="hidden md:block mt-8">
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-green-100 text-green-700">
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr
                key={prod.id}
                className="border-b hover:bg-green-50 transition"
              >
                <td className="p-3">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-16 h-16 object-cover rounded shadow"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-green-100 flex items-center justify-center rounded text-green-400">
                      No Image
                    </div>
                  )}
                </td>
                <td className="p-3 font-semibold">{prod.name}</td>
                <td className="p-3 text-gray-700">
                  {prod.description || (
                    <span className="text-gray-400">No description.</span>
                  )}
                </td>
                <td className="p-3 text-yellow-700 font-semibold">
                  ₹{prod.unit_price}
                </td>
                <td
                  className={`p-3 font-semibold ${
                    prod.stock_quantity > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {prod.stock_quantity}
                </td>
                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => setEditingId(prod.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-green-900 rounded hover:bg-yellow-500 transition"
                    aria-label={`Edit ${prod.name}`}
                  >
                    <Pencil size={18} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    aria-label={`Delete ${prod.name}`}
                  >
                    <Trash size={18} />
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingId(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close edit form"
            >
              &times;
            </button>
            <ProductEditForm
              productId={editingId}
              onProductUpdated={() => {
                setEditingId(null);
                setRefresh((r) => !r);
              }}
            />
          </div>
        </div>
      )}
      <ProductCreateForm onProductCreated={() => setRefresh((r) => !r)} />
    </div>
  );
};

export default ProductListAdmin;
