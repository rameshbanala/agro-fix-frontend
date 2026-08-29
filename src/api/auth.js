import client from "./client";

export const signup = (data) => client.post("/auth/signup", data).then((r) => r.data);
export const login = (data) => client.post("/auth/login", data).then((r) => r.data);
export const forgotPassword = (email) =>
  client.post("/auth/forgot-password", { email }).then((r) => r.data);
export const resetPassword = (payload) =>
  client.post("/auth/reset-password", payload).then((r) => r.data);
