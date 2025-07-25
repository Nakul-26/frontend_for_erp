import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ element }) => {
  const { user } = useAuth(); // Assuming AuthContext provides user authentication state

  return user ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
