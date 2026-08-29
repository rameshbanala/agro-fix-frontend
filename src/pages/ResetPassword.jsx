import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import * as authApi from "../api/auth";
import { validatePassword } from "../utils/validation";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(true);

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
    setError("");

    const passwordError = validatePassword(formData.password);
    if (passwordError) return setError(passwordError);
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setIsLoading(true);
    try {
      const data = await authApi.resetPassword({ token, id, password: formData.password });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-600 to-brand-400 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-brand-700 mb-2">Invalid Reset Link</h2>
          <p className="text-brand-900 mb-6">The password reset link is invalid or has expired.</p>
          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="block w-full bg-accent-400 hover:bg-accent-500 text-brand-900 font-semibold py-2 rounded-full transition"
            >
              Request New Link
            </Link>
            <Link
              to="/login"
              className="block w-full bg-brand-100 hover:bg-brand-200 text-brand-700 font-semibold py-2 rounded-full transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-600 to-brand-400 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-4">
          <span className="text-3xl font-extrabold text-brand-700">
            Agro<span className="text-accent-400">Fix</span>
          </span>
        </div>
        <h2 className="text-2xl font-bold text-brand-700 text-center mb-2">Reset Password</h2>
        <p className="text-brand-900 text-center mb-6 font-light">Create a new secure password</p>

        {message && (
          <div className="bg-brand-50 border border-brand-200 text-brand-700 rounded-md p-3 mb-4 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 mb-4 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="relative">
            <Input
              icon={Lock}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="New Password"
              value={formData.password}
              onChange={handleChange}
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

          <div className="relative">
            <Input
              icon={Lock}
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-brand-400"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
