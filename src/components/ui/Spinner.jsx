import { Loader } from "lucide-react";

const Spinner = ({ size = 40, className = "" }) => (
  <div className={`flex justify-center items-center py-16 ${className}`}>
    <Loader className="animate-spin text-accent-400" size={size} />
  </div>
);

export default Spinner;
