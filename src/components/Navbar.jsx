import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Cookies from "js-cookie";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Check login status
  const isLogin = Cookies.get("token") !== undefined;
  const user = localStorage.getItem("user");
  const userData = user ? JSON.parse(user) : null;
  const userRole = userData ? userData.role : null;

  // Define links based on login status
  const loggedInLinks = [
    { name: "Home", path: "/" },
    {
      name: "Products",
      path: userRole === "admin" ? "/products" : "/user/products",
    },
    { name: "Orders", path: userRole === "admin" ? "/orders" : "/user/orders" },
  ];

  const authLinks = [
    { name: "Login", path: "/login" },
    { name: "Signup", path: "/signup" },
  ];

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    alert("Logged out successfully!");
    window.location.reload();
  };

  // Helper to highlight active link
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-green-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-wide">
          Agro<span className="text-yellow-300">Fix</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center">
          {isLogin
            ? loggedInLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`hover:text-yellow-200 transition font-medium ${
                    isActive(link.path) ? "underline underline-offset-4" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))
            : authLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`hover:text-yellow-200 transition font-medium ${
                    isActive(link.path) ? "underline underline-offset-4" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
          {/* Logout button for logged-in users */}
          {isLogin && (
            <button
              onClick={handleLogout}
              className="ml-4 bg-yellow-400 text-green-900 px-4 py-1 rounded-full font-semibold hover:bg-yellow-500 transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-700 px-4 pb-4 space-y-2">
          {(isLogin ? loggedInLinks : authLinks).map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block text-white hover:text-yellow-200 transition font-medium ${
                isActive(link.path) ? "underline underline-offset-4" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
          {isLogin && (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left bg-yellow-400 text-green-900 px-4 py-2 rounded-full font-semibold hover:bg-yellow-500 transition mt-2"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
