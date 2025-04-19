import Cookies from "js-cookie";
import { Navigate, useLocation } from "react-router-dom";
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  const location = useLocation();
  console.log(user)

  if (!user) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User authenticated but lacks required role, redirect to home
    return <Navigate to="/" replace />;
  }

  // User authenticated and has required role
  return children;
};

export default ProtectedRoute;
