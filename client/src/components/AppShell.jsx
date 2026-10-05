import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { ShieldAlert, ListFilter, LogOut, UserCheck } from "lucide-react";

export const AppShell = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isQueueActive = location.pathname === "/" || location.pathname.startsWith("/claims");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Main Navigation */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-900/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-base block leading-none">
                  Insurance Fraud Intelligence
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5 block">
                  Investigation & Risk Screening POC
                </span>
              </div>
            </Link>

            <nav className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isQueueActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                Claims Queue
              </Link>
            </nav>
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-slate-800 leading-tight">
                  {user?.name || "Maya Chen"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
                  Lead Fraud Analyst
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              id="btn-sign-out"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-semibold transition-all"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
