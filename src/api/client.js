import axios from "axios";
import Cookies from "js-cookie";

const client = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

client.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization);

    // A 401 on an authenticated request means the session/token is no
    // longer valid — clear it and send the user back to login. A 401 from
    // a public endpoint (e.g. wrong login credentials) is a normal,
    // expected error and should just be shown on the page that asked.
    if (error.response?.status === 401 && hadAuthHeader) {
      Cookies.remove("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const message = error.response?.data?.error || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default client;
