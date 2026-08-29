const EmptyState = ({ title, description }) => (
  <div className="bg-white rounded-xl shadow p-8 text-center text-brand-800">
    <p className="text-xl font-semibold mb-2">{title}</p>
    {description && <p className="text-gray-500">{description}</p>}
  </div>
);

export default EmptyState;
