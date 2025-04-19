import { useState } from "react";

const ProductCreateForm = ({ onProductCreated }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    unit_price: "",
    stock_quantity: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          unit_price: parseFloat(form.unit_price),
          stock_quantity: parseInt(form.stock_quantity || "0", 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");
      setSuccess("Product created successfully!");
      setForm({
        name: "",
        description: "",
        unit_price: "",
        stock_quantity: "",
        image_url: "",
      });
      if (onProductCreated) onProductCreated(data);
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-8 max-w-lg mx-auto mt-8"
    >
      <h2 className="text-2xl font-bold text-green-700 mb-6">
        Add New Product
      </h2>
      <div className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          required
          className="w-full px-4 py-2 border border-green-300 rounded-md"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full px-4 py-2 border border-green-300 rounded-md"
        />
        <input
          name="unit_price"
          type="number"
          min="0"
          step="0.01"
          value={form.unit_price}
          onChange={handleChange}
          placeholder="Unit Price"
          required
          className="w-full px-4 py-2 border border-green-300 rounded-md"
        />
        <input
          name="stock_quantity"
          type="number"
          min="0"
          value={form.stock_quantity}
          onChange={handleChange}
          placeholder="Stock Quantity"
          className="w-full px-4 py-2 border border-green-300 rounded-md"
        />
        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="Image URL"
          className="w-full px-4 py-2 border border-green-300 rounded-md"
        />
      </div>
      {error && <div className="text-red-600 mt-3">{error}</div>}
      {success && <div className="text-green-600 mt-3">{success}</div>}
      <button
        type="submit"
        className="mt-6 w-full bg-yellow-400 text-green-900 font-semibold py-2 rounded-full hover:bg-yellow-500 transition"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
};

export default ProductCreateForm;
