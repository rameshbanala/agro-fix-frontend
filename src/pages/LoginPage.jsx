import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { validateEmail } from "../utils/validation";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errors = {};
    const emailError = validateEmail(credentials.email);
    if (emailError) errors.email = emailError;
    if (!credentials.password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await login(credentials);
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-600 to-brand-400 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-4">
          <span className="text-3xl font-extrabold text-brand-700">
            Agro<span className="text-accent-400">Fix</span>
          </span>
        </div>
        <h2 className="text-2xl font-bold text-brand-700 text-center mb-2">Welcome Back!</h2>
        <p className="text-brand-900 text-center mb-6 font-light">Login to your account</p>
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <Input
            icon={Mail}
            type="email"
            name="email"
            placeholder="Email Address"
            value={credentials.email}
            onChange={handleChange}
            error={fieldErrors.email}
          />
          <div className="relative">
            <Input
              icon={Lock}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              error={fieldErrors.password}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-brand-400"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-2 text-center text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="flex justify-between items-center mt-4 text-sm">
          <Link to="/forgot-password" className="text-brand-700 hover:underline">
            Forgot password?
          </Link>
          <Link to="/signup" className="text-accent-500 hover:underline font-medium">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
