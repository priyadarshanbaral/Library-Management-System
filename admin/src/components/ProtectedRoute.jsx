import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const admin = localStorage.getItem("admin");

  if (!admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

