import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import Navbar from "./components/Navbar";
import SignupPage from "./components/SignupPage";
import ProductListAdmin from "./components/ProductListAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProducts from "./components/UserProducts";
import UserOrders from "./components/UserOrders";
import AdminOrders from "./components/AdminOrders";

const App = () => {
  const userInfo = localStorage.getItem("user");
  const user = userInfo ? JSON.parse(userInfo) : null;
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/products"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <ProductListAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute user={user} allowedRoles={["admin"]}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/products"
              element={
                <ProtectedRoute user={user}>
                  <UserProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/orders"
              element={
                <ProtectedRoute user={user}>
                  <UserOrders />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
