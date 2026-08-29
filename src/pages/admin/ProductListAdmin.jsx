import { useState, useEffect } from "react";
import { Pencil, Trash, Upload } from "lucide-react";
import * as productsApi from "../../api/products";
import { useToast } from "../../context/ToastContext";
import ProductForm from "./ProductForm";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const ProductListAdmin = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const toast = useToast();

  const loadProducts = async () => {
    setError("");
    try {
      const data = await productsApi.listProducts({ limit: 100 });
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCsvSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const result = await productsApi.importProductsCsv(file);
      if (result.createdCount) toast.success(`Imported ${result.createdCount} product(s).`);
      if (result.errors?.length) {
        toast.error(`${result.errors.length} row(s) failed: ${result.errors[0].error}`);
      }
      loadProducts();
    } catch (err) {
      toast.error(err.message || "CSV import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productsApi.deleteProduct(deleteTarget.id);
      toast.success("Product deleted successfully.");
      setDeleteTarget(null);
      loadProducts();
    } catch (err) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-2 sm:px-4 pb-16">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold text-brand-700 text-center">Product Catalogue</h2>
        <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-brand-400 rounded-md cursor-pointer text-sm text-brand-700 hover:bg-brand-50">
          <Upload size={16} />
          {importing ? "Importing..." : "Import CSV"}
          <input type="file" accept=".csv" onChange={handleCsvSelect} className="hidden" disabled={importing} />
        </label>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-center">{error}</div>
      )}

      {/* Cards on mobile */}
      <div className="block md:hidden mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map((prod) => (
            <div key={prod.id} className="bg-white rounded-xl shadow p-5 flex flex-col justify-between">
              {prod.image_url ? (
                <img
                  src={prod.image_url}
                  alt={prod.name}
                  className="w-full h-40 object-cover rounded mb-4"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-40 bg-brand-100 flex items-center justify-center rounded mb-4 text-brand-400 font-semibold">
                  No Image
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-brand-800 mb-1 truncate">{prod.name}</h3>
                <p className="text-brand-600 mb-2 line-clamp-2 min-h-[3rem]">
                  {prod.description || "No description."}
                </p>
                <p className="font-semibold text-accent-600 mb-1">Price: ₹{prod.unit_price}</p>
                <p className={`font-semibold ${prod.stock_quantity > 0 ? "text-brand-600" : "text-red-500"}`}>
                  Stock: {prod.stock_quantity}
                </p>
              </div>
              <div className="mt-4 flex gap-3 justify-end">
                <Button variant="primary" onClick={() => setEditingProduct(prod)} aria-label={`Edit ${prod.name}`}>
                  <Pencil size={18} /> Edit
                </Button>
                <Button variant="danger" onClick={() => setDeleteTarget(prod)} aria-label={`Delete ${prod.name}`}>
                  <Trash size={18} /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table for md+ screens */}
      <div className="hidden md:block mt-8">
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-brand-100 text-brand-700">
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
              <tr key={prod.id} className="border-b hover:bg-brand-50 transition">
                <td className="p-3">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-16 h-16 object-cover rounded shadow"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-brand-100 flex items-center justify-center rounded text-brand-400">
                      No Image
                    </div>
                  )}
                </td>
                <td className="p-3 font-semibold">{prod.name}</td>
                <td className="p-3 text-gray-700">
                  {prod.description || <span className="text-gray-400">No description.</span>}
                </td>
                <td className="p-3 text-accent-700 font-semibold">₹{prod.unit_price}</td>
                <td className={`p-3 font-semibold ${prod.stock_quantity > 0 ? "text-brand-600" : "text-red-500"}`}>
                  {prod.stock_quantity}
                </td>
                <td className="p-3 flex gap-3">
                  <Button variant="primary" onClick={() => setEditingProduct(prod)} aria-label={`Edit ${prod.name}`}>
                    <Pencil size={18} /> Edit
                  </Button>
                  <Button variant="danger" onClick={() => setDeleteTarget(prod)} aria-label={`Delete ${prod.name}`}>
                    <Trash size={18} /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90] p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close edit form"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-brand-700 mb-6 text-center">Edit Product</h2>
            <ProductForm
              product={editingProduct}
              onSaved={() => {
                setEditingProduct(null);
                loadProducts();
              }}
              onCancel={() => setEditingProduct(null)}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg mx-auto mt-10">
        <h2 className="text-2xl font-bold text-brand-700 mb-6 text-center">Add New Product</h2>
        <ProductForm onSaved={loadProducts} />
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this product?"
        message={`"${deleteTarget?.name}" will be permanently removed from the catalogue.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProductListAdmin;
