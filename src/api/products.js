import client from "./client";

export const listProducts = (params = {}) => client.get("/products", { params }).then((r) => r.data);
export const listCategories = () => client.get("/products/categories").then((r) => r.data);
export const getProduct = (id) => client.get(`/products/${id}`).then((r) => r.data);
export const createProduct = (data) => client.post("/products", data).then((r) => r.data);
export const updateProduct = (id, data) => client.put(`/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id) => client.delete(`/products/${id}`).then((r) => r.data);

// Content-Type is deliberately left unset here — the browser fills in
// "multipart/form-data" with the correct boundary itself when the body is
// a FormData instance. Setting it manually would omit that boundary and
// break the upload.
export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return client.post("/products/upload", formData).then((r) => r.data);
};

export const importProductsCsv = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return client.post("/products/import", formData).then((r) => r.data);
};
