import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {

  const token =
    localStorage.getItem("token");

  // TOKEN EXISTS
  if (token) {

    return children;
  }

  // NO TOKEN
  return <Navigate to="/login" />;
}