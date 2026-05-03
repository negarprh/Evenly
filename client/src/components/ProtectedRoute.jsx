import { Navigate, Outlet } from "react-router-dom";
import { LogoMark } from "./LogoMark";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedRoute = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="auth-backdrop flex min-h-screen items-center justify-center px-6">
        <div className="panel w-full max-w-md p-8 text-center">
          <div className="flex justify-center">
            <LogoMark />
          </div>
          <div className="mt-6 display-font text-2xl font-semibold text-ink">Loading Evenly...</div>
          <div className="mt-3 text-sm text-slate-500">Bringing your groups, balances, and shared expenses into view.</div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
