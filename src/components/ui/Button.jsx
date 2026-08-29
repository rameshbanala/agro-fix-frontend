import { Loader } from "lucide-react";

const VARIANTS = {
  primary: "bg-accent-400 text-brand-900 hover:bg-accent-500",
  secondary: "bg-white text-brand-700 border border-accent-400 hover:bg-brand-50",
  danger: "bg-red-500 text-white hover:bg-red-600",
  dangerLight: "bg-red-100 text-red-700 hover:bg-red-200",
};

const Button = ({
  variant = "primary",
  className = "",
  loading = false,
  children,
  disabled,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-semibold transition shadow disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <Loader size={18} className="animate-spin" />}
    {children}
  </button>
);

export default Button;
