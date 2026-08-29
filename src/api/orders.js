import client from "./client";

export const placeOrder = (data) => client.post("/orders", data).then((r) => r.data);
export const listMyOrders = () => client.get("/orders").then((r) => r.data);
export const getMyOrder = (id) => client.get(`/orders/${id}`).then((r) => r.data);
export const cancelOrder = (id) => client.put(`/orders/${id}/cancel`).then((r) => r.data);
export const listAllOrders = () => client.get("/orders/admin/orders").then((r) => r.data);
export const updateOrderStatus = (id, status) =>
  client.put(`/orders/${id}/status`, { status }).then((r) => r.data);
