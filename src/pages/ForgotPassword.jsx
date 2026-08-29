import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import * as authApi from "../api/auth";
import { validateEmail } from "../utils/validation";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const emailError = validateEmail(email);
    setFieldError(emailError);
    if (emailError) return;

    setIsLoading(true);
    try {
      const data = await authApi.forgotPassword(email);
      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-600 to-brand-400 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-4">
          <span className="text-3xl font-extrabold text-brand-700">
            Agro<span className="text-accent-400">Fix</span>
          </span>
        </div>
        <h2 className="text-2xl font-bold text-brand-700 text-center mb-2">Forgot Password</h2>
        <p className="text-brand-900 text-center mb-6 font-light">
          Enter your email to receive a password reset link
        </p>

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
          <Input
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            error={fieldError}
          />

          <Button type="submit" className="w-full" loading={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="flex justify-center mt-6">
          <Link to="/login" className="flex items-center text-brand-700 hover:text-brand-800 text-sm font-medium">
            <ArrowLeft size={16} className="mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
