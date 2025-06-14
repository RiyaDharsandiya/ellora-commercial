import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUserAuth();

  if (loading) {
    // Simple spinner (you can replace this with a fancier one)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        <span className="ml-4 text-blue-700 font-semibold">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
