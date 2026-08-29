import { useState } from "react";
import { Plus, Trash, Upload } from "lucide-react";
import * as productsApi from "../../api/products";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  unit_price: "",
  stock_quantity: "",
  image_url: "",
};

// Shared create/edit form — pass `product` to edit an existing one, or omit
// it to create a new product.
const ProductForm = ({ product, onSaved, onCancel }) => {
  const isEditing = Boolean(product);
  const [form, setForm] = useState(() =>
    product
      ? {
          name: product.name || "",
          description: product.description || "",
          category: product.category || "",
          unit_price: product.unit_price ?? "",
          stock_quantity: product.stock_quantity ?? "",
          image_url: product.image_url || "",
        }
      : emptyForm
  );
  const [tiers, setTiers] = useState(product?.price_tiers?.length ? product.price_tiers : []);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { image_url } = await productsApi.uploadProductImage(file);
      setForm((prev) => ({ ...prev, image_url }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addTier = () => setTiers((prev) => [...prev, { min_quantity: "", unit_price: "" }]);
  const updateTier = (idx, field, value) =>
    setTiers((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  const removeTier = (idx) => setTiers((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.unit_price) {
      setError("Name and unit price are required.");
      return;
    }

    const cleanTiers = tiers
      .filter((t) => t.min_quantity && t.unit_price)
      .map((t) => ({ min_quantity: parseInt(t.min_quantity, 10), unit_price: parseFloat(t.unit_price) }));

    setLoading(true);
    const payload = {
      ...form,
      unit_price: parseFloat(form.unit_price),
      stock_quantity: parseInt(form.stock_quantity || "0", 10),
      price_tiers: cleanTiers,
    };

    try {
      if (isEditing) {
        await productsApi.updateProduct(product.id, payload);
        toast.success("Product updated successfully!");
      } else {
        await productsApi.createProduct(payload);
        toast.success("Product created successfully!");
        setForm(emptyForm);
        setTiers([]);
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
        name="category"
        value={form.category}
        onChange={handleChange}
        placeholder="Category (e.g. Vegetables)"
        className="w-full px-4 py-2 border border-brand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-300"
      />
      <div className="grid grid-cols-2 gap-3">
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
      </div>

      {/* Bulk price tiers */}
      <div className="border border-brand-200 rounded-md p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-brand-700">Bulk pricing tiers (optional)</span>
          <button
            type="button"
            onClick={addTier}
            className="text-brand-600 hover:text-brand-800 flex items-center gap-1 text-sm"
          >
            <Plus size={16} /> Add tier
          </button>
        </div>
        {tiers.length === 0 && <p className="text-xs text-gray-400">No bulk pricing set.</p>}
        {tiers.map((tier, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <input
              type="number"
              min="1"
              value={tier.min_quantity}
              onChange={(e) => updateTier(idx, "min_quantity", e.target.value)}
              placeholder="Min qty"
              className="w-24 px-2 py-1 border border-brand-300 rounded text-sm"
            />
            <span className="text-xs text-gray-500">units at</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={tier.unit_price}
              onChange={(e) => updateTier(idx, "unit_price", e.target.value)}
              placeholder="Price/unit"
              className="w-24 px-2 py-1 border border-brand-300 rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeTier(idx)}
              className="text-red-500 hover:text-red-700"
              aria-label="Remove tier"
            >
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Image: upload or manual URL */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {form.image_url && (
            <img src={form.image_url} alt="Preview" className="w-14 h-14 object-cover rounded border" />
          )}
          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-brand-300 rounded-md cursor-pointer text-sm text-brand-600 hover:bg-brand-50">
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload image"}
            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={uploading} />
          </label>
        </div>
        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="...or paste an image URL"
          className="w-full px-4 py-2 border border-brand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-300"
        />
      </div>

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
