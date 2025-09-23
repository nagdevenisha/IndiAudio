import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("token");

  // Redirect to login if no token
  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);

    // Optional role check
    if (roles && !roles.includes(decoded.role)) {
      return <Navigate to="/unauthorized" />;
    }

    // Authorized
    return children;
  } catch (err) {
    // If token is invalid, remove it and redirect to login
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
}

export default ProtectedRoute;
