import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const ProductEditForm = ({ productId, onProductUpdated }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = Cookies.get("token");
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError("");
    fetch(`${import.meta.env.VITE_BACKEND_URL}/products/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load product");
        setLoading(false);
      });
  }, [productId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            unit_price: parseFloat(form.unit_price),
            stock_quantity: parseInt(form.stock_quantity || "0", 10),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update product");
      setSuccess("Product updated successfully!");
      if (onProductUpdated) onProductUpdated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!form) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        value={form.name || ""}
        onChange={handleChange}
        placeholder="Product Name"
        required
        className="w-full px-4 py-2 border border-green-300 rounded-md"
      />
      <textarea
        name="description"
        value={form.description || ""}
        onChange={handleChange}
        placeholder="Description"
        className="w-full px-4 py-2 border border-green-300 rounded-md"
      />
      <input
        name="unit_price"
        type="number"
        min="0"
        step="0.01"
        value={form.unit_price || ""}
        onChange={handleChange}
        placeholder="Unit Price"
        required
        className="w-full px-4 py-2 border border-green-300 rounded-md"
      />
      <input
        name="stock_quantity"
        type="number"
        min="0"
        value={form.stock_quantity || ""}
        onChange={handleChange}
        placeholder="Stock Quantity"
        className="w-full px-4 py-2 border border-green-300 rounded-md"
      />
      <input
        name="image_url"
        value={form.image_url || ""}
        onChange={handleChange}
        placeholder="Image URL"
        className="w-full px-4 py-2 border border-green-300 rounded-md"
      />
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <button
        type="submit"
        className="w-full bg-yellow-400 text-green-900 font-semibold py-2 rounded-full hover:bg-yellow-500 transition"
        disabled={saving}
      >
        {saving ? "Saving..." : "Update Product"}
      </button>
    </form>
  );
};

export default ProductEditForm;
