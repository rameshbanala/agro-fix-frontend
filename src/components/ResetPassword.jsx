import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(true);

  // Get token and id from URL
  const token = searchParams.get("token");
  const id = searchParams.get("id");

  useEffect(() => {
    if (!token || !id) {
      setTokenValid(false);
      setError("Invalid password reset link");
    }
  }, [token, id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 8) {
      return setError("Password must be at least 8 characters long");
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            id,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setMessage(data.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-600 to-green-400 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-green-900 mb-6">
            The password reset link is invalid or has expired.
          </p>
          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="block w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold py-2 rounded-full transition"
            >
              Request New Link
            </Link>
            <Link
              to="/login"
              className="block w-full bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2 rounded-full transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-600 to-green-400 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-4">
          <span className="text-3xl font-extrabold text-green-700">
            Agro<span className="text-yellow-400">Fix</span>
          </span>
        </div>
        <h2 className="text-2xl font-bold text-green-700 text-center mb-2">
          Reset Password
        </h2>
        <p className="text-green-900 text-center mb-6 font-light">
          Create a new secure password
        </p>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-3 mb-4 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-green-400" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="New Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-10 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-yellow-400 transition"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-green-400"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-green-400" size={20} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-10 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-yellow-400 transition"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-green-400"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold py-2 rounded-full transition"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
