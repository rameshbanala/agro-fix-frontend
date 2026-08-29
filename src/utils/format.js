export const formatCurrency = (value) =>
  `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const orderTotal = (order) =>
  (order.items || []).reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

export const formatDateTime = (value) => new Date(value).toLocaleString();
