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
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand & Main Navigation */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-900/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                {/* Mobile clean title */}
                <span className="font-extrabold text-slate-900 text-sm tracking-tight block sm:hidden truncate leading-tight">
                  Fraud Intelligence
                </span>
                {/* Desktop full title */}
                <span className="font-extrabold text-slate-900 text-base tracking-tight hidden sm:block leading-none">
                  Insurance Fraud Intelligence
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                  Investigation & Risk Screening POC
                </span>
              </div>
            </Link>

            <nav className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200 flex-shrink-0">
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
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
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
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
