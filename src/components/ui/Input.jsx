const Input = ({ icon: Icon, error, className = "", ...props }) => (
  <div>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3 text-brand-400" size={20} />}
      <input
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-400 transition ${
          error ? "border-red-400" : "border-brand-300"
        } ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

export default Input;
