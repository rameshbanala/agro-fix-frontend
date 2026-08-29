import client from "./client";

export const listAddresses = () => client.get("/addresses").then((r) => r.data);
export const createAddress = (data) => client.post("/addresses", data).then((r) => r.data);
export const deleteAddress = (id) => client.delete(`/addresses/${id}`).then((r) => r.data);
export const setDefaultAddress = (id) => client.put(`/addresses/${id}/default`).then((r) => r.data);
