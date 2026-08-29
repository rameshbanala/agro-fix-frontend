import client from "./client";

export const listUsers = () => client.get("/users").then((r) => r.data);
export const setUserRole = (id, role) => client.put(`/users/${id}/role`, { role }).then((r) => r.data);
