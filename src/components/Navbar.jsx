import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const { itemCount } = useCart();

  const userRole = user?.role ?? null;
  const isBuyer = isAuthenticated && userRole !== "admin";

  const loggedInLinks = [
    { name: "Home", path: "/" },
    {
      name: "Products",
      path: userRole === "admin" ? "/products" : "/user/products",
      badge: isBuyer ? itemCount : 0,
    },
    { name: "Orders", path: userRole === "admin" ? "/orders" : "/user/orders" },
    ...(userRole === "admin"
      ? [
          { name: "Analytics", path: "/admin/analytics" },
          { name: "Users", path: "/admin/users" },
        ]
      : []),
  ];

  const authLinks = [
    { name: "Login", path: "/login" },
    { name: "Signup", path: "/signup" },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const links = isAuthenticated ? loggedInLinks : authLinks;

  return (
    <nav className="bg-brand-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-wide">
          Agro<span className="text-accent-300">Fix</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`relative hover:text-accent-200 transition font-medium ${
                isActive(link.path) ? "underline underline-offset-4" : ""
              }`}
            >
              {link.name}
              {Boolean(link.badge) && (
                <span className="absolute -top-2 -right-3 bg-accent-400 text-brand-900 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="ml-4 bg-accent-400 text-brand-900 px-4 py-1 rounded-full font-semibold hover:bg-accent-500 transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-brand-700 px-4 pb-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block text-white hover:text-accent-200 transition font-medium ${
                isActive(link.path) ? "underline underline-offset-4" : ""
              }`}
            >
              {link.name}
              {Boolean(link.badge) && (
                <span className="ml-2 inline-flex bg-accent-400 text-brand-900 text-xs font-bold rounded-full w-4 h-4 items-center justify-center">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left bg-accent-400 text-brand-900 px-4 py-2 rounded-full font-semibold hover:bg-accent-500 transition mt-2"
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
