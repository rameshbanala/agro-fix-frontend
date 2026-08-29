import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Leaf,
  ClipboardList,
  ShoppingBag,
  Users,
  Database,
  Package,
  MapPin,
  DollarSign,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const steps = [
  { icon: <ShoppingBag className="text-accent-400" size={36} />, label: "Browse Products" },
  { icon: <ClipboardList className="text-accent-400" size={36} />, label: "Place Bulk Order" },
  { icon: <Users className="text-accent-400" size={36} />, label: "Track Order" },
  { icon: <Database className="text-accent-400" size={36} />, label: "Admin Management" },
];

const features = [
  {
    icon: <Package className="mx-auto text-accent-500 mb-4" size={40} />,
    title: "Bulk Orders",
    desc: "Order large quantities of fresh vegetables and fruits with just a few clicks.",
  },
  {
    icon: <MapPin className="mx-auto text-accent-500 mb-4" size={40} />,
    title: "Location-Based Delivery",
    desc: "Get your orders delivered efficiently to your business location.",
  },
  {
    icon: <DollarSign className="mx-auto text-accent-500 mb-4" size={40} />,
    title: "Affordable Pricing",
    desc: "Benefit from competitive prices for all your bulk purchases.",
  },
];

const testimonials = [
  {
    name: "Ravi Kumar",
    text: "AgroFix made sourcing fresh produce for my restaurant effortless and affordable. Highly recommended!",
    company: "GreenLeaf Bistro",
  },
  {
    name: "Anjali Patel",
    text: "The bulk order process is smooth and the produce is always top quality. Great service!",
    company: "Patel's Grocers",
  },
  {
    name: "Vikram Singh",
    text: "I love the location-based delivery. It saves me so much time every week.",
    company: "Singh's Veg Mart",
  },
];

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  useEffect(() => {
    if (!isAuthenticated) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <div className="bg-gradient-to-b from-brand-600 to-brand-400 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center h-[80vh] text-white text-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-[400px] h-[400px] bg-accent-300 opacity-20 rounded-full blur-3xl top-[-100px] left-[-150px] animate-pulse" />
          <div className="absolute w-[300px] h-[300px] bg-white opacity-10 rounded-full blur-2xl bottom-[-100px] right-[-100px] animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col items-center animate-fadeIn">
          <Leaf className="w-16 h-16 mb-4 text-accent-300 drop-shadow-lg" />
          {isAuthenticated && user ? (
            <>
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-lg">
                Welcome back, <span className="text-accent-300">{user.name || "User"}</span>!
              </h1>
              <p className="mt-6 text-lg md:text-2xl max-w-2xl mx-auto font-light">
                {isAdmin
                  ? "Manage orders, inventory, and keep AgroFix running smoothly."
                  : "Ready to place your next bulk order or track your deliveries?"}
              </p>
              <div className="flex flex-col md:flex-row gap-6 mt-10 justify-center">
                {!isAdmin && (
                  <>
                    <Link to="/user/products">
                      <button className="flex items-center gap-2 px-8 py-4 bg-accent-400 text-brand-900 rounded-full text-xl font-semibold hover:bg-accent-500 transition shadow-lg">
                        <ShoppingBag size={24} /> Browse Catalogue
                      </button>
                    </Link>
                    <Link to="/user/orders">
                      <button className="flex items-center gap-2 px-8 py-4 bg-white text-brand-700 rounded-full text-xl font-semibold hover:bg-brand-100 transition shadow-lg border border-accent-400">
                        <ClipboardList size={24} /> Track My Orders
                      </button>
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link to="/products">
                    <button className="flex items-center gap-2 px-8 py-4 bg-accent-400 text-brand-900 rounded-full text-xl font-semibold hover:bg-accent-500 transition shadow-lg">
                      <Database size={24} /> Go to Products Catalogue
                    </button>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-lg">
                Bulk Orders Made Easy with <span className="text-accent-300">AgroFix</span>
              </h1>
              <p className="mt-6 text-lg md:text-2xl max-w-2xl mx-auto font-light">
                Order fresh vegetables and fruits in bulk, track your orders, and manage everything
                online.
              </p>
              <div className="flex flex-col md:flex-row gap-6 mt-10 justify-center">
                <Link to="/signup">
                  <button className="px-10 py-4 bg-accent-400 text-brand-900 rounded-full text-xl font-semibold hover:bg-accent-500 transition shadow-lg">
                    Get Started
                  </button>
                </Link>
                <Link to="/login">
                  <button className="px-10 py-4 bg-white text-brand-700 rounded-full text-xl font-semibold hover:bg-brand-100 transition shadow-lg border border-accent-400">
                    Login
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800">Why Choose AgroFix?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-brand-50 p-8 rounded-lg shadow-lg hover:scale-105 transition flex flex-col items-center"
              >
                {feature.icon}
                <h3 className="text-2xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-700 text-lg font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-16 bg-brand-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-8 text-brand-800">How AgroFix Works</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="bg-brand-100 rounded-full p-4 mb-3">{step.icon}</div>
                <div className="text-lg font-medium text-brand-800">{step.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section (only for logged-out visitors) */}
      {!isAuthenticated && (
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <Star className="mx-auto text-accent-400 mb-4" size={40} />
            <h2 className="text-3xl font-bold text-brand-700 mb-6">What Our Customers Say</h2>
            <div className="relative">
              <div className="bg-brand-50 rounded-xl shadow-md px-8 py-8 text-lg text-gray-800 transition-all duration-500">
                <p className="mb-4 italic">"{testimonials[currentTestimonial].text}"</p>
                <div className="font-bold text-brand-700">{testimonials[currentTestimonial].name}</div>
                <div className="text-sm text-accent-600">{testimonials[currentTestimonial].company}</div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-3 h-3 rounded-full transition ${
                      currentTestimonial === idx ? "bg-accent-400" : "bg-brand-200"
                    }`}
                    onClick={() => setCurrentTestimonial(idx)}
                    aria-label={`Show testimonial ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tech Stack Badge */}
      <section className="py-4 bg-brand-50 text-center text-brand-700 text-sm">
        Powered by React.js, Tailwind CSS, PostgreSQL (Neon.tech), Vercel
      </section>
    </div>
  );
};

export default LandingPage;
