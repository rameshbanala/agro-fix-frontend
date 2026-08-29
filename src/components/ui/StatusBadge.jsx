const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  delivered: "bg-brand-100 text-brand-700",
  cancelled: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-500"
    }`}
  >
    {status.replace("_", " ").toUpperCase()}
  </span>
);

export default StatusBadge;
