import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Package, AlertTriangle, ClipboardList } from "lucide-react";
import * as analyticsApi from "../../api/analytics";
import Spinner from "../../components/ui/Spinner";
import { formatCurrency } from "../../utils/format";

const StatTile = (props) => {
  const Icon = props.icon;
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <div className="bg-brand-100 text-brand-700 rounded-full p-3">
        <Icon size={24} />
      </div>
      <div>
        <div className="text-2xl font-bold text-brand-900">{props.value}</div>
        <div className="text-sm text-gray-500">{props.label}</div>
      </div>
    </div>
  );
};

const RevenueTrendChart = ({ trend }) => {
  const max = Math.max(1, ...trend.map((d) => d.revenue));
  return (
    <div className="flex gap-1 h-40" role="img" aria-label="Revenue over the last 14 days">
      {trend.map((d) => (
        <div key={d.day} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
          <span className="text-[10px] text-brand-700 font-medium">
            {d.revenue > 0 ? formatCurrency(d.revenue) : ""}
          </span>
          <div
            className="w-full bg-brand-500 rounded-t"
            style={{ height: `${Math.max(2, (d.revenue / max) * 100)}%` }}
          />
          <span className="text-[10px] text-gray-400">
            {new Date(d.day).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
          </span>
        </div>
      ))}
    </div>
  );
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    analyticsApi
      .getAnalyticsSummary()
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load analytics"));
  }, []);

  if (error) return <div className="max-w-6xl mx-auto mt-10 px-4 text-red-600 text-center">{error}</div>;
  if (!data) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-2 sm:px-4 pb-16">
      <h2 className="text-3xl font-bold text-brand-700 mb-8 text-center">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile icon={TrendingUp} label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
        <StatTile icon={ClipboardList} label="Total Orders" value={data.totalOrders} />
        <StatTile
          icon={Package}
          label="Delivered Orders"
          value={data.ordersByStatus.delivered || 0}
        />
        <StatTile
          icon={AlertTriangle}
          label={`Low Stock (< ${data.lowStockThreshold})`}
          value={data.lowStockProducts.length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-brand-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} /> Revenue — Last 14 Days
          </h3>
          {data.revenueTrend.length === 0 ? (
            <p className="text-sm text-gray-400">No orders in this period yet.</p>
          ) : (
            <RevenueTrendChart trend={data.revenueTrend} />
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-brand-800 mb-4">Top Products</h3>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-gray-400">No sales yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.topProducts.map((p, idx) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-brand-800">
                    {idx + 1}. {p.name}
                  </span>
                  <span className="font-semibold text-brand-600">{p.totalQuantity} units</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-brand-800 mb-4">Orders by Status</h3>
          <ul className="space-y-2">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <li key={status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-brand-800">{status.replace("_", " ")}</span>
                <span className="font-semibold text-brand-600">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-brand-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-500" /> Low Stock Products
          </h3>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing running low right now.</p>
          ) : (
            <ul className="space-y-2">
              {data.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-brand-800">{p.name}</span>
                  <span className="font-semibold text-red-500">{p.stock_quantity} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
