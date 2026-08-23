import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const student = localStorage.getItem("student");

  if (!student) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

