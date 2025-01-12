import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("authToken");
  console.log("Authenticated:", isAuthenticated); 

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;