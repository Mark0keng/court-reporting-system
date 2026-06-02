import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

export const ProtectedRoute: React.FC<{
  children?: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div
        className="auth-loading-screen"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#020617",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="spinner"
            style={{
              width: "45px",
              height: "45px",
              border: "4px solid rgba(255, 255, 255, 0.05)",
              borderTop: "4px solid #38abf9",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
              boxShadow: "0 0 15px rgba(56, 171, 249, 0.2)",
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: 500,
              color: "#94a3b8",
              letterSpacing: "0.05em",
            }}
          >
            Loading Security System...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Intercept and redirect reporters and editors landing on "/"
  if (user && window.location.pathname === "/") {
    if (user.role === "reporter") {
      return <Navigate to="/reporter/jobs" replace />;
    }
    if (user.role === "editor") {
      return <Navigate to="/editor/jobs" replace />;
    }
  }

  // Guard against unauthorized roles
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const redirectPath =
      user.role === "reporter"
        ? "/reporter/jobs"
        : user.role === "editor"
          ? "/editor/jobs"
          : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
