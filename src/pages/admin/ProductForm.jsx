import { useState } from "react";
import * as productsApi from "../../api/products";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";

const emptyForm = { name: "", description: "", unit_price: "", stock_quantity: "", image_url: "" };

// Shared create/edit form — pass `product` to edit an existing one, or omit
// it to create a new product.
const ProductForm = ({ product, onSaved, onCancel }) => {
  const isEditing = Boolean(product);
  const [form, setForm] = useState(() =>
    product
      ? {
          name: product.name || "",
          description: product.description || "",
          unit_price: product.unit_price ?? "",
          stock_quantity: product.stock_quantity ?? "",
          image_url: product.image_url || "",
        }
      : emptyForm
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.unit_price) {
      setError("Name and unit price are required.");
      return;
    }

    setLoading(true);
    const payload = {
      ...form,
      unit_price: parseFloat(form.unit_price),
      stock_quantity: parseInt(form.stock_quantity || "0", 10),
    };

    try {
      if (isEditing) {
        await productsApi.updateProduct(product.id, payload);
        toast.success("Product updated successfully!");
      } else {
        await productsApi.createProduct(payload);
        toast.success("Product created successfully!");
        setForm(emptyForm);
      }
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Product Name"
        required
        autoFocus
        className="w-full px-4 py-2 border border-brand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-300"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full px-4 py-2 border border-brand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-300"
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
        className="w-full px-4 py-2 border border-brand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-300"
      />
      <input
        name="stock_quantity"
        type="number"
        min="0"
        value={form.stock_quantity}
        onChange={handleChange}
        placeholder="Stock Quantity"
        className="w-full px-4 py-2 border border-brand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-300"
      />
      <input
        name="image_url"
        value={form.image_url}
        onChange={handleChange}
        placeholder="Image URL"
        className="w-full px-4 py-2 border border-brand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-300"
      />
      {error && <div className="text-red-600 text-center text-sm">{error}</div>}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" loading={loading}>
          {isEditing ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
